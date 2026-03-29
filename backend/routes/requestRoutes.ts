// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import express from "express";
import RequestModel from "../models/Request";
import { requireAuth, type AuthenticatedRequest } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createRequestSchema, patchRequestSchema } from "../valdators/requestValidators";
import User from "../models/User";

const router = express.Router();

function hasReviewerRole(authUser: NonNullable<AuthenticatedRequest["authUser"]>) {
  const roles = authUser.roles ?? [];
  return roles.some(role => {
    const normalized = role.toUpperCase();
    return normalized === "REVIEWER" || normalized === "ADMIN";
  }) || authUser.email.toLowerCase() === "admin@admin.com";
}

function serializeRequest(doc: {
  _id: unknown;
  ownerEmail: string;
  title: string;
  fullName: string;
  companyType?: string;
  company?: string;
  companyAddress?: string;
  email: string;
  phoneNumber?: string;
  linkedIn?: string;
  website?: string;
  createdAt?: Date | string;
  status?: string;
  priority?: number;
  description: string;
  reviewer?: string;
  decisionReason?: string;
}) {
  return {
    id: String(doc._id),
    ownerEmail: doc.ownerEmail,
    requestTitle: doc.title,
    requester: doc.fullName,
    role: doc.companyType || "other",
    companyName: doc.company || "",
    companyLocation: doc.companyAddress || "",
    companyType: doc.companyType || "",
    contactEmail: doc.email,
    contactPhone: doc.phoneNumber || "",
    contactLinkedIn: doc.linkedIn || "",
    website: doc.website || "",
    submittedAt: doc.createdAt ? new Date(doc.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: String(doc.status || "pending").toLowerCase(),
    priorityScore: Number(doc.priority ?? 3),
    details: doc.description,
    reviewer: doc.reviewer || "",
    decisionReason: doc.decisionReason || "",
    appealMessage: "",
  };
}

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser;
  if (!authUser) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const isReviewer = hasReviewerRole(authUser);
  const filter = isReviewer ? {} : { ownerEmail: authUser.email };

  const docs = await RequestModel.find(filter).sort({ createdAt: -1 }).lean();

  const data = docs.map(doc => serializeRequest(doc));

  return res.json({ status: "ok", data });
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser;
  if (!authUser) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const doc = await RequestModel.findById(id).lean();
  if (!doc) {
    return res.status(404).json({ status: "error", message: "Request not found" });
  }

  const isAdmin = authUser.roles?.includes("admin") || authUser.roles?.includes("ADMIN");
  const isOwner = doc.ownerEmail === authUser.email;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }

  await RequestModel.findByIdAndDelete(id);
  return res.json({ status: "ok" });
});

router.post("/", requireAuth, validate(createRequestSchema), async (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser;
  if (!authUser) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const payload = req.body as {
    ownerEmail?: string;
    requestTitle: string;
    requester: string;
    role: string;
    companyName: string;
    companyLocation: string;
    companyType: string;
    contactEmail: string;
    contactPhone: string;
    contactLinkedIn?: string;
    website?: string;
    details: string;
    status?: "pending" | "draft";
  };

  const ownerEmail = payload.ownerEmail || authUser.email;

  const created = await RequestModel.create({
    ownerEmail,
    title: payload.requestTitle,
    description: payload.details,
    email: payload.contactEmail,
    fullName: payload.requester,
    phoneNumber: payload.contactPhone || "",
    company: payload.companyName || "",
    companyType: payload.companyType || payload.role || "",
    companyAddress: payload.companyLocation || "",
    priority: 3,
    linkedIn: payload.contactLinkedIn || "",
    website: payload.website || "",
    reviewer: "",
    decisionReason: "",
    status: (payload.status || "pending").toUpperCase(),
  });

  return res.status(201).json({
    status: "ok",
    data: serializeRequest(created),
  });
});

router.patch("/:id", requireAuth, validate(patchRequestSchema), async (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser;
  if (!authUser) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const payload = req.body as {
    priorityScore?: number;
    status?: "approved" | "denied";
    decisionReason?: string;
  };

  const isReviewUpdate = typeof payload.priorityScore === "number"
    || Boolean(payload.status)
    || typeof payload.decisionReason === "string";
  if (isReviewUpdate && !hasReviewerRole(authUser)) {
    return res.status(403).json({
      status: "error",
      message: "Only users with REVIEWER role can review requests.",
    });
  }

  const update: Record<string, unknown> = {};
  if (typeof payload.priorityScore === "number")
    update.priority = payload.priorityScore;

  if (payload.status)
    update.status = payload.status.toUpperCase();

  if (typeof payload.decisionReason === "string") {
    update.decisionReason = payload.decisionReason;
    const reviewerUser = await User.findById(authUser.id).select("fullName").lean();
    update.reviewer = reviewerUser?.fullName || authUser.email;
  }

  const updated = await RequestModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!updated) {
    return res.status(404).json({ status: "error", message: "Request not found" });
  }

  return res.json({
    status: "ok",
    data: serializeRequest(updated),
  });
});

export default router;

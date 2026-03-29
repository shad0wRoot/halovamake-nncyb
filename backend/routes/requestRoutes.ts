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

const router = express.Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const authUser = req.authUser;
  if (!authUser) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const isAdmin = authUser.roles?.includes("admin") || authUser.roles?.includes("ADMIN");
  const filter = isAdmin ? {} : { ownerEmail: authUser.email };

  const docs = await RequestModel.find(filter).sort({ createdAt: -1 }).lean();

  const data = docs.map(doc => ({
    id: String(doc._id),
    ownerEmail: doc.ownerEmail,
    requestTitle: doc.title,
    requester: doc.fullName,
    role: doc.companyType || "other",
    companyName: doc.company,
    companyLocation: doc.companyAddress,
    companyType: doc.companyType,
    contactEmail: doc.email,
    contactPhone: doc.phoneNumber,
    contactLinkedIn: doc.linkedIn,
    website: doc.website,
    submittedAt: doc.createdAt ? new Date(doc.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: String(doc.status || "pending").toLowerCase(),
    priorityScore: Number(doc.priority ?? 3),
    details: doc.description,
    decisionReason: doc.reviewer || "",
    appealMessage: "",
  }));

  return res.json({ status: "ok", data });
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
    status: "PENDING",
  });

  return res.status(201).json({
    status: "ok",
    data: {
      id: String(created._id),
      ownerEmail: created.ownerEmail,
      requestTitle: created.title,
      requester: created.fullName,
      role: payload.role,
      companyName: created.company,
      companyLocation: created.companyAddress,
      companyType: created.companyType,
      contactEmail: created.email,
      contactPhone: created.phoneNumber,
      contactLinkedIn: created.linkedIn,
      website: created.website,
      submittedAt: created.createdAt.toISOString().slice(0, 10),
      status: String(created.status).toLowerCase(),
      priorityScore: Number(created.priority ?? 3),
      details: created.description,
      decisionReason: created.reviewer || "",
      appealMessage: "",
    },
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

  const update: Record<string, unknown> = {};
  if (typeof payload.priorityScore === "number")
    update.priority = payload.priorityScore;

  if (payload.status)
    update.status = payload.status.toUpperCase();

  if (typeof payload.decisionReason === "string")
    update.reviewer = payload.decisionReason;

  const updated = await RequestModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!updated) {
    return res.status(404).json({ status: "error", message: "Request not found" });
  }

  return res.json({
    status: "ok",
    data: {
      id: String(updated._id),
      ownerEmail: updated.ownerEmail,
      requestTitle: updated.title,
      requester: updated.fullName,
      role: updated.companyType || "",
      companyName: updated.company,
      companyLocation: updated.companyAddress,
      companyType: updated.companyType,
      contactEmail: updated.email,
      contactPhone: updated.phoneNumber,
      contactLinkedIn: updated.linkedIn,
      website: updated.website,
      submittedAt: updated.createdAt ? new Date(updated.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: String(updated.status || "PENDING").toLowerCase(),
      priorityScore: Number(updated.priority ?? 3),
      details: updated.description,
      decisionReason: updated.reviewer || "",
      appealMessage: "",
    },
  });
});

export default router;

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

function derivePriorityScore(...values: Array<string | undefined>) {
  const haystack = values
    .map(value => String(value || "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");

  if (/\bgovernment\b|\bgov\b|\bgovt\b|\bministry\b|\bpublic sector\b|\bstate\b/.test(haystack))
    return 1;
  if (/\bportfolio[-\s]startup\b|\bportfolio company\b/.test(haystack))
    return 2;
  if (/\bstartup\b/.test(haystack))
    return 3;
  if (/\binvestor[-\s]lp\b|\blimited partner\b|\blp\b/.test(haystack))
    return 4;
  if (/\binvestor[-\s]gp\b|\bgeneral partner\b|\bgp\b/.test(haystack))
    return 5;
  if (/\bmedia\b|\bpress\b|\bjournalis[tm]\b|\bnews(room)?\b|\bpublication\b/.test(haystack))
    return 6;
  if (/\bfreelancer\b|\bcontractor\b|\bindependent\b/.test(haystack))
    return 7;

  return 10;
}

function hasReviewerRole(authUser: NonNullable<AuthenticatedRequest["authUser"]>) {
  const roles = authUser.roles ?? [];
  return roles.some(role => {
    const normalized = role.toUpperCase();
    return normalized === "REVIEWER" || normalized === "ADMIN";
  })
}

function hasAdminRole(authUser: NonNullable<AuthenticatedRequest["authUser"]>) {
  const roles = authUser.roles ?? [];
  return roles.some(role => role.toUpperCase() === "ADMIN");
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
  activeReviewerName?: string;
  activeReviewerEmail?: string;
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
    activeReviewerName: doc.activeReviewerName || "",
    activeReviewerEmail: doc.activeReviewerEmail || "",
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
    priorityScore?: number;
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
    priority: payload.priorityScore ?? derivePriorityScore(
      payload.role,
      payload.companyType,
      payload.requestTitle,
      payload.details,
      payload.companyName,
    ),
    linkedIn: payload.contactLinkedIn || "",
    website: payload.website || "",
    reviewer: "",
    decisionReason: "",
    activeReviewerName: "",
    activeReviewerEmail: "",
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
    assignmentAction?: "take" | "release";
  };

  const isReviewUpdate = typeof payload.priorityScore === "number"
    || Boolean(payload.status)
    || typeof payload.decisionReason === "string"
    || Boolean(payload.assignmentAction);
  if (isReviewUpdate && !hasReviewerRole(authUser)) {
    return res.status(403).json({
      status: "error",
      message: "Only users with REVIEWER role can review requests.",
    });
  }

  const update: Record<string, unknown> = {};
  const reviewerUser = await User.findById(authUser.id).select("fullName").lean();
  const reviewerName = reviewerUser?.fullName || authUser.email;

  if (payload.assignmentAction) {
    const existing = await RequestModel.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Request not found" });
    }

    const currentAssignee = String(existing.activeReviewerEmail || "").toLowerCase();
    const currentUserEmail = authUser.email.toLowerCase();
    const adminUser = hasAdminRole(authUser);

    if (payload.assignmentAction === "take") {
      if (currentAssignee && currentAssignee !== currentUserEmail) {
        return res.status(409).json({
          status: "error",
          message: `This request is already being handled by ${existing.activeReviewerName || existing.activeReviewerEmail}.`,
        });
      }
      update.activeReviewerEmail = authUser.email;
      update.activeReviewerName = reviewerName;
    }

    if (payload.assignmentAction === "release") {
      if (currentAssignee && currentAssignee !== currentUserEmail && !adminUser) {
        return res.status(403).json({
          status: "error",
          message: "You can only release requests assigned to you.",
        });
      }
      update.activeReviewerEmail = "";
      update.activeReviewerName = "";
    }
  }

  if (typeof payload.priorityScore === "number")
    update.priority = payload.priorityScore;

  if (payload.status)
    update.status = payload.status.toUpperCase();

  if (typeof payload.decisionReason === "string") {
    update.decisionReason = payload.decisionReason;
    update.reviewer = reviewerName;
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

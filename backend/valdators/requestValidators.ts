// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { z } from "zod";

export const createRequestSchema = z.object({
  ownerEmail: z.email("Invalid owner email").optional(),
  requestTitle: z.string().min(3).max(120),
  requester: z.string().min(2).max(100),
  role: z.string().min(1).max(80),
  companyName: z.string().max(120).optional().default(""),
  companyLocation: z.string().max(120).optional().default(""),
  companyType: z.string().max(80).optional().default(""),
  contactEmail: z.email("Invalid contact email"),
  contactPhone: z.string().max(30).optional().default(""),
  contactLinkedIn: z.string().max(300).optional().default(""),
  website: z.string().max(300).optional().default(""),
  details: z.string().min(10).max(3000),
});

export const patchRequestSchema = z
  .object({
    priorityScore: z.number().int().min(1).max(5).optional(),
    status: z.enum(["approved", "denied"]).optional(),
    decisionReason: z.string().max(1000).optional(),
  })
  .refine((payload) => {
    if (!payload.status)
      return true;
    return typeof payload.decisionReason === "string" && payload.decisionReason.trim().length > 0;
  }, {
    message: "decisionReason is required when status is provided",
    path: ["decisionReason"],
  });

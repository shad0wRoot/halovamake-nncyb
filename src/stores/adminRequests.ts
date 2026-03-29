// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { ref } from "vue"

export type DecisionState = "pending" | "approved" | "denied" | "appealed"

export interface AdminRequest {
  id: string
  requestTitle: string
  requester: string
  role: string
  companyName: string
  companyLocation: string
  companyType: string
  contactEmail: string
  contactPhone: string
  contactLinkedIn?: string
  website?: string
  submittedAt: string
  status: DecisionState
  priorityScore: number
  details: string
  decisionReason?: string
  appealMessage?: string
}

const requests = ref<AdminRequest[]>([
  {
    id: "REQ-1001",
    requestTitle: "Tuition Refund Appeal",
    requester: "Arietta Cruz",
    role: "Student",
    companyName: "North Hall Cohort",
    companyLocation: "Bratislava, Slovakia",
    companyType: "Education",
    contactEmail: "arietta.cruz@example.com",
    contactPhone: "+421 900 111 220",
    contactLinkedIn: "https://linkedin.com/in/ariettacruz",
    submittedAt: "2026-03-28",
    status: "pending",
    priorityScore: 4,
    details: "Duplicate billing charge for spring term tuition.",
  },
  {
    id: "REQ-1002",
    requestTitle: "Extension Request",
    requester: "Noah Bennett",
    role: "Freelancer",
    companyName: "Independent",
    companyLocation: "Kosice, Slovakia",
    companyType: "Sole Proprietor",
    contactEmail: "noah.bennett@example.com",
    contactPhone: "+421 900 442 771",
    website: "https://noah-bennett.dev",
    submittedAt: "2026-03-28",
    status: "pending",
    priorityScore: 3,
    details: "Requested 7 extra days to provide dependent documentation.",
  },
  {
    id: "REQ-1003",
    requestTitle: "Denied Housing Exception",
    requester: "Kelsie Hart",
    role: "Startup",
    companyName: "Cedar Labs",
    companyLocation: "Presov, Slovakia",
    companyType: "Technology Startup",
    contactEmail: "kelsie.hart@cedarlabs.io",
    contactPhone: "+421 901 100 991",
    website: "https://cedarlabs.io",
    submittedAt: "2026-03-27",
    status: "appealed",
    priorityScore: 5,
    details: "Initial request denied for missing financial statement.",
    decisionReason: "Missing signed statement proving temporary displacement.",
    appealMessage: "Appeal submitted with notarized hardship letter and updated statements.",
  },
  {
    id: "REQ-1004",
    requestTitle: "Program Transfer",
    requester: "Minseo Park",
    role: "Portfolio Startup",
    companyName: "Atlas Growth",
    companyLocation: "Brno, Czechia",
    companyType: "VC Portfolio",
    contactEmail: "minseo.park@atlasgrowth.io",
    contactPhone: "+420 774 220 301",
    website: "https://atlasgrowth.io",
    submittedAt: "2026-03-26",
    status: "approved",
    priorityScore: 2,
    details: "Advisor and department approvals complete.",
    decisionReason: "All required endorsements and transfer documents were valid.",
  },
  {
    id: "REQ-1005",
    requestTitle: "Emergency Fee Waiver",
    requester: "Elijah Reed",
    role: "Other",
    companyName: "Community Applicant",
    companyLocation: "Nitra, Slovakia",
    companyType: "Nonprofit",
    contactEmail: "elijah.reed@example.org",
    contactPhone: "+421 902 551 888",
    submittedAt: "2026-03-25",
    status: "denied",
    priorityScore: 4,
    details: "Denied due to incomplete hardship evidence.",
    decisionReason: "No official medical or financial proof was attached.",
  },
])

export function useAdminRequestsStore() {
  return { requests }
}

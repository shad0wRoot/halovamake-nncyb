// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import axios from "axios"
import { ref } from "vue"
import { getAuthToken } from "@/lib/authSession"

export type DecisionState = "draft" | "pending" | "approved" | "denied" | "appealed"

export interface AdminRequest {
  id: string
  ownerEmail: string
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
  reviewer?: string
  activeReviewerName?: string
  activeReviewerEmail?: string
  appealMessage?: string
}

interface CreateAdminRequestInput {
  ownerEmail: string
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
  details: string
  status?: "pending" | "draft"
}

interface UpdateRequestBody {
  priorityScore?: number
  status?: "approved" | "denied"
  decisionReason?: string
  assignmentAction?: "take" | "release"
}

const requests = ref<AdminRequest[]>([])
const isLoading = ref(false)
const isLoaded = ref(false)
const errorMessage = ref("")

function authHeaders() {
  const token = getAuthToken()
  if (!token)
    throw new Error("You are not logged in. Please sign in and try again.")

  return {
    Authorization: `Bearer ${token}`,
  }
}

function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const fromResponse = error.response?.data as { message?: string } | undefined
    if (fromResponse?.message)
      return fromResponse.message
  }

  if (error instanceof Error)
    return error.message

  return "Unexpected request error"
}

function normalizeRequest(raw: Record<string, unknown>): AdminRequest {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    ownerEmail: String(raw.ownerEmail ?? raw.owner_email ?? raw.contactEmail ?? ""),
    requestTitle: String(raw.requestTitle ?? raw.request_title ?? "Untitled request"),
    requester: String(raw.requester ?? raw.fullName ?? "Unknown"),
    role: String(raw.role ?? "Unknown"),
    companyName: String(raw.companyName ?? raw.company_name ?? "Not provided"),
    companyLocation: String(raw.companyLocation ?? raw.company_location ?? "Not provided"),
    companyType: String(raw.companyType ?? raw.company_type ?? "Not provided"),
    contactEmail: String(raw.contactEmail ?? raw.contact_email ?? ""),
    contactPhone: String(raw.contactPhone ?? raw.contact_phone ?? "Not provided"),
    contactLinkedIn: String(raw.contactLinkedIn ?? raw.contact_linkedin ?? ""),
    website: String(raw.website ?? ""),
    submittedAt: String(raw.submittedAt ?? raw.submitted_at ?? new Date().toISOString().slice(0, 10)),
    status: String(raw.status ?? "pending") as DecisionState,
    priorityScore: Number(raw.priorityScore ?? raw.priority_score ?? 3),
    details: String(raw.details ?? raw.description ?? ""),
    decisionReason: String(raw.decisionReason ?? raw.decision_reason ?? ""),
    reviewer: String(raw.reviewer ?? ""),
    activeReviewerName: String(raw.activeReviewerName ?? raw.active_reviewer_name ?? ""),
    activeReviewerEmail: String(raw.activeReviewerEmail ?? raw.active_reviewer_email ?? ""),
    appealMessage: String(raw.appealMessage ?? raw.appeal_message ?? ""),
  }
}

function mapListResponse(payload: unknown): AdminRequest[] {
  if (Array.isArray(payload))
    return payload.map(item => normalizeRequest(item as Record<string, unknown>))

  if (payload && typeof payload === "object") {
    const list = (payload as { data?: unknown }).data
    if (Array.isArray(list))
      return list.map(item => normalizeRequest(item as Record<string, unknown>))
  }

  return []
}

export async function fetchRequests() {
  isLoading.value = true
  errorMessage.value = ""

  try {
    const response = await axios.get("/api/requests", {
      headers: authHeaders(),
    })
    requests.value = mapListResponse(response.data)
    isLoaded.value = true
  }
  catch (error) {
    errorMessage.value = extractErrorMessage(error)
    throw error
  }
  finally {
    isLoading.value = false
  }
}

export async function createRequest(input: CreateAdminRequestInput) {
  const payload = {
    ownerEmail: input.ownerEmail,
    requestTitle: input.requestTitle,
    requester: input.requester,
    role: input.role,
    companyName: input.companyName,
    companyLocation: input.companyLocation,
    companyType: input.companyType,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    contactLinkedIn: input.contactLinkedIn,
    website: input.website,
    details: input.details,
    status: input.status ?? "pending",
  }

  try {
    const response = await axios.post("/api/requests", payload, {
      headers: authHeaders(),
    })
    const created = normalizeRequest((response.data as { data?: Record<string, unknown> }).data ?? (response.data as Record<string, unknown>))

    requests.value = [created, ...requests.value]
    return created
  }
  catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

async function patchRequest(id: string, body: UpdateRequestBody) {
  const response = await axios.patch(`/api/requests/${id}`, body, {
    headers: authHeaders(),
  })
  const updated = normalizeRequest((response.data as { data?: Record<string, unknown> }).data ?? (response.data as Record<string, unknown>))

  requests.value = requests.value.map((request) => {
    if (request.id !== id)
      return request
    return updated
  })
}

export async function deleteRequest(id: string) {
  try {
    await axios.delete(`/api/requests/${id}`, {
      headers: authHeaders(),
    })
    requests.value = requests.value.filter(request => request.id !== id)
  }
  catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function updateRequestPriority(id: string, priorityScore: number) {
  await patchRequest(id, { priorityScore })
}

export async function updateRequestDecision(id: string, status: "approved" | "denied", decisionReason: string) {
  await patchRequest(id, { status, decisionReason })
}

export async function takeRequestOwnership(id: string) {
  await patchRequest(id, { assignmentAction: "take" })
}

export async function releaseRequestOwnership(id: string) {
  await patchRequest(id, { assignmentAction: "release" })
}

export function useAdminRequestsStore() {
  return {
    requests,
    isLoading,
    isLoaded,
    errorMessage,
    fetchRequests,
    createRequest,
    deleteRequest,
    updateRequestDecision,
    updateRequestPriority,
    takeRequestOwnership,
    releaseRequestOwnership,
  }
}

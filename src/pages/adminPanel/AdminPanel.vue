<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script lang="ts">
export const description = "Admin request moderation workspace."
export const iframeHeight = "900px"
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import AppSidebar from "@/components/AdminSideBar.vue"
import { getAuthUser } from "@/lib/authSession"
import { useAdminRequestsStore } from "@/stores/adminRequests"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import type { AdminRequest, DecisionState } from "@/stores/adminRequests"

const route = useRoute()
const router = useRouter()

const {
  requests,
  fetchRequests,
  updateRequestDecision,
  updateRequestPriority,
  takeRequestOwnership,
  releaseRequestOwnership,
  errorMessage,
} = useAdminRequestsStore()

const authUser = getAuthUser()
const currentReviewerEmail = (authUser?.email || "").toLowerCase()
const selectedRequestId = ref("")
const decisionDrafts = ref<Record<string, string>>({})
const decisionErrors = ref<Record<string, string>>({})
const actionError = ref("")
const reviewNotice = ref("")
const isSubmittingDecision = ref(false)
const isUpdatingAssignment = ref(false)

onMounted(async () => {
  try {
    await fetchRequests()
  }
  catch {
    actionError.value = errorMessage.value || "Failed to load requests from backend."
  }
})

const actionableCount = computed(() =>
  requests.value.filter(request => request.status === "pending" || request.status === "appealed").length,
)

const appealCount = computed(() =>
  requests.value.filter(request => request.status === "appealed").length,
)

const approvedCount = computed(() =>
  requests.value.filter(request => request.status === "approved").length,
)

const deniedCount = computed(() =>
  requests.value.filter(request => request.status === "denied").length,
)

const selectedRequest = computed(() =>
  requests.value.find(request => request.id === selectedRequestId.value),
)

const canApproveSelected = computed(() =>
  Boolean(selectedRequest.value) && selectedRequest.value?.status !== "approved",
)

const canDenySelected = computed(() =>
  Boolean(selectedRequest.value) && selectedRequest.value?.status !== "denied",
)

watch(
  () => route.query.request,
  (requestQuery) => {
    if (typeof requestQuery === "string") {
      const exists = requests.value.some(request => request.id === requestQuery)
      if (exists) {
        selectedRequestId.value = requestQuery
        reviewNotice.value = ""
        return
      }
    }
    selectedRequestId.value = ""
  },
  { immediate: true },
)

watch(
  requests,
  (items) => {
    if (!items.length) {
      selectedRequestId.value = ""
      return
    }

    const selectedStillExists = items.some(request => request.id === selectedRequestId.value)
    if (!selectedStillExists)
      selectedRequestId.value = ""
  },
  { deep: true },
)

async function closeSelectedRequest() {
  selectedRequestId.value = ""
  const query = { ...route.query }
  delete query.request
  await router.replace({ query })
}

async function setDecision(status: "approved" | "denied") {
  const request = selectedRequest.value
  if (!request)
    return

  if (request.status === status)
    return

  if (isSubmittingDecision.value)
    return

  const reason = (decisionDrafts.value[request.id] ?? request.decisionReason ?? "").trim()
  if (!reason) {
    decisionErrors.value[request.id] = "Moderator reason is required before submitting a decision."
    return
  }

  decisionErrors.value[request.id] = ""

  isSubmittingDecision.value = true
  try {
    await updateRequestDecision(request.id, status, reason)
    actionError.value = ""
    reviewNotice.value = `Request was ${status} successfully. Open another request from the left queue.`
    await closeSelectedRequest()
  }
  catch {
    actionError.value = "Failed to update decision in backend."
  }
  finally {
    isSubmittingDecision.value = false
  }
}

async function setPriority(value: number) {
  const request = selectedRequest.value
  if (!request)
    return

  try {
    await updateRequestPriority(request.id, value)
    actionError.value = ""
  }
  catch {
    actionError.value = "Failed to update priority in backend."
  }
}

function badgeVariant(status: DecisionState) {
  if (status === "approved")
    return "default"
  if (status === "denied")
    return "destructive"
  if (status === "appealed")
    return "secondary"
  return "outline"
}

function prettyStatus(status: DecisionState) {
  if (status === "appealed")
    return "Appealed"
  if (status === "approved")
    return "Approved"
  if (status === "denied")
    return "Denied"
  return "Pending"
}

function getDecisionDraft(request: AdminRequest) {
  return decisionDrafts.value[request.id] ?? request.decisionReason ?? ""
}

function updateDecisionDraft(id: string, value: string) {
  decisionDrafts.value[id] = value
  if (decisionErrors.value[id])
    decisionErrors.value[id] = ""
}

function initials(value: string) {
  const cleaned = value.trim()
  if (!cleaned)
    return "RV"

  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1)
    return (parts[0] ?? "").slice(0, 2).toUpperCase()

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
}

const isAssignedToMe = computed(() => {
  const request = selectedRequest.value
  if (!request?.activeReviewerEmail)
    return false
  return request.activeReviewerEmail.toLowerCase() === currentReviewerEmail
})

const isAssignedToOther = computed(() => {
  const request = selectedRequest.value
  if (!request?.activeReviewerEmail)
    return false
  return request.activeReviewerEmail.toLowerCase() !== currentReviewerEmail
})

const activeReviewerDisplay = computed(() => {
  const request = selectedRequest.value
  if (!request?.activeReviewerEmail)
    return null
  return {
    name: request.activeReviewerName || request.activeReviewerEmail,
    email: request.activeReviewerEmail,
  }
})

const assignmentButtonLabel = computed(() => {
  if (isAssignedToMe.value)
    return "Release Request"
  if (isAssignedToOther.value)
    return "Taken by Reviewer"
  return "Take Request"
})

async function toggleAssignment() {
  const request = selectedRequest.value
  if (!request || isUpdatingAssignment.value || isAssignedToOther.value)
    return

  isUpdatingAssignment.value = true
  try {
    if (isAssignedToMe.value)
      await releaseRequestOwnership(request.id)
    else
      await takeRequestOwnership(request.id)

    actionError.value = ""
  }
  catch (error) {
    actionError.value = error instanceof Error
      ? error.message
      : "Failed to update reviewer ownership."
  }
  finally {
    isUpdatingAssignment.value = false
  }
}
</script>

<template>
  <SidebarProvider
    :style="{
      '--sidebar-width': 'clamp(280px, 24vw, 360px)',
    }"
  >
    <AppSidebar />
    <SidebarInset class="min-w-0">
      <header class="bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b px-4 py-3 lg:px-6">
        <SidebarTrigger class="-ml-1" />
        <Separator
          orientation="vertical"
          class="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="/admin">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Request Moderation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div class="text-foreground mx-auto flex w-full max-w-[1500px] min-w-0 flex-1 flex-col gap-6 p-4 lg:p-8">
        <div class="rounded-2xl border bg-card/80 p-4 shadow-xs lg:p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-base font-semibold">Moderation Workspace</p>
              <p class="text-muted-foreground mt-1 text-sm">
                Pick a request from the left queue, review it, submit decision, then continue with the next one.
              </p>
            </div>
            <div class="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
              <div class="rounded-lg border bg-background/60 px-3 py-2">
                <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Awaiting</p>
                <p class="mt-1 text-xl font-semibold">{{ actionableCount }}</p>
              </div>
              <div class="rounded-lg border bg-background/60 px-3 py-2">
                <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Appeals</p>
                <p class="mt-1 text-xl font-semibold">{{ appealCount }}</p>
              </div>
              <div class="rounded-lg border bg-background/60 px-3 py-2">
                <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Approved</p>
                <p class="mt-1 text-xl font-semibold">{{ approvedCount }}</p>
              </div>
              <div class="rounded-lg border bg-background/60 px-3 py-2">
                <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Denied</p>
                <p class="mt-1 text-xl font-semibold">{{ deniedCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <section class="rounded-2xl border bg-card shadow-xs">
            <div v-if="selectedRequest" class="p-5 lg:p-7">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-2xl font-semibold tracking-tight">{{ selectedRequest.requestTitle }}</p>
                  <p class="text-muted-foreground mt-1 text-sm">
                    {{ selectedRequest.id }} • submitted {{ selectedRequest.submittedAt }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <Badge :variant="badgeVariant(selectedRequest.status)">
                    {{ prettyStatus(selectedRequest.status) }}
                  </Badge>
                  <button
                    v-if="activeReviewerDisplay"
                    type="button"
                    class="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    :title="`${activeReviewerDisplay.name} (${activeReviewerDisplay.email})`"
                  >
                    {{ initials(activeReviewerDisplay.name) }}
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="isUpdatingAssignment || isAssignedToOther"
                    :title="activeReviewerDisplay ? `${activeReviewerDisplay.name} (${activeReviewerDisplay.email})` : 'Assign this request to yourself'"
                    @click="toggleAssignment"
                  >
                    {{ assignmentButtonLabel }}
                  </Button>
                  <Button variant="outline" size="sm" @click="closeSelectedRequest">
                    Close
                  </Button>
                </div>
              </div>

              <div class="border-border/60 mt-6 border-t pt-5">
                <h3 class="text-sm font-semibold">Request Details</h3>
                <p class="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {{ selectedRequest.details }}
                </p>
              </div>

              <div class="border-border/60 mt-6 border-t pt-5">
                <h3 class="text-sm font-semibold">Applicant Information</h3>
                <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Full Name</p>
                    <p class="text-sm font-medium">{{ selectedRequest.requester }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Role</p>
                    <p class="text-sm font-medium">{{ selectedRequest.role }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Company Name</p>
                    <p class="text-sm font-medium">{{ selectedRequest.companyName }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Address</p>
                    <p class="text-sm font-medium">{{ selectedRequest.companyLocation }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Company Type</p>
                    <p class="text-sm font-medium">{{ selectedRequest.companyType }}</p>
                  </div>
                </div>
              </div>

              <div class="border-border/60 mt-6 border-t pt-5">
                <h3 class="text-sm font-semibold">Contact</h3>
                <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Email</p>
                    <p class="text-sm font-medium">{{ selectedRequest.contactEmail }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Phone</p>
                    <p class="text-sm font-medium">{{ selectedRequest.contactPhone }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">LinkedIn</p>
                    <p class="text-sm font-medium">{{ selectedRequest.contactLinkedIn || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-[11px] uppercase tracking-wide">Website</p>
                    <p class="text-sm font-medium">{{ selectedRequest.website || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <div class="border-border/60 mt-6 border-t pt-5">
                <h3 class="text-sm font-semibold">Review Decision</h3>
                <div class="mt-3 grid gap-4 xl:grid-cols-[220px_1fr]">
                  <div class="rounded-xl border bg-background/60 p-3">
                    <p class="text-sm font-semibold">Priority Score</p>
                    <p class="text-muted-foreground mt-1 text-xs">1 = low urgency, 5 = highest urgency.</p>
                    <select
                      :value="selectedRequest.priorityScore"
                      class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 mt-2 h-9 w-full rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"
                      @change="setPriority(Number(($event.target as HTMLSelectElement).value))"
                    >
                      <option :value="1">1</option>
                      <option :value="2">2</option>
                      <option :value="3">3</option>
                      <option :value="4">4</option>
                      <option :value="5">5</option>
                    </select>
                  </div>
                  <div class="rounded-xl border bg-background/60 p-3">
                    <div class="mb-1 flex items-center gap-2">
                      <p class="text-sm font-semibold">Decision Reason</p>
                      <Badge variant="secondary">Required</Badge>
                    </div>
                    <textarea
                      :value="getDecisionDraft(selectedRequest)"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1"
                      rows="5"
                      placeholder="Explain why this request should be approved or denied."
                      @input="updateDecisionDraft(selectedRequest.id, ($event.target as HTMLTextAreaElement).value)"
                    />
                    <p v-if="decisionErrors[selectedRequest.id]" class="text-destructive mt-1 text-xs">
                      {{ decisionErrors[selectedRequest.id] }}
                    </p>
                    <div class="mt-4 flex flex-wrap items-center gap-2">
                      <Button size="sm" :disabled="!canApproveSelected || isSubmittingDecision" @click="setDecision('approved')">
                        Approve Request
                      </Button>
                      <Button size="sm" variant="destructive" :disabled="!canDenySelected || isSubmittingDecision" @click="setDecision('denied')">
                        Deny Request
                      </Button>
                    </div>
                  </div>
                </div>
                <p v-if="actionError" class="text-destructive mt-2 text-xs">
                  {{ actionError }}
                </p>
                <p
                  v-if="selectedRequest.status === 'approved' || selectedRequest.status === 'denied'"
                  class="text-muted-foreground mt-2 text-xs"
                >
                  This request is currently resolved. You can still review it and update the decision if needed.
                </p>
              </div>

              <div v-if="selectedRequest.appealMessage" class="border-border/60 mt-4 border-t pt-4">
                <h3 class="text-sm font-semibold">Appeal</h3>
                <p class="text-muted-foreground mt-2 text-sm">{{ selectedRequest.appealMessage }}</p>
              </div>
            </div>

            <div v-else class="px-5 py-14 text-center lg:px-7">
              <p class="text-foreground text-base font-medium">No request is open</p>
              <p v-if="reviewNotice" class="mt-4 text-sm text-emerald-700">
                {{ reviewNotice }}
              </p>
            </div>
        </section>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

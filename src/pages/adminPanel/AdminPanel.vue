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
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import AppSidebar from "@/components/AdminSideBar.vue"
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

const { requests } = useAdminRequestsStore()

const selectedRequestId = ref("")
const decisionDrafts = ref<Record<string, string>>({})
const decisionErrors = ref<Record<string, string>>({})

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
  selectedRequest.value?.status !== "approved",
)

const canDenySelected = computed(() =>
  selectedRequest.value?.status !== "denied",
)

watch(
  () => route.query.request,
  (requestQuery) => {
    if (typeof requestQuery === "string") {
      const exists = requests.value.some(request => request.id === requestQuery)
      if (exists) {
        selectedRequestId.value = requestQuery
        return
      }
    }

    const fallback = requests.value[0]
    if (!fallback)
      return

    selectedRequestId.value = fallback.id
    if (route.query.request !== fallback.id) {
      router.replace({
        query: {
          ...route.query,
          request: fallback.id,
        },
      })
    }
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
    if (!selectedStillExists) {
      const fallback = items[0]
      if (fallback)
        selectedRequestId.value = fallback.id
    }
  },
  { deep: true },
)

function setDecision(status: "approved" | "denied") {
  const request = selectedRequest.value
  if (!request)
    return

  if (request.status === status)
    return

  const reason = (decisionDrafts.value[request.id] ?? request.decisionReason ?? "").trim()
  if (!reason) {
    decisionErrors.value[request.id] = "Moderator reason is required before submitting a decision."
    return
  }

  decisionErrors.value[request.id] = ""

  requests.value = requests.value.map((item) => {
    if (item.id !== request.id)
      return item

    return {
      ...item,
      status,
      decisionReason: reason,
    }
  })
}

function setPriority(value: number) {
  const request = selectedRequest.value
  if (!request)
    return

  requests.value = requests.value.map((item) => {
    if (item.id !== request.id)
      return item

    return {
      ...item,
      priorityScore: value,
    }
  })
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
</script>

<template>
  <SidebarProvider
    :style="{
      '--sidebar-width': 'clamp(260px, 24vw, 340px)',
    }"
  >
    <AppSidebar />
    <SidebarInset>
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

      <div class="text-foreground flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border bg-card p-4 shadow-xs">
            <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Requests Awaiting Action</p>
            <p class="mt-2 text-2xl font-semibold">{{ actionableCount }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4 shadow-xs">
            <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Appeals To Review</p>
            <p class="mt-2 text-2xl font-semibold">{{ appealCount }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4 shadow-xs">
            <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Approved</p>
            <p class="mt-2 text-2xl font-semibold">{{ approvedCount }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4 shadow-xs">
            <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Denied</p>
            <p class="mt-2 text-2xl font-semibold">{{ deniedCount }}</p>
          </div>
        </div>

        <section class="rounded-xl border bg-card shadow-xs">
            <div v-if="selectedRequest" class="p-4 lg:p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">{{ selectedRequest.requestTitle }}</p>
                  <p class="text-muted-foreground mt-1 text-xs">
                    {{ selectedRequest.id }} • submitted {{ selectedRequest.submittedAt }}
                  </p>
                </div>
                <Badge :variant="badgeVariant(selectedRequest.status)">
                  {{ prettyStatus(selectedRequest.status) }}
                </Badge>
              </div>

              <div class="border-border/60 mt-4 border-t pt-4">
                <h3 class="text-sm font-semibold">Request Details</h3>
                <p class="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {{ selectedRequest.details }}
                </p>
              </div>

              <div class="border-border/60 mt-4 border-t pt-4">
                <h3 class="text-sm font-semibold">Applicant Information</h3>
                <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

              <div class="border-border/60 mt-4 border-t pt-4">
                <h3 class="text-sm font-semibold">Contact</h3>
                <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

              <div class="border-border/60 mt-4 border-t pt-4">
                <div class="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <div>
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
                  <div>
                    <div class="mb-1 flex items-center gap-2">
                      <p class="text-sm font-semibold">Moderator Decision Reason</p>
                      <Badge variant="secondary">Required</Badge>
                    </div>
                    <textarea
                      :value="getDecisionDraft(selectedRequest)"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1"
                      rows="4"
                      placeholder="Explain why this request should be approved or denied."
                      @input="updateDecisionDraft(selectedRequest.id, ($event.target as HTMLTextAreaElement).value)"
                    />
                    <p v-if="decisionErrors[selectedRequest.id]" class="text-destructive mt-1 text-xs">
                      {{ decisionErrors[selectedRequest.id] }}
                    </p>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" :disabled="!canApproveSelected" @click="setDecision('approved')">
                    Approve Request
                  </Button>
                  <Button size="sm" variant="destructive" :disabled="!canDenySelected" @click="setDecision('denied')">
                    Deny Request
                  </Button>
                </div>
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

            <div v-else class="text-muted-foreground px-4 py-10 text-center text-sm lg:px-5">
              Select a request to open full details.
            </div>
        </section>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useAdminRequestsStore } from "@/stores/adminRequests"
import { getAuthUser } from "@/lib/authSession"
import ChartAreaInteractive from "@/components/ChartAreaInteractive.vue"
import DataTable from "@/components/DataTable.vue"
import SectionCards from "@/components/SectionCards.vue"

const { requests, isLoading, fetchRequests } = useAdminRequestsStore()

const currentUser = getAuthUser()

const userRequests = computed(() =>
  requests.value.filter(req => req.ownerEmail === currentUser?.email && req.status !== "draft")
)

const data = computed(() =>
  userRequests.value.map((req, index) => ({
    id: index + 1, // DataTable expects number
    title: req.requestTitle || "Untitled request",
    companyType: req.companyType || req.role || "Not specified",
    status: req.status === "approved"
      ? "Approved"
      : req.status === "denied"
        ? "Denied"
        : req.status === "appealed"
          ? "Appealed"
          : req.status === "draft"
            ? "Draft"
            : "Pending",
    priority: String(req.priorityScore ?? 3),
    submittedAt: req.submittedAt || "N/A",
    reviewer: req.reviewer || "Not reviewed",
    decision: req.decisionReason || "No decision yet",
  }))
)

onMounted(async () => {
  try {
    await fetchRequests()
  } catch (error) {
    console.error("Failed to fetch requests:", error)
  }
})
</script>

<template>
  <SectionCards />
  <div class="px-4 lg:px-6">
    <ChartAreaInteractive />
  </div>
  <div v-if="isLoading" class="px-4 lg:px-6 py-4">Loading requests...</div>
  <DataTable v-else :data="data" />
</template>

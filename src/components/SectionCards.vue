<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { computed, onMounted } from "vue"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getActiveEmail } from '@/lib/authSession'
import { useAdminRequestsStore } from '@/stores/adminRequests'

const { requests, fetchRequests, isLoaded } = useAdminRequestsStore()

onMounted(async () => {
  if (!isLoaded.value)
    await fetchRequests()
})

const currentUserEmail = computed(() =>
  getActiveEmail(),
)

const userRequests = computed(() =>
  requests.value.filter(request => request.ownerEmail.toLowerCase() === currentUserEmail.value),
)

const totalRequests = computed(() => userRequests.value.length)
const acceptedRequests = computed(() =>
  userRequests.value.filter(request => request.status === "approved").length,
)
const pendingRequests = computed(() =>
  userRequests.value.filter(request => request.status === "pending" || request.status === "appealed").length,
)

const acceptanceRate = computed(() => {
  if (!totalRequests.value)
    return 0
  return Math.round((acceptedRequests.value / totalRequests.value) * 100)
})
</script>

<template>
  <div class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
    <Card class="@container/card">
      <CardHeader>
        <CardDescription>Requests Sent</CardDescription>
        <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {{ totalRequests }}
        </CardTitle>
      </CardHeader>
      <CardFooter class="flex-col items-start gap-1.5 text-sm">
        <div class="text-muted-foreground">
          Total requests submitted in your workspace
        </div>
      </CardFooter>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription>Requests Accepted</CardDescription>
        <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {{ acceptedRequests }}
        </CardTitle>
      </CardHeader>
      <CardFooter class="flex-col items-start gap-1.5 text-sm">
        <div class="text-muted-foreground">
          Acceptance rate: {{ acceptanceRate }}%
        </div>
      </CardFooter>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription>Waiting for Review</CardDescription>
        <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {{ pendingRequests }}
        </CardTitle>
      </CardHeader>
      <CardFooter class="flex-col items-start gap-1.5 text-sm">
        <div class="text-muted-foreground">
          Pending includes appealed requests awaiting action
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

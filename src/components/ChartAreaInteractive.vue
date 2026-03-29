<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import type { ChartConfig } from '@/components/ui/chart'

// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {

  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActiveEmail } from '@/lib/authSession'
import { computed, onMounted, ref } from "vue"
import { useAdminRequestsStore } from "@/stores/adminRequests"

const description = "Request outcome trends"

interface DataPoint {
  date: Date
  accepted: number
  pending: number
  denied: number
}

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

const chartConfig = ref({
  accepted: {
    label: "Accepted",
    color: "#22c55e",
  },
  pending: {
    label: "Pending",
    color: "#eab308",
  },
  denied: {
    label: "Denied",
    color: "#ef4444",
  },
})

const timeRange = ref("90d")
const chartData = computed<DataPoint[]>(() => {
  const sorted = [...userRequests.value].sort((a, b) =>
    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  )

  if (!sorted.length)
    return []

  let accepted = 0
  let denied = 0
  let pending = 0

  return sorted.map((request) => {
    if (request.status === "approved")
      accepted += 1
    else if (request.status === "denied")
      denied += 1
    else
      pending += 1

    return {
      date: new Date(`${request.submittedAt}T00:00:00`),
      accepted,
      pending,
      denied,
    }
  })
})

const filterRange = computed(() => {
  if (!chartData.value.length)
    return []

  const latestEntry = chartData.value[chartData.value.length - 1]
  if (!latestEntry)
    return []

  return chartData.value.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(latestEntry.date)
    let daysToSubtract = 90
    if (timeRange.value === "30d") {
      daysToSubtract = 30
    }
    else if (timeRange.value === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })
})

const yDomain = computed<[number, number]>(() => {
  const max = filterRange.value.reduce((acc, item) =>
    Math.max(acc, item.accepted, item.pending, item.denied), 0)

  return [0, Math.max(2, max + 1)]
})

type Data = DataPoint
</script>

<template>
  <Card class="pt-0">
    <CardHeader class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
      <div class="grid flex-1 gap-1">
        <CardTitle>User Request Outcomes</CardTitle>
        <CardDescription>
          Cumulative approved, pending, and denied requests
        </CardDescription>
      </div>
      <Select v-model="timeRange">
        <SelectTrigger
          class="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Last 3 months" />
        </SelectTrigger>
        <SelectContent class="rounded-xl">
          <SelectItem value="90d" class="rounded-lg">
            Last 3 months
          </SelectItem>
          <SelectItem value="30d" class="rounded-lg">
            Last 30 days
          </SelectItem>
          <SelectItem value="7d" class="rounded-lg">
            Last 7 days
          </SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
    <CardContent class="px-2 pt-4 sm:px-6 sm:pt-6 pb-4">
      <div
        v-if="filterRange.length === 0"
        class="text-muted-foreground flex h-[250px] items-center justify-center rounded-lg border border-dashed text-sm"
      >
        No request history yet for this account.
      </div>
      <ChartContainer v-else :config="chartConfig" class="aspect-auto h-[250px] w-full" :cursor="false">
        <VisXYContainer
          :data="filterRange"
          :margin="{ left: -40 }"
          :y-domain="yDomain"
          :key="timeRange"  
        >
          <VisArea
            :x="(d: Data) => d.date"
            :y="[(d: Data) => d.accepted, (d: Data) => d.pending, (d: Data) => d.denied]"
            :color="(d: Data, i: number) => [chartConfig.accepted.color, chartConfig.pending.color, chartConfig.denied.color][i]"
            :opacity="0.6"
            :key="'area-' + timeRange"
          />
          <VisLine
            :x="(d: Data) => d.date"
            :y="[(d: Data) => d.accepted, (d: Data) => d.pending, (d: Data) => d.denied]"
            :color="(d: Data, i: number) => [chartConfig.accepted.color, chartConfig.pending.color, chartConfig.denied.color][i]"
            :line-width="1"
            :key="'line-' + timeRange"
          />
          <VisAxis
            type="x"
            :x="(d: Data) => d.date"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :num-ticks="6"
            :tick-format="(d: number, index: number) => {
              const date = new Date(d)
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }"
          />
          <VisAxis
            type="y"
            :num-ticks="3"
            :tick-line="false"
            :domain-line="false"
          />
          <ChartTooltip />
          <ChartCrosshair
            :template="componentToString(chartConfig, ChartTooltipContent, {
              labelFormatter: (d) => {
                return new Date(d).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              },
            })"
            :color="(d: Data, i: number) => [chartConfig.accepted.color, chartConfig.pending.color, chartConfig.denied.color][i % 3]"
          />
        </VisXYContainer>

        <ChartLegendContent />
      </ChartContainer>
    </CardContent>
  </Card>
</template>

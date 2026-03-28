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
import { computed, ref } from "vue"

const description = "Request outcome trends"

const chartData = [
  { date: new Date("2024-04-01"), accepted: 2, pending: 1, denied: 0 },
  { date: new Date("2024-04-08"), accepted: 1, pending: 2, denied: 0 },
  { date: new Date("2024-04-15"), accepted: 3, pending: 1, denied: 1 },
  { date: new Date("2024-04-22"), accepted: 2, pending: 2, denied: 0 },
  { date: new Date("2024-04-29"), accepted: 4, pending: 1, denied: 0 },
  { date: new Date("2024-05-06"), accepted: 3, pending: 2, denied: 1 },
  { date: new Date("2024-05-13"), accepted: 5, pending: 2, denied: 0 },
  { date: new Date("2024-05-20"), accepted: 4, pending: 3, denied: 1 },
  { date: new Date("2024-05-27"), accepted: 6, pending: 2, denied: 0 },
  { date: new Date("2024-06-03"), accepted: 5, pending: 2, denied: 1 },
  { date: new Date("2024-06-10"), accepted: 7, pending: 2, denied: 1 },
  { date: new Date("2024-06-17"), accepted: 8, pending: 1, denied: 1 },
  { date: new Date("2024-06-24"), accepted: 9, pending: 1, denied: 0 },
]
type Data = typeof chartData[number]

const chartConfig = {
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

} satisfies ChartConfig

const svgDefs = `
  <linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-accepted)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-accepted)"
      stop-opacity="0.1"
    />
  </linearGradient>
  <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-pending)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-pending)"
      stop-opacity="0.1"
    />
  </linearGradient>
  <linearGradient id="fillDenied" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-denied)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-denied)"
      stop-opacity="0.1"
    />
  </linearGradient>
`

const timeRange = ref("90d")
const filterRange = computed(() => {
  return chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
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
</script>

<template>
  <Card class="pt-0">
    <CardHeader class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
      <div class="grid flex-1 gap-1">
        <CardTitle>Request Outcomes Overview</CardTitle>
        <CardDescription>
          Approved, pending, and denied request counts over time
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
      <ChartContainer :config="chartConfig" class="aspect-auto h-[250px] w-full" :cursor="false">
        <VisXYContainer
          :data="filterRange"
          :svg-defs="svgDefs"
          :margin="{ left: -40 }"
          :y-domain="[0, 10]"
        >
          <VisArea
            :x="(d: Data) => d.date"
            :y="[(d: Data) => d.accepted, (d: Data) => d.pending, (d: Data) => d.denied]"
            :color="(d: Data, i: number) => ['url(#fillAccepted)', 'url(#fillPending)', 'url(#fillDenied)'][i]"
            :opacity="0.6"
          />
          <VisLine
            :x="(d: Data) => d.date"
            :y="[(d: Data) => d.accepted, (d: Data) => d.pending, (d: Data) => d.denied]"
            :color="(d: Data, i: number) => [chartConfig.accepted.color, chartConfig.pending.color, chartConfig.denied  .color][i]"
            :line-width="1"
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

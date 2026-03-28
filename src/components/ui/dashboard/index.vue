<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import ChartAreaInteractive from "@/components/ChartAreaInteractive.vue"
import DataTable from "@/components/DataTable.vue"
import SectionCards from "@/components/SectionCards.vue"

const data = [
  {
    id: 1,
    header: "Appeal draft",
    type: "Narrative",
    status: "In Process",
    target: "12",
    limit: "5",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Evidence summary",
    type: "Technical content",
    status: "Done",
    target: "8",
    limit: "6",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "Submission checklist",
    type: "Checklist",
    status: "In Process",
    target: "4",
    limit: "3",
    reviewer: "Assign reviewer",
  },
]
</script>

<template>
  <SectionCards />
  <div class="px-4 lg:px-6">
    <ChartAreaInteractive />
  </div>
  <DataTable :data="data" />
</template>

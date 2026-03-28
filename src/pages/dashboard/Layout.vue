<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { RouterView } from "vue-router"
import AppSidebar from "@/components/AppSidebar.vue"
import SiteHeader from "@/components/SiteHeader.vue"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
</script>

<template>
  <SidebarProvider
    :style=" {
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <div class="text-foreground flex flex-1 flex-col">
        <div class="@container/main flex flex-1 flex-col gap-2">
          <div class="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <RouterView />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

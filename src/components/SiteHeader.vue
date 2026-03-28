<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const route = useRoute()

const routeTitles: Record<string, string> = {
  dashboard: "Dashboard",
  appeals: "My Appeals",
  drafts: "Drafts",
  create: "Create Request",
  settings: "Settings",
  account: "Account",
  notifications: "Notifications",
  login: "Login",
  signup: "Sign Up",
  register: "Register",
}

const currentPageTitle = computed(() => {
  const routeName = typeof route.name === "string" ? route.name : "dashboard"
  return routeTitles[routeName] ?? "Dashboard"
})
</script>

<template>
  <header class="bg-background text-foreground flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
    <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <SidebarTrigger class="-ml-1 text-foreground" />
      <Separator
        orientation="vertical"
        class="mx-2 data-[orientation=vertical]:h-4"
      />
      <h1 class="text-foreground text-base font-medium">
        {{ currentPageTitle }}
      </h1>
      <div class="ml-auto" />
    </div>
  </header>
</template>

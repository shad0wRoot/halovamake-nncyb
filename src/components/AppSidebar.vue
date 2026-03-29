<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { computed } from 'vue'
import {
  IconDashboard,
  IconFileDescription,
  IconInnerShadowTop,
  IconListDetails,
  IconNotification,
} from "@tabler/icons-vue"
import { RouterLink } from "vue-router"

import NavDocuments from '@/components/NavDocuments.vue'
import NavMain from '@/components/NavMain.vue'
import NavSecondary from '@/components/NavSecondary.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { getAuthUser, getDisplayName } from '@/lib/authSession'

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Appeals",
      url: "/appeals",
      icon: IconListDetails,
    },
    {
      title: "Drafts",
      url: "/drafts",
      icon: IconFileDescription,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: IconNotification,
    },
  ],
}

const user = computed(() => {
  const authUser = getAuthUser()
  return {
    name: getDisplayName(authUser),
    email: authUser?.email || 'Not signed in',
    avatar: '',
  }
})
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <RouterLink to="/dashboard">
              <IconInnerShadowTop class="!size-5" />
              <span class="text-base font-semibold">NNCYB</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>

<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import {
  IconSettings,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-vue"
import { RouterLink } from "vue-router"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface User {
  name: string
  email: string
  avatar: string
}

defineProps<{
  user: User
  compact?: boolean
  accountTo?: string
  settingsTo?: string
  loginTo?: string
}>()

const { isMobile } = useSidebar()

function initials(value: string) {
  const cleaned = value.trim()
  if (!cleaned)
    return 'U'

  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1)
    return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            :size="compact ? 'sm' : 'lg'"
            :class="[
              'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
              compact ? 'justify-center p-0' : '',
            ]"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                {{ initials(user.name) }}
              </AvatarFallback>
            </Avatar>
            <div :class="compact ? 'hidden' : 'grid flex-1 text-left text-sm leading-tight'">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span class="text-muted-foreground truncate text-xs">
                {{ user.email }}
              </span>
            </div>
            <IconDotsVertical v-if="!compact" class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
          align="end"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{ initials(user.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ user.name }}</span>
                <span class="text-muted-foreground truncate text-xs">
                  {{ user.email }}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <RouterLink :to="accountTo ?? '/account'">
                <IconUserCircle />
                Account
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <RouterLink :to="settingsTo ?? '/settings'">
                <IconSettings />
                Settings
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <RouterLink :to="loginTo ?? '/login'">
              <IconLogout />
              Log out
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { AlertTriangle, CheckCheck, Command, ListChecks } from "lucide-vue-next"
import { computed, h, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import NavUser from "@/components/NavUser.vue"
import { getAuthUser, getDisplayName } from "@/lib/authSession"
import { useAdminRequestsStore } from "@/stores/adminRequests"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

type QueueState = "pending" | "appealed" | "approved" | "denied"

const data = {
  navMain: [
    {
      title: "Request Queue",
      key: "queue",
      icon: ListChecks,
      isActive: true,
    },
    {
      title: "Appeals",
      key: "appeals",
      icon: AlertTriangle,
      isActive: false,
    },
    {
      title: "Resolved",
      key: "resolved",
      icon: CheckCheck,
      isActive: false,
    },
  ],
}

const user = computed(() => {
  const authUser = getAuthUser()
  return {
    name: getDisplayName(authUser),
    email: authUser?.email || "Not signed in",
    avatar: "",
  }
})

const activeItem = ref(data.navMain[0])
const onlyHighPriority = ref(false)
const queueSearch = ref("")
const { setOpen } = useSidebar()
const { requests, fetchRequests, isLoaded, errorMessage } = useAdminRequestsStore()
const loadError = ref("")

onMounted(async () => {
  if (isLoaded.value)
    return

  try {
    await fetchRequests()
  }
  catch {
    loadError.value = errorMessage.value || "Failed to load requests."
  }
})

const visibleRequests = computed(() => {
  let result = requests.value.filter((request) => {
    if (activeItem.value.key === "queue")
      return request.status === "pending"
    if (activeItem.value.key === "appeals")
      return request.status === "appealed"
    return request.status === "approved" || request.status === "denied"
  })

  if (onlyHighPriority.value)
    result = result.filter((request) => request.priorityScore >= 4)

  const needle = queueSearch.value.trim().toLowerCase()
  if (needle) {
    result = result.filter((request) =>
      [request.id, request.requester, request.requestTitle, request.details].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    )
  }

  return result
})

function statusClass(status: QueueState) {
  if (status === "approved")
    return "bg-emerald-100 text-emerald-800"
  if (status === "denied")
    return "bg-rose-100 text-rose-800"
  if (status === "appealed")
    return "bg-amber-100 text-amber-800"
  return "bg-slate-100 text-slate-800"
}

function priorityLabel(priorityScore: number) {
  return `${priorityScore}/5`
}
</script>

<template>
  <Sidebar
    class="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    v-bind="props"
  >
    <!-- This is the first sidebar -->
    <!-- We disable collapsible and adjust width to icon. -->
    <!-- This will make the sidebar appear as icons. -->
    <Sidebar
      collapsible="none"
      class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
              <a href="#">
                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">Acme Inc</span>
                  <span class="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent class="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
                <SidebarMenuButton
                  :tooltip="h('div', { hidden: false }, item.title)"
                  :is-active="activeItem?.title === item.title"
                  class="px-2.5 md:px-2"
                  @click="() => {
                    activeItem = item
                    setOpen(true)
                  }"
                >
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="p-2">
        <NavUser
          :user="user"
          compact
          account-to="/admin/account"
          settings-to="/admin/settings"
        />
      </SidebarFooter>
    </Sidebar>

    <!--  This is the second sidebar -->
    <!--  We disable collapsible and let it fill remaining space -->
    <Sidebar collapsible="none" class="hidden flex-1 md:flex">
      <SidebarHeader class="gap-3.5 border-b p-4">
        <div class="flex w-full items-center justify-between">
          <div class="text-base font-medium text-foreground">
            {{ activeItem.title }}
          </div>
          <Label class="flex items-center gap-2 text-sm">
            <span>High Priority</span>
            <Switch v-model="onlyHighPriority" class="shadow-none" />
          </Label>
        </div>
        <SidebarInput v-model="queueSearch" placeholder="Search requests..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup class="px-0">
          <SidebarGroupContent>
            <RouterLink
              v-for="request in visibleRequests"
              :key="request.id"
              :to="{ path: '/admin', query: { request: request.id } }"
              class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
            >
              <div class="flex w-full items-center gap-2">
                <span class="font-medium">{{ request.requester }}</span>
                <span class="text-muted-foreground ml-auto text-xs">{{ request.submittedAt }}</span>
              </div>
              <div class="flex w-full items-center justify-between gap-2">
                <span class="truncate font-medium">{{ request.requestTitle }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  :class="statusClass(request.status)"
                >
                  {{ request.status }}
                </span>
              </div>
              <span class="text-muted-foreground line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {{ request.details }}
              </span>
              <span class="text-muted-foreground text-[11px] uppercase tracking-wide">
                {{ request.id }} • Priority {{ priorityLabel(request.priorityScore) }}
              </span>
            </RouterLink>
            <div
              v-if="visibleRequests.length === 0"
              class="text-muted-foreground p-4 text-xs"
            >
              No requests match this filter.
            </div>
            <div v-if="loadError" class="text-destructive p-4 text-xs">
              {{ loadError }}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </Sidebar>
</template>

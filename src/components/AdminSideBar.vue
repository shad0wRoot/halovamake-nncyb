<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { AlertTriangle, CheckCheck, Command, ListChecks } from "lucide-vue-next"
import { computed, h, onMounted, ref, watch } from "vue"
import { RouterLink, useRoute } from "vue-router"
import NavUser from "@/components/NavUser.vue"
import { getAuthUser, getDisplayName } from "@/lib/authSession"
import { collectAvailableTags, getReviewerSelectedTags, requestTag, saveReviewerSelectedTags, tagLabel } from "@/lib/reviewerTags"
import { useAdminRequestsStore } from "@/stores/adminRequests"
import { Badge } from "@/components/ui/badge"
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
const route = useRoute()

type QueueState = "pending" | "appealed" | "approved" | "denied" | "draft"

const data = {
  navMain: [
    {
      title: "Request Queue",
      key: "queue",
      icon: ListChecks,
      isActive: true,
    },
    {
      title: "My Tags",
      key: "my-tags",
      icon: Command,
      isActive: false,
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
const selectedTags = ref<string[]>([])
const { setOpen, state } = useSidebar()
const { requests, fetchRequests, isLoaded, errorMessage } = useAdminRequestsStore()
const loadError = ref("")
const reviewerEmail = computed(() => getAuthUser()?.email?.toLowerCase() || "")

onMounted(async () => {
  selectedTags.value = getReviewerSelectedTags(reviewerEmail.value)

  if (isLoaded.value)
    return

  try {
    await fetchRequests()
  }
  catch {
    loadError.value = errorMessage.value || "Failed to load requests."
  }
})

watch(selectedTags, (value) => {
  saveReviewerSelectedTags(reviewerEmail.value, value)
}, { deep: true })

const availableTags = computed(() => collectAvailableTags(requests.value))

const visibleRequests = computed(() => {
  let result = requests.value.filter((request) => {
    const key = activeItem.value?.key
    if (key === "queue")
      return request.status === "pending"
    if (key === "my-tags") {
      if (selectedTags.value.length === 0)
        return false
      const tag = requestTag(request)
      const isActionable = request.status === "pending" || request.status === "appealed"
      return isActionable && selectedTags.value.includes(tag)
    }
    if (key === "appeals")
      return request.status === "appealed"
    return request.status === "approved" || request.status === "denied"
  })

  if (onlyHighPriority.value)
    result = result.filter((request) => request.priorityScore <= 3)

  const needle = queueSearch.value.trim().toLowerCase()
  if (needle) {
    result = result.filter((request) =>
      [request.id, request.requester, request.requestTitle, request.details].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    )
  }

  return [...result].sort((left, right) => {
    if (left.priorityScore !== right.priorityScore)
      return left.priorityScore - right.priorityScore

    return right.submittedAt.localeCompare(left.submittedAt)
  })
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
  return String(priorityScore)
}
</script>

<template>
  <Sidebar
    class="border-r bg-sidebar *:data-[sidebar=sidebar]:flex-row"
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
    <Sidebar
      collapsible="none"
      class="hidden border-r transition-[width,opacity,border-color] duration-200 ease-linear md:flex"
      :class="state === 'collapsed'
        ? 'w-0 min-w-0 border-r-0 opacity-0 pointer-events-none'
        : 'w-[calc(var(--sidebar-width)-var(--sidebar-width-icon)-1px)] shrink-0 opacity-100'"
    >
      <SidebarHeader class="gap-3.5 border-b p-4">
        <div class="flex w-full items-center justify-between">
          <div class="text-base font-medium text-foreground">
            {{ activeItem?.title }}
          </div>
          <Label class="flex items-center gap-2 text-sm">
            <span>High Priority</span>
            <Switch v-model="onlyHighPriority" class="shadow-none" />
          </Label>
        </div>
        <SidebarInput v-model="queueSearch" placeholder="Search requests..." />
        <div v-if="activeItem?.key === 'my-tags'" class="flex flex-wrap gap-1">
          <Badge
            v-for="tag in selectedTags"
            :key="tag"
            variant="secondary"
            class="text-[11px]"
          >
            {{ tagLabel(tag) }}
          </Badge>
          <span v-if="selectedTags.length === 0" class="text-muted-foreground text-xs">
            No preferred tags selected yet. Set them in Admin Settings.
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent class="overflow-y-auto">
        <SidebarGroup class="px-0">
          <SidebarGroupContent>
            <RouterLink
              v-for="request in visibleRequests"
              :key="request.id"
              :to="{ path: '/admin', query: { request: request.id } }"
              class="text-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              :class="route.query.request === request.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''"
            >
              <div class="flex w-full items-center gap-2">
                <span class="max-w-[170px] truncate font-medium lg:max-w-[210px]">{{ request.requester }}</span>
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
              <div
                v-if="request.activeReviewerEmail"
                class="inline-flex max-w-full items-center gap-1.5 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300"
                :title="request.activeReviewerEmail"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-300" />
                <span class="truncate">
                  Assigned to {{ request.activeReviewerName || request.activeReviewerEmail }}
                </span>
              </div>
              <span class="text-muted-foreground line-clamp-2 w-full whitespace-break-spaces text-xs">
                {{ request.details }}
              </span>
              <div class="flex w-full items-center justify-between gap-2">
                <span class="text-muted-foreground text-[11px] uppercase tracking-wide">
                  {{ request.id }} • Priority {{ priorityLabel(request.priorityScore) }}
                </span>
                <Badge variant="outline" class="text-[10px]">
                  {{ tagLabel(requestTag(request)) }}
                </Badge>
              </div>
            </RouterLink>
            <div
              v-if="visibleRequests.length === 0"
              class="text-muted-foreground p-4 text-xs"
            >
              <span v-if="activeItem?.key === 'my-tags' && selectedTags.length === 0">
                Choose your preferred tags in Admin Settings first.
              </span>
              <span v-else>
                No requests match this filter.
              </span>
            </div>
            <div v-if="loadError" class="text-destructive p-4 text-xs">
              {{ loadError }}
            </div>
            <div v-if="activeItem?.key === 'my-tags' && selectedTags.length > 0" class="text-muted-foreground p-4 pt-0 text-[11px]">
              Available tags in DB:
              {{ availableTags.map(tagLabel).join(", ") }}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </Sidebar>
</template>

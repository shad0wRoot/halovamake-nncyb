<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import { ArrowLeft } from "lucide-vue-next"
import { getAuthUser } from "@/lib/authSession"
import { collectAvailableTags, getReviewerSelectedTags, saveReviewerSelectedTags, tagLabel } from "@/lib/reviewerTags"
import { useAdminRequestsStore } from "@/stores/adminRequests"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const { requests, fetchRequests, isLoaded } = useAdminRequestsStore()
const authUser = getAuthUser()
const reviewerEmail = authUser?.email?.toLowerCase() || ""

const selectedTags = ref<string[]>([])
const saveNotice = ref("")

const availableTags = computed(() => collectAvailableTags(requests.value))

onMounted(async () => {
  if (!isLoaded.value) {
    try {
      await fetchRequests()
    }
    catch {
      // Keep settings page usable even if backend fetch fails.
    }
  }

  selectedTags.value = getReviewerSelectedTags(reviewerEmail)
})

watch(selectedTags, (value) => {
  saveReviewerSelectedTags(reviewerEmail, value)
  saveNotice.value = "Saved. Sidebar recommendations are now updated."
  window.setTimeout(() => {
    saveNotice.value = ""
  }, 1800)
}, { deep: true })

function isSelected(tag: string) {
  return selectedTags.value.includes(tag)
}

function toggleTag(tag: string) {
  if (isSelected(tag)) {
    selectedTags.value = selectedTags.value.filter(item => item !== tag)
    return
  }

  selectedTags.value = [...selectedTags.value, tag]
}

function selectAll() {
  selectedTags.value = [...availableTags.value]
}

function clearAll() {
  selectedTags.value = []
}
</script>

<template>
  <section class="px-4 py-6 lg:px-10">
    <div class="mx-auto w-full max-w-[1380px]">
      <div class="mb-4 flex items-center justify-between gap-3">
        <Button as-child type="button" variant="outline" size="sm">
          <RouterLink to="/admin">
            <ArrowLeft class="size-4" />
            Back to Inbox
          </RouterLink>
        </Button>
        <Badge variant="secondary">Reviewer configuration</Badge>
      </div>

      <div class="rounded-3xl border bg-card p-6 shadow-xs lg:p-10">
        <h1 class="text-foreground text-3xl font-semibold tracking-tight">Reviewer Settings</h1>
        <p class="text-muted-foreground mt-2 text-base">
          Configure which request tags you want to focus on in moderation.
        </p>

        <div class="mt-8 mx-auto w-full max-w-[980px] rounded-2xl border bg-background/60 p-6 lg:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-lg font-semibold">Preferred Tags</p>
              <p class="text-muted-foreground mt-1 text-base">
                Requests with these tags will be recommended in section 2 of your inbox.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" @click="selectAll">
                Select all
              </Button>
              <Button type="button" size="sm" variant="outline" @click="clearAll">
                Clear
              </Button>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button
              v-for="tag in availableTags"
              :key="tag"
              type="button"
              class="rounded-full border px-4 py-2.5 text-base transition-colors"
              :class="isSelected(tag) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-accent'"
              @click="toggleTag(tag)"
            >
              {{ tagLabel(tag) }}
            </button>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              Selected {{ selectedTags.length }}
            </Badge>
            <span v-if="saveNotice" class="text-sm text-emerald-700">{{ saveNotice }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

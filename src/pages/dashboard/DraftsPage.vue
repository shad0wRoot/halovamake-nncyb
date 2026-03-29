<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<template>
  <section class="px-4 lg:px-6">
    <div class="space-y-4">
      <div class="border rounded-lg p-6">
        <h2 class="text-foreground text-xl font-semibold">Drafts</h2>
        <p class="text-muted-foreground mt-2 text-sm">Continue editing your saved draft requests.</p>
      </div>

      <div v-if="isLoading" class="text-sm text-muted-foreground">Loading drafts...</div>
      <div v-else-if="loadError" class="text-sm text-destructive">{{ loadError }}</div>
      <div v-else-if="drafts.length === 0" class="border rounded-lg p-6 text-sm text-muted-foreground">
        No drafts yet. Save a draft from the Create page and it will appear here.
      </div>

      <div v-else class="space-y-3">
        <article v-for="draft in drafts" :key="draft.id" class="border rounded-lg p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-foreground">{{ draft.requestTitle }}</h3>
              <p class="text-xs text-muted-foreground mt-1">{{ draft.companyName || 'No company specified' }}</p>
            </div>
            <span class="rounded-full border px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">Draft</span>
          </div>
          <p class="mt-3 text-sm text-muted-foreground line-clamp-3">{{ draft.details }}</p>
          <p class="mt-3 text-xs text-muted-foreground">Saved: {{ draft.submittedAt }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" @click="openDraft(draft.id)">Open Draft</Button>
            <Button type="button" size="sm" variant="destructive" @click="removeDraft(draft.id)">Delete Draft</Button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { useAdminRequestsStore } from '@/stores/adminRequests'

const DRAFT_KEY = 'nncyb-create-request-draft'
const ROLE_OPTIONS = [
  'investor-lp',
  'investor-gp',
  'government',
  'media',
  'freelancer',
  'startup',
  'portfolio-startup',
  'other',
] as const

const router = useRouter()
const { requests, isLoading, fetchRequests, deleteRequest } = useAdminRequestsStore()
const loadError = ref('')

const drafts = computed(() =>
  requests.value.filter(request => request.status === 'draft'),
)

onMounted(async () => {
  loadError.value = ''
  try {
    await fetchRequests()
  }
  catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : 'Failed to load drafts.'
  }
})

async function removeDraft(id: string) {
  const target = requests.value.find(request => request.id === id && request.status === 'draft')
  const draftName = target?.requestTitle || 'this draft'
  const confirmed = window.confirm(`Delete ${draftName}? This action cannot be undone.`)
  if (!confirmed)
    return

  loadError.value = ''
  try {
    await deleteRequest(id)
  }
  catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to delete draft.'
  }
}

function openDraft(id: string) {
  const target = requests.value.find(request => request.id === id && request.status === 'draft')
  if (!target)
    return

  const normalizedRole = ROLE_OPTIONS.includes(String(target.role) as typeof ROLE_OPTIONS[number])
    ? String(target.role)
    : ''

  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    __draftId: target.id,
    fullName: target.requester,
    companyName: target.companyName,
    companyLocation: target.companyLocation,
    companyType: target.companyType,
    role: normalizedRole,
    requestTitle: target.requestTitle,
    description: target.details,
    contactEmail: target.contactEmail,
    contactPhone: target.contactPhone,
    contactLinkedIn: target.contactLinkedIn || '',
    website: target.website || '',
  }))

  void router.push({ name: 'create' })
}
</script>

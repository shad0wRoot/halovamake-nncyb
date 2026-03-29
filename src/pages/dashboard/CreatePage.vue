<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import * as z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getActiveEmail } from '@/lib/authSession'
import { useAdminRequestsStore } from '@/stores/adminRequests'

const optionalUrl = z.union([
  z.literal(''),
  z.string().url('Please enter a valid URL (https://...)'),
])

const DRAFT_KEY = 'nncyb-create-request-draft'

const formSchema = toTypedSchema(z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(100),
  companyName: z.string().trim().max(120).optional(),
  companyLocation: z.string().trim().max(120).optional(),
  companyType: z.string().trim().max(80).optional(),
  role: z.string().trim().min(1, 'Please select your role'),
  requestTitle: z.string().trim().min(3, 'Request title is required').max(120),
  description: z.string().trim().min(100, 'Please provide more detail (min 100 characters)').max(3000),
  contactEmail: z.string().trim().email('Please enter a valid email'),
  contactPhone: z.string().trim().min(5, 'Phone is required').max(30),
  contactLinkedIn: optionalUrl,
  website: optionalUrl,
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    fullName: '',
    companyName: '',
    companyLocation: '',
    companyType: '',
    role: '',
    requestTitle: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    contactLinkedIn: '',
    website: '',
  },
})

const { createRequest } = useAdminRequestsStore()
const submitMessage = ref('')
const submitError = ref('')
const draftMessage = ref('')

function saveDraft() {
  void saveDraftToBackend()
}

async function saveDraftToBackend() {
  submitError.value = ''
  submitMessage.value = ''

  const values = form.values
  const ownerEmail = getActiveEmail() || values.contactEmail?.toLowerCase() || ''
  const fallbackEmail = ownerEmail || 'draft@nncyb.local'

  try {
    await createRequest({
      ownerEmail: ownerEmail || fallbackEmail,
      requestTitle: values.requestTitle?.trim() || 'Untitled Draft',
      requester: values.fullName?.trim() || 'Draft Author',
      role: values.role?.trim() || 'other',
      companyName: values.companyName?.trim() || '',
      companyLocation: values.companyLocation?.trim() || '',
      companyType: values.companyType?.trim() || '',
      contactEmail: values.contactEmail?.trim() || fallbackEmail,
      contactPhone: values.contactPhone?.trim() || '',
      contactLinkedIn: values.contactLinkedIn?.trim() || '',
      website: values.website?.trim() || '',
      details: values.description?.trim() || 'Draft in progress.',
      status: 'draft',
    })

    localStorage.setItem(DRAFT_KEY, JSON.stringify(form.values))
    draftMessage.value = 'Draft saved to Drafts.'
  }
  catch (error) {
    draftMessage.value = ''
    submitError.value = error instanceof Error
      ? error.message
      : 'Saving draft failed. Please try again.'
  }
}

onMounted(() => {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw)
    return

  try {
    const draft = JSON.parse(raw) as Record<string, string>
    form.resetForm({
      values: {
        ...form.values,
        ...draft,
      },
    })
    draftMessage.value = 'Draft restored.'
  }
  catch {
    localStorage.removeItem(DRAFT_KEY)
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  submitError.value = ''
  submitMessage.value = ''
  const ownerEmail = getActiveEmail() || values.contactEmail.toLowerCase()

  try {
    await createRequest({
      ownerEmail,
      requestTitle: values.requestTitle,
      requester: values.fullName,
      role: values.role,
      companyName: values.companyName || '',
      companyLocation: values.companyLocation || '',
      companyType: values.companyType || '',
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      contactLinkedIn: values.contactLinkedIn || '',
      website: values.website || '',
      details: values.description,
    })

    submitMessage.value = 'Request submitted successfully. It is now in the admin queue.'
    draftMessage.value = ''
    localStorage.removeItem(DRAFT_KEY)
    form.resetForm()
  }
  catch (error) {
    submitError.value = error instanceof Error
      ? error.message
      : 'Request submission failed. Check backend connection and try again.'
  }
})
</script>

<template>
  <section class="px-4 lg:px-6">
    <div class="w-full space-y-8">
      <div class="pb-2">
        <h2 class="text-xl font-semibold text-foreground">Create New Request</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Complete the details below to submit a new request. Required fields are marked clearly.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <div class="border-border/60 border-t pt-6">
          <h3 class="text-base font-semibold text-foreground">Request Details</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="requestTitle">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Request Title</FormLabel>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <FormControl>
                  <Input type="text" placeholder="Need funding for ..." v-bind="componentField" />
                </FormControl>
                <FormDescription>
                  Short, specific title that summarizes this request.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="description">
              <FormItem class="md:col-span-2">
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Description</FormLabel>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <FormControl>
                  <textarea
                    rows="5"
                    class="border-input bg-transparent ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1"
                    placeholder="Provide context, expected outcome, and any constraints... max 3000 characters."
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>

        <div class="border-border/60 border-t pt-6">
          <h3 class="text-base font-semibold text-foreground">Applicant Information</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="fullName">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Full Legal Name</FormLabel>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <FormControl>
                  <Input type="text" placeholder="John Doe" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="companyName">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Company Name</FormLabel>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <FormControl>
                  <Input type="text" placeholder="Binary Incompetence" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="companyLocation">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Address</FormLabel>
                  <Badge variant="outline">Required</Badge>
                </div>
                <FormControl>
                  <Input type="text" placeholder="Bratislava, Slovakia" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="companyType">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Company Type</FormLabel>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <FormControl>
                  <Input type="text" placeholder="Venture Capital Firm" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="role">
              <FormItem class="md:col-span-2">
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Role</FormLabel>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <FormControl>
                  <select
                    class="border-input bg-transparent ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-1"
                    v-bind="componentField"
                  >
                    <option disabled value="">Select role</option>
                    <option value="investor-lp">Investor LP</option>
                    <option value="investor-gp">Investor GP</option>
                    <option value="government">Government</option>
                    <option value="media">Media</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="startup">Startup</option>
                    <option value="portfolio-startup">Portfolio Startup</option>
                    <option value="other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>

        <div class="border-border/60 border-t pt-6">
          <h3 class="text-base font-semibold text-foreground">Contact</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="contactEmail">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Email</FormLabel>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <FormControl>
                  <Input type="email" placeholder="john@company.com" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="contactPhone">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Phone</FormLabel>
                  <Badge variant="outline">Required</Badge>
                </div>
                <FormControl>
                  <Input type="tel" placeholder="+421 900 123 456" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="contactLinkedIn">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>LinkedIn</FormLabel>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <FormControl>
                  <Input type="url" placeholder="https://linkedin.com/in/username" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="website">
              <FormItem>
                <div class="mb-1 flex items-center gap-2">
                  <FormLabel>Website</FormLabel>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <FormControl>
                  <Input type="url" placeholder="https://yourcompany.com" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" @click="saveDraft">Save Draft</Button>
          <Button type="submit">Submit Request</Button>
        </div>
        <p v-if="draftMessage" class="text-sm text-muted-foreground">
          {{ draftMessage }}
        </p>
        <p v-if="submitMessage" class="text-sm text-emerald-600">
          {{ submitMessage }}
        </p>
        <p v-if="submitError" class="text-destructive text-sm">
          {{ submitError }}
        </p>
      </form>
    </div>
  </section>
</template>

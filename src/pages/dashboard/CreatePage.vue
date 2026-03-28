<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
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

const optionalUrl = z.union([
  z.literal(''),
  z.string().url('Please enter a valid URL (https://...)'),
])

const formSchema = toTypedSchema(z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(100),
  companyName: z.string().trim().max(120).optional(),
  companyLocation: z.string().trim().max(120).optional(),
  companyType: z.string().trim().max(80).optional(),
  role: z.string().trim().min(1, 'Please select your role'),
  requestTitle: z.string().trim().min(3, 'Request title is required').max(120),
  description: z.string().trim().min(100, 'Please provide more detail (min 100 characters)').max(3000),
  contactEmail: z.string().trim().email('Please enter a valid email'),
  contactPhone: z.string().trim().max(30).optional(),
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

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values)
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
          <Button type="button" variant="outline">Save Draft</Button>
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </div>
  </section>
</template>

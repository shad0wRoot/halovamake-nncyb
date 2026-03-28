<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useFormField } from "./useFormField"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { error, formMessageId } = useFormField()
</script>

<template>
  <p
    :id="formMessageId"
    data-slot="form-message"
    :class="cn('text-destructive text-sm min-h-5 leading-5', !error && 'invisible', props.class)"
  >
    {{ error || ' ' }}
  </p>
</template>

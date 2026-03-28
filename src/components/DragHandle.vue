<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { IconGripVertical } from "@tabler/icons-vue"
import { useSortableContext } from "dnd-kit-vue"
import { Button } from '@/components/ui/button'

const { handleRef, sortable } = useSortableContext()
</script>

<template>
  <Button
    :ref="handleRef as any"
    variant="ghost"
    size="icon"
    class="text-muted-foreground size-7 hover:bg-transparent"
  >
    <IconGripVertical class="text-muted-foreground size-3" />
    <span class="sr-only">Drag to reorder</span>
  </Button>
</template>

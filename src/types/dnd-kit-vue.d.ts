// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

declare module "dnd-kit-vue" {
  import type { DefineComponent, Ref } from "vue"

  export const DragDropProvider: DefineComponent<{
    modifiers?: unknown[]
  }>

  export function useSortable(options: {
    id: string | number
    index: number
  }): {
    elementRef: Ref<HTMLElement | null>
    isDragging: Ref<boolean>
  }

  export function useSortableContext(): {
    handleRef: Ref<HTMLElement | null>
    sortable: unknown
  }
}

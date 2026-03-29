<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script lang="ts">
import { z } from "zod"
import DraggableRow from "./DraggableRow.vue"
import DragHandle from "./DragHandle.vue"

export const schema = z.object({
  id: z.number(),
  title: z.string(),
  companyType: z.string(),
  status: z.string(),
  priority: z.string(),
  submittedAt: z.string(),
  reviewer: z.string(),
  decision: z.string(),
})
</script>

<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
} from "@tabler/icons-vue"
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import { DragDropProvider } from "dnd-kit-vue"
import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Tabs,
  TabsContent,
} from '@/components/ui/tabs'
import { h, ref } from "vue"

const props = defineProps<{
  data: TableData[]
}>()

interface TableData {
  id: number
  title: string
  companyType: string
  status: string
  priority: string
  submittedAt: string
  reviewer: string
  decision: string
}

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const viewDialogOpen = ref(false)
const viewedRequest = ref<TableData | null>(null)

const columns: ColumnDef<TableData>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => h(DragHandle),
  },
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": (value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value),
      "aria-label": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": (value: boolean | "indeterminate") => row.toggleSelected(!!value),
      "aria-label": "Select row",
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Request",
    cell: ({ row }) => h("div", { class: "text-foreground font-medium" }, String(row.getValue("title"))),
    enableHiding: false,
  },
  {
    accessorKey: "companyType",
    header: "Company Type",
    cell: ({ row }) => h(Badge, {
      variant: "outline",
      class: "text-foreground",
    }, () => String(row.getValue("companyType"))),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const approved = status === "Approved"
      const denied = status === "Denied"
      return h("div", { class: "flex items-center gap-2" }, [
        approved
          ? h(IconCircleCheckFilled, { class: "h-4 w-4 text-emerald-500" })
          : denied
            ? h("span", { class: "h-2.5 w-2.5 rounded-full bg-rose-500" })
            : h(IconLoader, { class: "h-4 w-4 animate-spin text-muted-foreground" }),
        h("span", { class: denied ? "text-rose-700 font-medium" : "" }, status),
      ])
    },
  },
  {
    accessorKey: "priority",
    header: () => h("div", { class: "flex items-center gap-1" }, [
      "Priority",
    ]),
    cell: ({ row }) => h(Button, {
      variant: "ghost",
      size: "sm",
      class: "h-auto p-1 text-xs font-mono",
    }, () => [
      h("span", { class: "ml-1 font-semibold" }, String(row.getValue("priority"))),
    ]),
  },
  {
    accessorKey: "submittedAt",
    header: () => h("div", { class: "flex items-center gap-1" }, [
      "Submitted",
    ]),
    cell: ({ row }) => h(Button, {
      variant: "ghost",
      size: "sm",
      class: "h-auto p-1 text-xs font-mono",
    }, () => [
      h("span", { class: "ml-1 font-semibold" }, String(row.getValue("submittedAt"))),
    ]),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewed By",
    cell: ({ row }) => {
      const reviewer = row.getValue("reviewer") as string
      if (reviewer === "Not reviewed") {
        return h("span", { class: "text-muted-foreground" }, "Unassigned")
      }

      return h("span", { class: "text-foreground" }, reviewer)
    },
  },
  {
    accessorKey: "decision",
    header: "Decision Note",
    cell: ({ row }) => {
      const decision = String(row.getValue("decision"))
      if (!decision || decision === "No decision yet")
        return h("span", { class: "text-muted-foreground" }, "No decision yet")

      return h("span", { class: "text-foreground line-clamp-2 max-w-[220px]" }, decision)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => h(DropdownMenu, {}, {
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, {
          default: () => h(Button, {
            variant: "ghost",
            class: "h-8 w-8 p-0",
          }, {
            default: () => [
              h("span", { class: "sr-only" }, "Open menu"),
              h(IconDotsVertical, { class: "h-4 w-4" }),
            ],
          }),
        }),
        h(DropdownMenuContent, { align: "end" }, {
          default: () => [
            h(DropdownMenuItem, {
              onSelect: (event: Event) => {
                event.preventDefault()
                viewedRequest.value = row.original
                viewDialogOpen.value = true
              },
            }, () => "View details"),
          ],
        }),
      ],
    }),
  },
]

const table = useVueTable({
  get data() {
    return props.data
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: (updaterOrValue) => {
    sorting.value = typeof updaterOrValue === "function"
      ? updaterOrValue(sorting.value)
      : updaterOrValue
  },
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value = typeof updaterOrValue === "function"
      ? updaterOrValue(columnFilters.value)
      : updaterOrValue
  },
  onColumnVisibilityChange: (updaterOrValue) => {
    columnVisibility.value = typeof updaterOrValue === "function"
      ? updaterOrValue(columnVisibility.value)
      : updaterOrValue
  },
  onRowSelectionChange: (updaterOrValue) => {
    rowSelection.value = typeof updaterOrValue === "function"
      ? updaterOrValue(rowSelection.value)
      : updaterOrValue
  },
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
  },
})
</script>

<template>
  <Tabs
    default-value="overview"
    class="w-full flex-col justify-start gap-6"
  >
    <div class="flex items-center justify-between px-4 lg:px-6">
      <h2 class="text-foreground text-sm font-semibold tracking-wide uppercase">
        Overview
      </h2>
      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span class="hidden lg:inline">Customize Columns</span>
              <span class="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <template v-for="column in table.getAllColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())" :key="column.id">
              <DropdownMenuCheckboxItem
                class="capitalize"
                :model-value="column.getIsVisible()"
                @update:model-value="(value) => {

                  column.toggleVisibility(!!value)
                }"
              >
                {{ column.id }}
              </DropdownMenuCheckboxItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <TabsContent
      value="overview"
      class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
    >
      <div class="overflow-hidden rounded-lg border">
        <DragDropProvider>
          <Table>
            <TableHeader class="bg-muted sticky top-0 z-10">
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead v-for="header in headerGroup.headers" :key="header.id" :col-span="header.colSpan">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="**:data-[slot=table-cell]:first:w-8">
              <template v-if="table.getRowModel().rows.length">
                <DraggableRow v-for="row in table.getRowModel().rows" :key="row.id" :row="row" :index="row.index" />
              </template>
              <TableRow v-else :col-span="columns.length"
                  class="h-24 text-center">
                  No results.
              </TableRow>
            </TableBody>
          </Table>
        </DragDropProvider>
        <!-- <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          > -->
        <!-- </DndContext> -->
      </div>
      <div class="flex items-center justify-between px-4">
        <div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {{ table.getFilteredSelectedRowModel().rows.length }} of
          {{ table.getFilteredRowModel().rows.length }} row(s) selected.
        </div>
        <div class="flex w-full items-center gap-8 lg:w-fit">
          <div class="hidden items-center gap-2 lg:flex">
            <Label for="rows-per-page" class="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              :model-value="table.getState().pagination.pageSize"
              @update:model-value="(value) => {
                table.setPageSize(Number(value))
              }"
            >
              <SelectTrigger id="rows-per-page" size="sm" class="w-20">
                <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
                  {{ pageSize }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex w-fit items-center justify-center text-sm font-medium">
            Page {{ table.getState().pagination.pageIndex + 1 }} of
            {{ table.getPageCount() }}
          </div>
          <div class="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              class="hidden h-8 w-8 p-0 lg:flex"
              :disabled="!table.getCanPreviousPage()"
              @click="table.setPageIndex(0)"
            >
              <span class="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              class="size-8"
              size="icon"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()"
            >
              <span class="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              class="size-8"
              size="icon"
              :disabled="!table.getCanNextPage()"
              @click="table.nextPage()"
            >
              <span class="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              class="hidden size-8 lg:flex"
              size="icon"
              :disabled="!table.getCanNextPage()"
              @click="table.setPageIndex(table.getPageCount() - 1)"
            >
              <span class="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </TabsContent>
    <TabsContent
      value="past-performance"
      class="flex flex-col px-4 lg:px-6"
    >
      <div class="aspect-video w-full flex-1 rounded-lg border border-dashed" />
    </TabsContent>
    <TabsContent value="key-personnel" class="flex flex-col px-4 lg:px-6">
      <div class="aspect-video w-full flex-1 rounded-lg border border-dashed" />
    </TabsContent>
    <TabsContent
      value="focus-documents"
      class="flex flex-col px-4 lg:px-6"
    >
      <div class="aspect-video w-full flex-1 rounded-lg border border-dashed" />
    </TabsContent>
  </Tabs>
  <Dialog v-model:open="viewDialogOpen">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ viewedRequest?.title || "Request details" }}</DialogTitle>
        <DialogDescription>Read-only request summary.</DialogDescription>
      </DialogHeader>
      <div v-if="viewedRequest" class="grid gap-3 text-sm">
        <div><span class="text-muted-foreground">Status:</span> {{ viewedRequest.status }}</div>
        <div><span class="text-muted-foreground">Company Type:</span> {{ viewedRequest.companyType }}</div>
        <div><span class="text-muted-foreground">Priority:</span> {{ viewedRequest.priority }}</div>
        <div><span class="text-muted-foreground">Submitted:</span> {{ viewedRequest.submittedAt }}</div>
        <div><span class="text-muted-foreground">Reviewed By:</span> {{ viewedRequest.reviewer }}</div>
        <div><span class="text-muted-foreground">Decision Note:</span> {{ viewedRequest.decision }}</div>
      </div>
    </DialogContent>
  </Dialog>
</template>

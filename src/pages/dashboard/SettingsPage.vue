<!--
SPDX-FileCopyrightText: 2026 Martin Kralovic
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeas Ditte
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import { Monitor, Moon, Sun } from "lucide-vue-next"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

type ThemeMode = "light" | "dark" | "system"

const THEME_STORAGE_KEY = "nncyb-theme"

const themeMode = ref<ThemeMode>("system")
const desktopNotifications = ref(true)
const weeklySummary = ref(false)
const savedAtLabel = ref("Not saved yet")

const currentThemeLabel = computed(() => {
  if (themeMode.value === "light")
    return "Light"
  if (themeMode.value === "dark")
    return "Dark"
  return "System"
})

function resolveIsDark(mode: ThemeMode) {
  if (mode === "dark")
    return true
  if (mode === "light")
    return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyTheme(mode: ThemeMode) {
  const shouldUseDark = resolveIsDark(mode)
  document.documentElement.classList.toggle("dark", shouldUseDark)
}

function selectTheme(mode: ThemeMode) {
  themeMode.value = mode
}

function saveSettings() {
  localStorage.setItem(THEME_STORAGE_KEY, themeMode.value)
  savedAtLabel.value = `Saved at ${new Date().toLocaleTimeString()}`
}

function handleSystemThemeChange() {
  if (themeMode.value === "system")
    applyTheme("system")
}

watch(themeMode, (mode) => {
  applyTheme(mode)
  localStorage.setItem(THEME_STORAGE_KEY, mode)
}, { immediate: true })

onMounted(() => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system")
    themeMode.value = stored

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", handleSystemThemeChange)

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", handleSystemThemeChange)
  })
})
</script>

<template>
  <section class="px-4 lg:px-6">
    <div class="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 class="text-2xl font-semibold">Settings</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Configure your experience. Theme changes apply across the whole app.
        </p>
      </div>

      <div class="rounded-xl border bg-card p-4 shadow-xs lg:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold">Appearance</h2>
            <p class="text-muted-foreground mt-1 text-sm">
              Pick a mode for this demo account.
            </p>
          </div>
          <Badge variant="outline">Current: {{ currentThemeLabel }}</Badge>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-3">
          <Button :variant="themeMode === 'light' ? 'default' : 'outline'" class="justify-start gap-2" @click="selectTheme('light')">
            <Sun class="size-4" />
            Light
          </Button>
          <Button :variant="themeMode === 'dark' ? 'default' : 'outline'" class="justify-start gap-2" @click="selectTheme('dark')">
            <Moon class="size-4" />
            Dark
          </Button>
          <Button :variant="themeMode === 'system' ? 'default' : 'outline'" class="justify-start gap-2" @click="selectTheme('system')">
            <Monitor class="size-4" />
            System
          </Button>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-4 shadow-xs lg:p-5">
        <h2 class="text-base font-semibold">Notifications</h2>
        <div class="mt-4 space-y-3">
          <label class="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Desktop Notifications</p>
              <p class="text-muted-foreground text-xs">Show in-app alerts for status changes.</p>
            </div>
            <Switch v-model="desktopNotifications" />
          </label>
          <label class="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Weekly Summary</p>
              <p class="text-muted-foreground text-xs">Receive a summary of requests each week.</p>
            </div>
            <Switch v-model="weeklySummary" />
          </label>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <p class="text-muted-foreground text-sm">{{ savedAtLabel }}</p>
        <Button @click="saveSettings">
          Save Settings
        </Button>
      </div>
    </div>
  </section>
</template>

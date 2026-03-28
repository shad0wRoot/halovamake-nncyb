// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

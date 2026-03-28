// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

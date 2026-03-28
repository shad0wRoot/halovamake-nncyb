// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './App.vue'
import router from './router'
import auth from './auth'

axios.defaults.baseURL = 'https://your-api.com'  // set your API base URL

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueAxios, axios)  // must be before auth
app.use(auth)

app.mount('#app')
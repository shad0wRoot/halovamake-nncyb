// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import "./assets/main.css";

import axios from "axios";
import { createPinia } from "pinia";
import { createApp } from "vue";
import VueAxios from "vue-axios";

import App from "./App.vue";
import auth from "./auth";
import router from "./router";

axios.defaults.baseURL = "http://localhost:8081"; // set your API base URL

type ThemeMode = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'nncyb-theme'

function resolveTheme(mode: ThemeMode) {
	if (mode === 'dark')
		return true
	if (mode === 'light')
		return false
	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyInitialTheme() {
	const stored = localStorage.getItem(THEME_STORAGE_KEY)
	const mode: ThemeMode = stored === 'light' || stored === 'dark' || stored === 'system'
		? stored
		: 'system'

	document.documentElement.classList.toggle('dark', resolveTheme(mode))
}

applyInitialTheme()

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueAxios, axios); // must be before auth
app.use(auth);

app.mount("#app");

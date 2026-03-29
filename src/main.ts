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

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueAxios, axios); // must be before auth
app.use(auth);

app.mount("#app");

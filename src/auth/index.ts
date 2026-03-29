// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import router from "@/router";
import axios from "axios";
import type { AuthDriver } from "vue-auth3";
import { createAuth } from "vue-auth3";

//axios.defaults.baseURL = "https://your-api.com";

const driverAuthBearer: AuthDriver = {
   request(_auth, options, token) {
      options.headers = options.headers ?? {};
      options.headers["Authorization"] = `Bearer ${token}`;
      return options;
   },
   response(_auth, response) {
      const header = (response.headers?.["authorization"] as string) ?? "";
      const data = (response.data as { token?: string })?.token ?? "";
      const raw = header || data;
      return raw.replace(/^Bearer\s?/, "") || null;
   },
};

const auth = createAuth({
   plugins: { router },
   drivers: {
      auth: driverAuthBearer,
      http: { request: axios },
   },
   loginData: {
      url: "/api/auth/login",
      method: "POST",
      redirect: { name: "dashboard" },
      fetchUser: true,
   },
   logoutData: {
      url: "/api/auth/logout",
      method: "POST",
      redirect: { name: "login" },
      makeRequest: true,
   },
   fetchData: {
      url: "/api/auth/user",
      method: "GET",
      enabled: true,
   },
   refreshToken: {
      enabled: false,
   },
});

export default auth;

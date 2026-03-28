// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { createAuth } from 'vue-auth3'
// @ts-ignore -- pnpm subpath resolution; types are bundled in dist
import driverAuthBearer from 'vue-auth3/drivers/auth/bearer'
// @ts-ignore
import driverHttpAxios from 'vue-auth3/drivers/http/axios'
import axios from 'axios'
import router from '@/router'

axios.defaults.baseURL = 'https://your-api.com'  // set your API base URL

const auth = createAuth({
  plugins: {
    router,
  },
  drivers: {
    auth: driverAuthBearer,
    http: driverHttpAxios,
  },
  loginData: {
    url: '/api/auth/login',
    method: 'POST',
    redirect: { name: 'dashboard' },
    fetchUser: true,
  },
  logoutData: {
    url: '/api/auth/logout',
    method: 'POST',
    redirect: { name: 'login' },
    makeRequest: true,
  },
  fetchData: {
    url: '/api/auth/user',
    method: 'GET',
    enabled: true,
  },
  refreshToken: {
    enabled: false,
  },
})

export default auth
// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/ui/sidebar/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { auth: false },    // public
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/ui/login/index.vue'),
      meta: { auth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/ui/signup/index.vue'),
      meta: { auth: false },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../components/ui/signup/index.vue'),
      meta: { auth: false },
    }, 
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../components/ui/sidebar/index.vue'),
      meta: { auth: false },     // requires login — redirects to /login if not authed TODO: set to true when auth is implemented
    },
  ],
})

export default router
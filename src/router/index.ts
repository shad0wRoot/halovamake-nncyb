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
      component: () => import('../views/LoginView.vue'),
      meta: { auth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { auth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/ui/login/index.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../components/ui/signup/index.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../components/ui/sidebar/index.vue'),
      meta: { auth: true },     // requires login — redirects to /login if not authed
    },
  ],
})

export default router
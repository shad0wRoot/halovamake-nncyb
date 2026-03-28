// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../components/ui/dashboard/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/',
      component: DashboardLayout,
      meta: { auth: false },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../components/ui/dashboard/index.vue'),
          meta: { auth: false },
        },
        {
          path: 'appeals',
          name: 'appeals',
          component: () => import('../components/ui/dashboard/AppealsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'drafts',
          name: 'drafts',
          component: () => import('../components/ui/dashboard/DraftsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'create',
          name: 'create',
          component: () => import('../components/ui/dashboard/CreatePage.vue'),
          meta: { auth: false },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../components/ui/dashboard/SettingsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('../components/ui/dashboard/AccountPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../components/ui/dashboard/NotificationsPage.vue'),
          meta: { auth: false },
        },
      ],
    },
  ],
})

export default router
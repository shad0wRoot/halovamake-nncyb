// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../pages/dashboard/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { auth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/SignupPage.vue'),
      meta: { auth: false },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../pages/SignupPage.vue'),
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
          component: () => import('../pages/dashboard/DashboardPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'appeals',
          name: 'appeals',
          component: () => import('../pages/dashboard/AppealsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'drafts',
          name: 'drafts',
          component: () => import('../pages/dashboard/DraftsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'create',
          name: 'create',
          component: () => import('../pages/dashboard/CreatePage.vue'),
          meta: { auth: false },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../pages/dashboard/SettingsPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('../pages/dashboard/AccountPage.vue'),
          meta: { auth: false },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../pages/dashboard/NotificationsPage.vue'),
          meta: { auth: false },
        },
      ],
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../pages/NotFoundPage.vue'),
      meta: { auth: false },     // requires login — redirects to /login if not authed TODO: set to true when auth is implemented
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'PageNotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { auth: false },     
}
  ],
})

export default router
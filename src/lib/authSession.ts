// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

export type AppUserRole = "user" | "admin" | string

export interface AppUser {
  id?: string
  fullName?: string
  name?: string
  email: string
  role?: AppUserRole
}

const TOKEN_KEY = "nncyb-auth-token"
const USER_KEY = "nncyb-auth-user"
const ACTIVE_EMAIL_KEY = "nncyb-active-email"

export function setAuthSession(token: string, user: AppUser | null) {
  localStorage.setItem(TOKEN_KEY, token)

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    if (user.email)
      localStorage.setItem(ACTIVE_EMAIL_KEY, user.email)
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw)
    return null

  try {
    return JSON.parse(raw) as AppUser
  }
  catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function getActiveEmail() {
  const fromUser = getAuthUser()?.email
  if (fromUser)
    return fromUser.toLowerCase()

  const fromStorage = localStorage.getItem(ACTIVE_EMAIL_KEY)
  if (fromStorage)
    return fromStorage.toLowerCase()

  return ""
}

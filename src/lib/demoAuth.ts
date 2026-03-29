// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

export type DemoUserRole = "user" | "admin"

export interface DemoUser {
  id: string
  fullName: string
  email: string
  password: string
  role: DemoUserRole
}

export interface DemoSession {
  token: string
  userId: string
}

const USERS_KEY = "nncyb-demo-users"
const SESSION_KEY = "nncyb-demo-session"

const seededUsers: DemoUser[] = [
  {
    id: "usr-admin-1",
    fullName: "Admin Team",
    email: "admin@nncyb.com",
    password: "admin1234",
    role: "admin",
  },
  {
    id: "usr-user-1",
    fullName: "Demo User",
    email: "user@nncyb.com",
    password: "user1234",
    role: "user",
  },
]

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers))
    return [...seededUsers]
  }

  try {
    const parsed = JSON.parse(raw) as DemoUser[]
    if (Array.isArray(parsed) && parsed.length > 0)
      return parsed
  }
  catch {
    // Fall through and reset corrupted local data.
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers))
  return [...seededUsers]
}

function writeUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function writeSession(session: DemoSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getCurrentSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw)
    return null

  try {
    return JSON.parse(raw) as DemoSession
  }
  catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function getCurrentUser() {
  const session = getCurrentSession()
  if (!session)
    return null

  const users = readUsers()
  return users.find(user => user.id === session.userId) ?? null
}

export function loginDemoUser(email: string, password: string) {
  const users = readUsers()
  const user = users.find(candidate =>
    candidate.email.toLowerCase() === email.trim().toLowerCase()
    && candidate.password === password,
  )

  if (!user)
    throw new Error("Invalid email or password.")

  const token = `demo-${user.id}-${Date.now()}`
  writeSession({ token, userId: user.id })

  return { token, user }
}

export function signupDemoUser(fullName: string, email: string, password: string) {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some(user => user.email.toLowerCase() === normalizedEmail))
    throw new Error("Account with this email already exists.")

  const newUser: DemoUser = {
    id: `usr-${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: "user",
  }

  users.push(newUser)
  writeUsers(users)

  return newUser
}

export function logoutDemoUser() {
  localStorage.removeItem(SESSION_KEY)
}

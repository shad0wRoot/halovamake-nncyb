// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import type { AdminRequest } from "@/stores/adminRequests"

const STORAGE_PREFIX = "nncyb-reviewer-tags"

export const DEFAULT_REVIEW_TAGS = [
  "freelancer",
  "startup",
  "portfolio-startup",
  "media",
  "government",
  "investor-lp",
  "investor-gp",
  "other",
]

export function normalizeTag(tag: string) {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
}

export function requestTag(request: AdminRequest) {
  const primary = normalizeTag(request.role)
  if (primary && primary !== "unknown")
    return primary

  return "other"
}

export function tagLabel(tag: string) {
  return normalizeTag(tag)
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function collectAvailableTags(requests: AdminRequest[]) {
  const tags = new Set<string>(DEFAULT_REVIEW_TAGS)
  for (const request of requests) {
    const tag = requestTag(request)
    if (tag)
      tags.add(tag)
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
}

function storageKey(email: string) {
  return `${STORAGE_PREFIX}:${email.toLowerCase()}`
}

export function getReviewerSelectedTags(email: string) {
  if (!email)
    return []

  const raw = localStorage.getItem(storageKey(email))
  if (!raw)
    return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed))
      return []

    return parsed
      .map(item => normalizeTag(String(item)))
      .filter(Boolean)
  }
  catch {
    return []
  }
}

export function saveReviewerSelectedTags(email: string, tags: string[]) {
  if (!email)
    return

  const normalized = Array.from(new Set(tags.map(tag => normalizeTag(tag)).filter(Boolean)))
  localStorage.setItem(storageKey(email), JSON.stringify(normalized))
}

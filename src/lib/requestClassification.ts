// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

const ROLE_PATTERNS: Array<{ role: string, patterns: RegExp[] }> = [
  {
    role: "government",
    patterns: [
      /\bgovernment\b/i,
      /\bgov\b/i,
      /\bgovt\b/i,
      /\bministry\b/i,
      /\bpublic sector\b/i,
      /\bstate\b/i,
    ],
  },
  {
    role: "portfolio-startup",
    patterns: [
      /\bportfolio[-\s]startup\b/i,
      /\bportfolio company\b/i,
    ],
  },
  {
    role: "startup",
    patterns: [
      /\bstartup\b/i,
    ],
  },
  {
    role: "investor-lp",
    patterns: [
      /\binvestor[-\s]lp\b/i,
      /\blimited partner\b/i,
      /\blp\b/i,
    ],
  },
  {
    role: "investor-gp",
    patterns: [
      /\binvestor[-\s]gp\b/i,
      /\bgeneral partner\b/i,
      /\bgp\b/i,
    ],
  },
  {
    role: "media",
    patterns: [
      /\bmedia\b/i,
      /\bpress\b/i,
      /\bjournalis[tm]\b/i,
      /\bnews(room)?\b/i,
      /\bpublication\b/i,
    ],
  },
  {
    role: "freelancer",
    patterns: [
      /\bfreelancer\b/i,
      /\bcontractor\b/i,
      /\bindependent\b/i,
    ],
  },
]

const PRIORITY_BY_ROLE: Record<string, number> = {
  government: 1,
  "portfolio-startup": 2,
  startup: 3,
  "investor-lp": 4,
  "investor-gp": 5,
  media: 6,
  freelancer: 7,
  other: 10,
}

export function normalizeRoleValue(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
}

export function inferRequestRole(...values: Array<string | undefined>) {
  const directMatches = values
    .map(value => normalizeRoleValue(String(value || "")))
    .filter(Boolean)

  for (const value of directMatches) {
    if (value in PRIORITY_BY_ROLE)
      return value
  }

  const haystack = values
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .join(" ")

  for (const candidate of ROLE_PATTERNS) {
    if (candidate.patterns.some(pattern => pattern.test(haystack)))
      return candidate.role
  }

  return "other"
}

export function derivePriorityScore(...values: Array<string | undefined>) {
  const role = inferRequestRole(...values)
  return PRIORITY_BY_ROLE[role] ?? 10
}

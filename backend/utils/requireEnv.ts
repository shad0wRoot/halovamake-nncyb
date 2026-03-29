// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

export default function (key: string): string {
   if (!process.env[key]) {
      console.error(
         `Env variable '${key}' was not found and is required, exitting...`
      );
      process.exit(1);
   }
   return process.env[key]!;
}

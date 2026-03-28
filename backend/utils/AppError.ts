// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

export class AppError extends Error {
   constructor(
      public message: string,
      public statusCode: number = 500,
      public code?: string
   ) {
      super(message);
      this.name = "AppError";
   }
}

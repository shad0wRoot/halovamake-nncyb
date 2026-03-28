// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { IUser } from "../models/User";

declare global {
   namespace Express {
      // This makes req.user typed as IUser everywhere in your app
      interface User extends IUser {}
   }
}

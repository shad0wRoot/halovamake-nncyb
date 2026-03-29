// SPDX-FileCopyrightText: 2026 Martin Kralovic
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeas Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthUserPayload {
  id: string;
  email: string;
  roles?: string[];
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUserPayload;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Missing or invalid authorization header.",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("JWT_SECRET is not configured.");

    const decoded = jwt.verify(token, secret) as AuthUserPayload;
    req.authUser = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles ?? [],
    };

    return next();
  }
  catch {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token.",
    });
  }
}

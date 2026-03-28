// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import express from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import passport from "passport";
import { validate } from "../middleware/validate";
import User, { IUser } from "../models/User";
import { loginSchema, registerSchema } from "../valdators/authValidators";

const router = express.Router();

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* router.post(
   "/login",
   validate(loginSchema),
   passport.authenticate("local", { session: false }),
   (req, res) => {
      res.json({
         testing: true,
         email: req.body.email,
      });
   }
); */

router.post("/login", validate(loginSchema), (req, res, next) => {
   passport.authenticate(
      "local",
      { session: false }, // no failWithError — handle everything manually
      (err: Error, user: IUser, info: { message: string }) => {
         if (err) return next(err); // unexpected error → your errorHandler

         if (!user) {
            return res.status(401).json({
               status: "error",
               message: info?.message ?? "Invalid credentials", // passport's message
            });
         }

         const JWT_SECRET = process.env.JWT_SECRET!;
         const JWT_EXPIRES_IN = "7d" as SignOptions["expiresIn"];
         const token = jwt.sign(
            { id: user._id, email: user.email, roles: user.roles },
            JWT_SECRET || "", // to satisfy ts
            { expiresIn: JWT_EXPIRES_IN }
         );

         return res.json({
            status: "ok",
            toast: { type: "success", message: "Logged in!" },
            token,
            user: {
               id: user._id,
               email: user.email,
               fullName: user.fullName,
               roles: user.roles,
            },
         });
      }
   )(req, res, next);
});

router.post("/register", validate(registerSchema), async (req, res) => {
   const newUser = new User({
      email: req.body.email,
      fullName: req.body.fullName,
   });
   await newUser.setPassword(req.body.password);
   await newUser.save();
   res.json({
      status: "success",
      toast: {
         type: "success",
         msg: "Account created successfully, you can login now.",
      },
      redirect: "/login",
   });
});

export default router;

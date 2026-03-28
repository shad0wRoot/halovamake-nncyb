// middleware/errorHandler.ts
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

export function errorHandler(
   err: Error,
   req: Request,
   res: Response,
   next: NextFunction
) {
   // Known operational error
   if (err instanceof AppError) {
      return res.status(err.statusCode).json({
         status: "error",
         code: err.code,
         message: err.message,
      });
   }

   // Mongoose validation error (e.g. required field missing)
   if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
         status: "error",
         message: "Validation failed",
         fields: Object.fromEntries(
            Object.entries(err.errors).map(([field, e]) => [field, e.message])
         ),
      });
   }

   // Mongoose cast error (e.g. invalid ObjectId in URL)
   if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
         status: "error",
         message: `Invalid value for field '${err.path}'`,
      });
   }

   // Mongoose duplicate key (e.g. unique email already exists)
   if ((err as any).code === 11000) {
      const field = Object.keys((err as any).keyValue)[0];
      return res.status(409).json({
         status: "error",
         message: `'${field}' is already taken`,
      });
   }

   // Express body-parser errors (malformed JSON in request body)
   if ((err as any).type === "entity.parse.failed") {
      return res.status(400).json({
         status: "error",
         message: "Malformed JSON in request body",
      });
   }

   // Passport authentication errors
   if (err.name === "AuthenticationError") {
      return res.status(401).json({
         status: "error",
         message: err.message,
      });
   }

   // Fallback
   return res.status(500).json({
      status: "error",
      message:
         process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message,
   });
}

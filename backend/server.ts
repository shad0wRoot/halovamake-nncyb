// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { configDotenv } from "dotenv";
import cors from "cors";
import express from "express";
import expressWinston from "express-winston";
import mongoose from "mongoose";
import winston from "winston";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/authRoutes";
import requestRouter from "./routes/requestRoutes";
import logger from "./utils/logger";
import requireEnv from "./utils/requireEnv";

configDotenv();
const app = express();
app.set("etag", false); 
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");   
  next();
});
const MONGODB_URL: string = requireEnv("MONGODB_URL");
requireEnv("JWT_SECRET");

mongoose.connection
   .on("error", (err) => {
      logger.error(err);
   })
   .on("open", (err) => {
      logger.info("MongoDB connected", err);
   });

mongoose.connect(MONGODB_URL);

// Enable CORS for all origins
app.use(cors({
   origin: "*",
   credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(
   expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
         winston.format.colorize(),
         winston.format.simple()
      ),
      meta: false,
      //msg: "HTTP {{req.method}} {{ res.statusCode }} {{res.responseTime}}ms {{req.url}}",
      expressFormat: true, //overrides msg property
      colorize: true,
      //ignoreRoute: function (req, res) {
      //   return false;
      //}, // optional: allows to skip some log messages based on request and/or response
   })
);
app.use(
   expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
         winston.format.colorize(),
         winston.format.simple()
      ),
   })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/requests", requestRouter);

app.get("/", function (req, res) {
   res.send("hello, world!" + process.env.TESTVAR);
});

app.use((req, res) => {
   res.status(404).json({ status: "error", message: "Route not found" });
});
app.use(errorHandler);

app.listen(8081);

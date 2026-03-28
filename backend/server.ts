// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import { configDotenv } from "dotenv";
import express from "express";
import expressWinston from "express-winston";
import mongoose from "mongoose";
import winston from "winston";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/authRoutes";
import logger from "./utils/logger";
import requireEnv from "./utils/requireEnv";

configDotenv();
const app = express();
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

app.get("/", function (req, res) {
   res.send("hello, world!" + process.env.TESTVAR);
});

app.use((req, res) => {
   res.status(404).json({ status: "error", message: "Route not found" });
});
app.use(errorHandler);

app.listen(8081);

// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema, model } = mongoose;

export interface IUser extends mongoose.PassportLocalDocument {
   email: string;
   fullName: string;
   roles: string[];
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
}

const userSchema = new Schema<IUser>(
   {
      email: { type: String, required: true, unique: true },
      fullName: { type: String, required: true },
      roles: { type: [String], required: true, default: [] },
      active: { type: Boolean, required: true, default: true },
   },
   { timestamps: true }
);

type ExtendedPassportLocalOptions = Omit<
   mongoose.PassportLocalOptions,
   "usernameQueryFields"
> & {
   usernameQueryFields?: string[];
   findByUsername?: (
      model: mongoose.PassportLocalModel<IUser>,
      queryParameters: Record<string, unknown>
   ) => mongoose.Query<IUser | null, IUser>;
};

const pluginOptions: ExtendedPassportLocalOptions = {
   usernameField: "email",
   usernameUnique: true,
   findByUsername: function (
      model: mongoose.PassportLocalModel<IUser>,
      queryParameters: Record<string, unknown>
   ) {
      queryParameters.active = true;
      return model.findOne(queryParameters);
   },
};

userSchema.plugin(passportLocalMongoose, pluginOptions);

export default model<IUser, mongoose.PassportLocalModel<IUser>>(
   "User",
   userSchema
);

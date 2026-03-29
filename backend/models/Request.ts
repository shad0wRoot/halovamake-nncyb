// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import mongoose from "mongoose";

const { Schema, model } = mongoose;

export interface IRequest extends mongoose.Document {

    email: string;
    ownerEmail: string;
    fullName: string;
    phoneNumber: string;
    company: string;
    companyType: string;
    companyAddress: string;


    priority: number;

    title: string;
    description: string;
    linkedIn: string;
    website: string;


    createdAt: Date;
    updatedAt: Date;

    reviewer: string;
    decisionReason: string;
    activeReviewerName: string;
    activeReviewerEmail: string;
    status: string;
    
}


const requestSchema = new Schema<IRequest>(
   {
    title: {type: String, required: true}, 
    description: {type: String, required: true}, 
    email: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: false},
    company: { type: String, required: false},
    companyType: { type: String, required: false},
    companyAddress: { type: String, required: false},
    priority: {type: Number, required: true, default: 3},
    linkedIn: {type: String, required: false}, 
    website: {type: String, required: false},
    
    reviewer: {type: String, required: false, default: ""},
    decisionReason: {type: String, required: false, default: ""},
    activeReviewerName: {type: String, required: false, default: ""},
    activeReviewerEmail: {type: String, required: false, default: ""},
    status: {type: String, required: true, default: "PENDING"},

   },
   { timestamps: true }
);

export default model<IRequest>("Request", requestSchema);

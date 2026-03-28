import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import { required } from "zod/v4/core/util.cjs";

const { Schema, model } = mongoose;

export interface IRequest extends mongoose.PassportLocalDocument {

    email: string;
    fullName: string;
    phoneNumber: number;
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
    status: string;
    
}


const requestSchema = new Schema<IRequest>(
   {
    title: {type: String, required: true}, 
    description: {type: String, required: true}, 
    email: { type: String, required: true, unique: true },  
    fullName: { type: String, required: true },
    phoneNumber: { type: Number, required: true},
    company: { type: String, required: false},
    companyType: { type: String, required: false},
    companyAddress: { type: String, required: false},
    priority: {type: String, required: true}, 
    linkedIn: {type: String, required: false}, 
    website: {type: String, required: false},
    
    reviewer: {type: String, required: false},
    status: {type: String, required: true, default: "PENDING"},

   },
   { timestamps: true }
);
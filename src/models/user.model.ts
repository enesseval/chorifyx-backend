import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "../types/user.types";

interface IUserDocument extends IUser, Document {
   _id: Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>({
   name: {
      type: String,
      required: true,
   },
   surname: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: function (this: IUserDocument) {
         return this.authProvider === "local";
      },
   },
   profileImage: {
      type: String,
      default: null,
   },
   authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
      default: Date.now,
   },
   status: {
      type: Boolean,
      default: function (this: IUserDocument) {
         return this.authProvider === "google";
      },
   },
   verificationCode: {
      type: String,
   },
   verificationExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
   },
   verifyCodeLimit: {
      type: Number,
      default: 3,
   },
   refreshToken: {
      type: String,
      default: null,
   },
});

export default model<IUserDocument>("User", userSchema, "users");

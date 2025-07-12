import { model, Schema, Types } from "mongoose";

export const genderTypes = { male: "male", female: "female" };
export const providerTypes = { google: "google", system: "system" };
export const roleTypes = { user: "user", admin: "admin", superAdmin: "superAdmin" };

const userModel = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    email: { type: String, required: true, unique: true },
    confirmEmailOTP: String,
    resetPasswordOTP: String,
    password: {
      type: String,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    DOB: { type: Date },
    phone: String,
    address: String,
    image: { secure_url: String, public_id: String },
    coverImages: [{ secure_url: String, public_id: String }],
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: roleTypes.male,
    },
    confirmEmail: { type: Boolean, default: false },
    isDeleted: { type: Date },
    changeCredentialTimes: Date,
    codeExpiry: { type: Date },
    failedAttempts: { type: Number, default: 0 },
    bannedUntil: { type: Date },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    viewers: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        time: Date,
      },
    ],
    twoStepVerification: { type: Boolean, default: false },
    twoStepVerificationOTP: String,
    twoStepVerificationOTPExpiry: Date,
    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    updatedBy:{
      type:Types.ObjectId,
      ref:'User'
    }
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userModel);
export default User;


export const socketConnection = new Map()
 

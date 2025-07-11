import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        verificationCode: { type: String },
        verificationCodeExpires: { type: Date },
        resetPasswordCode: { type: String },
        resetPasswordCodeExpires: { type: Date },
    },
    { timestamps: true }
);

export const User =
    (mongoose.models.User as mongoose.Model<any>) ||
    mongoose.model("User", userSchema);

import express from "express";
import {
    register,
    login,
    resendVerification,
    verifyEmail,
    sendResetPasswordCode,
    resetPassword,
} from "@/controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/resend-verification", resendVerification);
router.post("/verify-email", verifyEmail);
router.post("/send-reset-password-code", sendResetPasswordCode);
router.post("/reset-password", resetPassword);

export default router;

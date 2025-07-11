import { Request, Response } from "express";
import { ApiResponse } from "@/utils/response";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectDB from "@/config/mongodb";
import { User } from "@/models/User";
import { config } from "@/config/env";
import { AuthService } from "@/services/auth.service";

export async function register(req: Request, res: Response): Promise<void> {
    try {
        await connectDB();

        const { email, password } = req.body;

        if (!email || !password) {
            ApiResponse.validationError("Email and password are required").send(
                res
            );
            return;
        }

        if (password.length < 6) {
            ApiResponse.validationError(
                "Password must be at least 6 characters"
            ).send(res);
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ApiResponse.validationError("Invalid email format").send(res);
            return;
        }

        await AuthService.registerUser(email.toLowerCase(), password);

        ApiResponse.success(
            null,
            "Verification code sent to your email",
            201
        ).send(res);
    } catch (error: any) {
        console.error("Register error:", error);

        if (error.message === "EMAIL_ALREADY_REGISTERED") {
            ApiResponse.validationError("Email already registered").send(res);
        } else if (error.message === "Failed to send verification email") {
            ApiResponse.error("Failed to send verification email").send(res);
        } else {
            ApiResponse.error("Registration failed").send(res);
        }
    }
}

export async function resendVerification(
    req: Request,
    res: Response
): Promise<void> {
    try {
        await connectDB();

        const { email } = req.body;

        if (!email) {
            ApiResponse.validationError("Email is required").send(res);
            return;
        }

        await AuthService.resendVerificationCode(email.toLowerCase());

        ApiResponse.success(null, "Verification code sent to your email").send(
            res
        );
    } catch (error: any) {
        console.error("Resend verification error:", error);

        if (error.message === "USER_NOT_FOUND") {
            ApiResponse.notFound("User not found").send(res);
        } else if (error.message === "USER_ALREADY_VERIFIED") {
            ApiResponse.validationError("User already verified").send(res);
        } else if (error.message === "Failed to send verification email") {
            ApiResponse.error("Failed to send verification email").send(res);
        } else {
            ApiResponse.error("Failed to resend verification code").send(res);
        }
    }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
    try {
        await connectDB();

        const { email, code } = req.body;

        if (!email || !code) {
            ApiResponse.validationError(
                "Email and verification code are required"
            ).send(res);
            return;
        }

        await AuthService.verifyEmail(email.toLowerCase(), code);

        ApiResponse.success(null, "Email verified successfully").send(res);
    } catch (error: any) {
        console.error("Verify email error:", error);

        if (error.message === "USER_NOT_FOUND") {
            ApiResponse.notFound("User not found").send(res);
        } else if (error.message === "USER_ALREADY_VERIFIED") {
            ApiResponse.validationError("User already verified").send(res);
        } else if (error.message === "INVALID_VERIFICATION_CODE") {
            ApiResponse.validationError("Invalid verification code").send(res);
        } else if (error.message === "VERIFICATION_CODE_EXPIRED") {
            ApiResponse.validationError("Verification code expired").send(res);
        } else {
            ApiResponse.error("Email verification failed").send(res);
        }
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        await connectDB();

        const { email, password } = req.body;

        if (!email || !password) {
            ApiResponse.validationError("Email and password are required").send(
                res
            );
            return;
        }

        if (!config.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            ApiResponse.error("Server configuration error").send(res);
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            ApiResponse.forbidden("Invalid credentials").send(res);
            return;
        }

        if (!user.isVerified) {
            ApiResponse.forbidden("Email not verified").send(res);
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            ApiResponse.forbidden("Invalid credentials").send(res);
            return;
        }

        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
            expiresIn: "1d",
        });

        const data = {
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        };

        ApiResponse.success(data, "Login successful").send(res);
    } catch (error) {
        console.error("Login error:", error);
        ApiResponse.error("Login failed").send(res);
    }
}

export async function sendResetPasswordCode(
    req: Request,
    res: Response
): Promise<void> {
    try {
        await connectDB();

        const { email } = req.body;
        if (!email) {
            ApiResponse.validationError("Email is required").send(res);
            return;
        }

        await AuthService.sendResetPasswordCode(email.toLowerCase());

        ApiResponse.success(null, "Reset code sent to your email").send(res);
    } catch (error: any) {
        console.error("Send reset code error:", error);

        if (error.message === "USER_NOT_FOUND") {
            ApiResponse.notFound("User not found").send(res);
        } else if (error.message === "FAILED_TO_SEND_RESET_EMAIL") {
            ApiResponse.error("Failed to send reset email").send(res);
        } else {
            ApiResponse.error("Failed to send reset password code").send(res);
        }
    }
}

export async function resetPassword(
    req: Request,
    res: Response
): Promise<void> {
    try {
        await connectDB();

        const { email, code, password } = req.body;
        if (!email || !code || !password) {
            ApiResponse.validationError(
                "Email, code, and password are required"
            ).send(res);
            return;
        }

        if (password.length < 6) {
            ApiResponse.validationError(
                "Password must be at least 6 characters"
            ).send(res);
            return;
        }

        await AuthService.resetPassword(email.toLowerCase(), code, password);

        ApiResponse.success(null, "Password updated successfully").send(res);
    } catch (error: any) {
        console.error("Reset password error:", error);

        if (error.message === "USER_NOT_FOUND") {
            ApiResponse.notFound("User not found").send(res);
        } else if (error.message === "INVALID_OR_EXPIRED_CODE") {
            ApiResponse.validationError("Invalid or expired reset code").send(
                res
            );
        } else {
            ApiResponse.error("Failed to reset password").send(res);
        }
    }
}

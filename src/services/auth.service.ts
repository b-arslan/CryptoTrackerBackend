import bcrypt from "bcrypt";
import { User } from "@/models/User";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/utils/mailer";

enum AuthError {
    EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED",
    INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE",
    VERIFICATION_CODE_EXPIRED = "VERIFICATION_CODE_EXPIRED",
    FAILED_TO_SEND_VERIFICATION_EMAIL = "FAILED_TO_SEND_VERIFICATION_EMAIL",
    FAILED_TO_SEND_RESET_EMAIL = "FAILED_TO_SEND_RESET_EMAIL",
    INVALID_OR_EXPIRED_CODE = "INVALID_OR_EXPIRED_CODE",
}

interface CodeData {
    code: string;
    expires: Date;
}

export class AuthService {
    private static readonly CODE_LENGTH = 4;
    private static readonly VERIFICATION_EXPIRE_MIN = 3;
    private static readonly RESET_EXPIRE_MIN = 10;
    private static readonly BCRYPT_ROUNDS = 10;

    private static generateCode(
        length: number,
        minutesValid: number
    ): CodeData {
        const code = Math.floor(
            Math.pow(10, length - 1) +
                Math.random() * (9 * Math.pow(10, length - 1))
        ).toString();
        const expires = new Date(Date.now() + minutesValid * 60 * 1000);
        return { code, expires };
    }

    private static async sendCodeEmail(
        email: string,
        code: string,
        type: "verification" | "reset"
    ): Promise<void> {
        try {
            if (type === "verification") {
                await sendVerificationEmail(email, code);
            } else {
                await sendResetPasswordEmail(email, code);
            }
        } catch (error) {
            const errMsg =
                type === "verification"
                    ? AuthError.FAILED_TO_SEND_VERIFICATION_EMAIL
                    : AuthError.FAILED_TO_SEND_RESET_EMAIL;
            console.error("Email sending failed:", error);
            throw new Error(errMsg);
        }
    }

    static async registerUser(email: string, password: string): Promise<void> {
        if (await User.findOne({ email })) {
            throw new Error(AuthError.EMAIL_ALREADY_REGISTERED);
        }

        const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
        const { code, expires } = this.generateCode(
            this.CODE_LENGTH,
            this.VERIFICATION_EXPIRE_MIN
        );

        await this.sendCodeEmail(email, code, "verification");

        await User.create({
            email,
            passwordHash,
            verificationCode: code,
            verificationCodeExpires: expires,
            isVerified: false,
        });
    }

    static async resendVerificationCode(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) throw new Error(AuthError.USER_NOT_FOUND);
        if (user.isVerified) throw new Error(AuthError.USER_ALREADY_VERIFIED);

        const { code, expires } = this.generateCode(
            this.CODE_LENGTH,
            this.VERIFICATION_EXPIRE_MIN
        );
        await this.sendCodeEmail(email, code, "verification");

        user.verificationCode = code;
        user.verificationCodeExpires = expires;
        await user.save();
    }

    static async verifyEmail(email: string, code: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) throw new Error(AuthError.USER_NOT_FOUND);
        if (user.isVerified) throw new Error(AuthError.USER_ALREADY_VERIFIED);
        if (user.verificationCode !== code)
            throw new Error(AuthError.INVALID_VERIFICATION_CODE);
        if (
            !user.verificationCodeExpires ||
            user.verificationCodeExpires < new Date()
        ) {
            throw new Error(AuthError.VERIFICATION_CODE_EXPIRED);
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();
    }

    static async sendResetPasswordCode(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) throw new Error(AuthError.USER_NOT_FOUND);

        const { code, expires } = this.generateCode(
            this.CODE_LENGTH,
            this.RESET_EXPIRE_MIN
        );

        user.resetPasswordCode = code;
        user.resetPasswordCodeExpires = expires;
        await user.save();

        await this.sendCodeEmail(email, code, "reset");
    }

    static async resetPassword(
        email: string,
        code: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) throw new Error(AuthError.USER_NOT_FOUND);

        if (
            user.resetPasswordCode !== code ||
            !user.resetPasswordCodeExpires ||
            user.resetPasswordCodeExpires < new Date()
        ) {
            throw new Error(AuthError.INVALID_OR_EXPIRED_CODE);
        }

        user.passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);
        user.isVerified = true;
        user.resetPasswordCode = undefined;
        user.resetPasswordCodeExpires = undefined;
        await user.save();
    }
}

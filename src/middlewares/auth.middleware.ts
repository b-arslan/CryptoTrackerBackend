import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "@/utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}

export function verifyAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized("Unauthorized").send(res);
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.user = { userId: payload.userId };
        next();
    } catch (e) {
        return ApiResponse.forbidden("Invalid token").send(res);
    }
}

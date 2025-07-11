import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function verifyAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (e) {
        ApiResponse.forbidden("Invalid token").send(res);
        return;
    }
}

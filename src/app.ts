import "@/config/env";
import "module-alias/register";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import assetRoutes from "@/routes/asset.routes";
import analysisRoutes from "@/routes/analysis.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/analysis", analysisRoutes);

export default app;

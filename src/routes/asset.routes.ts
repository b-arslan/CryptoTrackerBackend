import express from "express";
import {
    getAssets,
    createAsset,
    getAssetSummary,
    updateAsset,
    deleteAsset,
} from "@/controllers/asset.controller";
import { verifyAuth } from "@/middlewares/auth.middleware";

const router = express.Router();

router.get("/", verifyAuth, getAssets);
router.post("/", verifyAuth, createAsset);
router.get("/summary", verifyAuth, getAssetSummary);
router.patch("/:id", verifyAuth, updateAsset);
router.delete("/:id", verifyAuth, deleteAsset);

export default router;

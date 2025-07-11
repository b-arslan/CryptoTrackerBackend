import { Request, Response } from "express";
import { AssetService } from "@/services/asset.service";
import { ApiResponse } from "@/utils/response";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

export async function getAssets(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.userId;
        const assets = await AssetService.getAssetsByUser(userId);
        ApiResponse.success(assets).send(res);
    } catch (e) {
        ApiResponse.error("Failed to fetch assets").send(res);
    }
}

export async function createAsset(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.userId;
        const asset = await AssetService.createAsset(userId, req.body);
        ApiResponse.success(asset, "Asset added", 201).send(res);
    } catch (e) {
        ApiResponse.error("Failed to add asset").send(res);
    }
}

export async function getAssetSummary(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const userId = req.user!.userId;
        const summary = await AssetService.getAssetSummary(userId);
        ApiResponse.success(summary).send(res);
    } catch (e) {
        ApiResponse.error("Failed to fetch asset summary").send(res);
    }
}

export async function updateAsset(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.userId;
        const assetId = req.params.id;
        const updates = req.body;

        const asset = await AssetService.updateAsset(userId, assetId, updates);
        if (!asset) return ApiResponse.notFound("Asset not found").send(res);

        ApiResponse.success(asset, "Asset updated").send(res);
    } catch (e) {
        ApiResponse.error("Failed to update asset").send(res);
    }
}

export async function deleteAsset(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.userId;
        const assetId = req.params.id;

        const asset = await AssetService.deleteAsset(userId, assetId);
        if (!asset) return ApiResponse.notFound("Asset not found").send(res);

        ApiResponse.success(null, "Asset deleted").send(res);
    } catch (e) {
        ApiResponse.error("Failed to delete asset").send(res);
    }
}

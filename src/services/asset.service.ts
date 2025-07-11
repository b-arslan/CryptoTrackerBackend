import { Asset } from "@/models/Asset";

export class AssetService {
    static async getAssetsByUser(userId: string) {
        return await Asset.find({ userId });
    }

    static async createAsset(userId: string, assetData: any) {
        return await Asset.create({
            ...assetData,
            userId,
            lastUpdated: new Date(),
        });
    }

    static async getAssetSummary(userId: string) {
        const assets = await Asset.find({ userId });
        const totalValue = assets.reduce((acc, asset) => acc + asset.value, 0);
        return assets.map((asset) => ({
            name: asset.name,
            value:
                totalValue === 0
                    ? 0
                    : parseFloat(((asset.value / totalValue) * 100).toFixed(2)),
        }));
    }

    static async updateAsset(userId: string, assetId: string, updates: any) {
        const asset = await Asset.findOne({ _id: assetId, userId });
        if (!asset) return null;

        Object.assign(asset, updates);

        if (updates.amount !== undefined) {
            const price =
                updates.currentPrice !== undefined
                    ? updates.currentPrice
                    : asset.currentPrice;
            asset.value = price * updates.amount;
        }

        asset.lastUpdated = new Date();
        await asset.save();
        return asset;
    }

    static async deleteAsset(userId: string, assetId: string) {
        return await Asset.findOneAndDelete({ _id: assetId, userId });
    }
}

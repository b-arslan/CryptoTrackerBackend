import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        symbol: { type: String, required: true },
        amount: { type: Number, required: true },
        currentPrice: { type: Number, required: true },
        priceChangePercent: { type: Number, required: true },
        value: { type: Number, required: true },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Asset =
    (mongoose.models.Asset as mongoose.Model<any>) ||
    mongoose.model("Asset", assetSchema);

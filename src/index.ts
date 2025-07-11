import mongoose from "mongoose";
import app from "./app";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 9001;
const MONGO_URI = process.env.MONGO_URI || "";

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

start();

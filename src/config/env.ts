// Environment variables file integrated for VPS deployment
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
    console.error(`.env file not found at: ${envPath}`);
    process.exit(1);
}

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
    process.exit(1);
}

console.log(`.env loaded from: ${envPath}`);
console.log(
    `Loaded ${Object.keys(result.parsed || {}).length} environment variables`
);

export const config = {
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 9001,
    MJ_API_KEY: process.env.MJ_API_KEY,
    MJ_SECRET_KEY: process.env.MJ_SECRET_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

const requiredEnvVars = ["JWT_SECRET"];

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});

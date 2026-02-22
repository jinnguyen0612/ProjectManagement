import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    ACCESS_SECRET: process.env.ACCESS_SECRET || "ACCESS_SECRET",
    REFRESH_SECRET: process.env.REFRESH_SECRET || "REFRESH_SECRET",
    ACCESS_TIMEOUT: (process.env.ACCESS_TIMEOUT || "15m") as StringValue,
    REFRESH_TIMEOUT: (process.env.REFRESH_TIMEOUT || "7d") as StringValue,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 10,
};

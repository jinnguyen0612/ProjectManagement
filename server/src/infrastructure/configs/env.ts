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
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAIL_MAILER: process.env.MAIL_MAILER || "smtp",
    MAIL_HOST: process.env.MAIL_HOST || "smtp.gmail.com",
    MAIL_PORT: Number(process.env.MAIL_PORT) || 587,
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION || null,
    MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || "Project Management",
};

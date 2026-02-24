import bcrypt from "bcrypt";
import { env } from "../configs/env";

const SALT_ROUNDS = Number(env.BCRYPT_SALT_ROUNDS) || 12;

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const hashToken = async (token: string) => {
    return await bcrypt.hash(token, SALT_ROUNDS);
};

export const compareToken = async (token: string, hashedToken: string) => {
    return await bcrypt.compare(token, hashedToken);
};
import { Permissions } from "./permissions.type";

export interface AccessTokenPayload {
    userId: number;
    role: string;
    permissions: Permissions;
}

export interface RefreshTokenPayload {
    userId: number;
}
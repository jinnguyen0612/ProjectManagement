import { Permissions } from "./permissions";

export interface AccessTokenPayload {
    userId: number;
    role: string;
    permissions: Permissions;
}

export interface RefreshTokenPayload {
    userId: number;
}
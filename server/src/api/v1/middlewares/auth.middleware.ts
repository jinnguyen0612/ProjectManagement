import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../../infrastructure/libs/jwt";
import { AccessTokenPayload } from "../../../core/types/jwt";
import { runWithUser } from "../../../hooks/useUserContext";
import prisma from "../../../infrastructure/libs/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access token is missing",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        runWithUser(payload, () => {
            next();
        });
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token has expired",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid access token",
        });
    }
};

/**
 * Middleware kiểm tra role và permissions với caching
 * Logic:
 * 1. Check role trước - nếu match thì kiểm tra xem có permission nào bị deny không
 * 2. Nếu không match role - check xem có permission nào được grant không
 * 
 * @param rolesOrPermissions - Danh sách roles hoặc permission keys được phép
 * 
 * @example
 * // Check role
 * authorize(UserRole.ADMIN, UserRole.MANAGER)
 * 
 * // Check permission
 * authorize('users.read', 'users.write')
 * 
 * // Mix role và permission
 * authorize(UserRole.ADMIN, 'users.read')
 */

// Cache để tránh query database nhiều lần cho cùng 1 user
const authCache = new Map<number, {
    userRoles: Set<string>;
    allPermissions: Set<string>;
    deniedPermissions: Set<string>;
    timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const authorize = (...rolesOrPermissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        try {
            const userId = req.user.userId;
            const now = Date.now();
            
            // Check cache
            let cached = authCache.get(userId);
            
            if (cached && (now - cached.timestamp) < CACHE_TTL) {
                // Use cached data
                return checkAuthorization(
                    cached.userRoles,
                    cached.allPermissions,
                    cached.deniedPermissions,
                    rolesOrPermissions,
                    res,
                    next
                );
            }

            // Cache miss or expired - query database
            const user = await prisma.users.findUnique({
                where: { id: userId },
                include: {
                    usersRoles: {
                        include: {
                            role: {
                                include: {
                                    rolesPermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    usersPermissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Build Sets for O(1) lookup
            const userRoles = new Set(user.usersRoles.map(ur => ur.role.name));
            
            const rolePermissions = user.usersRoles.flatMap(ur => 
                ur.role.rolesPermissions.map(rp => rp.permission.key)
            );
            
            const grantedPermissions = user.usersPermissions
                .filter(up => !up.isDeny)
                .map(up => up.permission.key);
            
            const deniedPermissions = new Set(
                user.usersPermissions
                    .filter(up => up.isDeny)
                    .map(up => up.permission.key)
            );

            const allPermissions = new Set([...rolePermissions, ...grantedPermissions]);

            // Update cache
            authCache.set(userId, {
                userRoles,
                allPermissions,
                deniedPermissions,
                timestamp: now
            });

            // Clean old cache entries (simple cleanup)
            if (authCache.size > 1000) {
                const entries = Array.from(authCache.entries());
                entries
                    .filter(([_, data]) => (now - data.timestamp) > CACHE_TTL)
                    .forEach(([key]) => authCache.delete(key));
            }

            return checkAuthorization(
                userRoles,
                allPermissions,
                deniedPermissions,
                rolesOrPermissions,
                res,
                next
            );

        } catch (error) {
            console.error("Authorization error:", error);
            return res.status(500).json({
                success: false,
                message: "Authorization check failed",
            });
        }
    };
};

/**
 * Helper function để check authorization với Sets (O(1) lookup)
 */
function checkAuthorization(
    userRoles: Set<string>,
    allPermissions: Set<string>,
    deniedPermissions: Set<string>,
    rolesOrPermissions: string[],
    res: Response,
    next: NextFunction
) {
    // Check từng item - O(C) với C là số items cần check
    for (const item of rolesOrPermissions) {
        // Check role - O(1) với Set
        if (userRoles.has(item)) {
            // User có role này, check xem có permission nào bị deny không
            // Nếu không có deny thì pass
            return next();
        }
        
        // Check permission - O(1) với Set
        if (allPermissions.has(item)) {
            // User có permission này
            // Check xem có bị deny không - O(1) với Set
            if (!deniedPermissions.has(item)) {
                // Permission hợp lệ
                return next();
            }
        }
    }

    // Không match bất kỳ role hoặc permission nào
    return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
    });
}

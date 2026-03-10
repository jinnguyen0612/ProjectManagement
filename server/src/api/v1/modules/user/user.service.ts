import { currentUserWith } from './../../../../hooks/useAuth';
import prisma from "../../../../infrastructure/libs/prisma";
import { buildWhereCondition } from "../../../../shared/pagination";
import { UserRole } from '../../../../core/enums/Role';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../../core/errors/AppError';
import { hashPassword } from '../../../../infrastructure/libs/bcrypt';
import { UserStatus } from '../../../../core/types/User/user-status';
import { generateOTP } from '../../../../core/utils/generate-code';

// Type for user with roles
type UserWithRoles = Prisma.UsersGetPayload<{
    include: {
        usersRoles: {
            include: { role: true }
        }
    }
}>;

export class UserService {
    /**
     * Get list of users with pagination, search, and filters
     */
    static async getUsers(
        skip: number,
        limit: number,
        search?: string,
        searchField?: string,
        filters: Record<string, any> = {},
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const user = await currentUserWith({
            usersRoles: {
                include: { role: true }
            }
        }) as UserWithRoles;

        // Check if user is admin
        const isAdmin = user.usersRoles?.some(ur => ur.role.name === UserRole.ADMIN) ?? false;

        // Select fields based on role
        const selectCondition = isAdmin ? {
            id: true,
            email: true,
            phone: true,
            fullname: true,
            avatar: true,
            bio: true,
            address: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        } : {
            id: true,
            email: true,
            phone: true,
            fullname: true,
            avatar: true,
            status: true,
        };

        // Whitelist searchable fields
        const SEARCHABLE_FIELDS = ['email', 'fullname', 'phone'];

        // Base condition
        let whereCondition: any = {};

        // Add search
        if (search) {
            if (searchField && SEARCHABLE_FIELDS.includes(searchField)) {
                // Search specific field
                whereCondition[searchField] = {
                    contains: search,
                    mode: 'insensitive',
                };
            } else {
                // Search all fields
                whereCondition.OR = SEARCHABLE_FIELDS.map(field => ({
                    [field]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }));
            }
        }

        // Add filters (operators tự động xử lý)
        whereCondition = buildWhereCondition(whereCondition, filters, {
            status: 'exact',
        });

        // Build orderBy
        const orderBy: any = {
            [sortBy]: sortOrder,
        };

        const [users, total] = await Promise.all([
            prisma.users.findMany({
                where: whereCondition,
                select: selectCondition,
                orderBy,
                skip,
                take: limit,
            }),
            prisma.users.count({
                where: whereCondition,
            }),
        ]);

        return { users, total };
    }

    static async getUserDetail(id: bigint) {
        const user = await currentUserWith({
            usersRoles: {
                include: { role: true }
            }
        }) as UserWithRoles;

        // Check if user is admin
        const isAdmin = user.usersRoles?.some(ur => ur.role.name === UserRole.ADMIN) ?? false;

        const selectCondition = isAdmin ? {
            id: true,
            email: true,
            phone: true,
            fullname: true,
            avatar: true,
            bio: true,
            address: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        } : {
            id: true,
            email: true,
            phone: true,
            fullname: true,
            avatar: true,
            status: true,
        };

        return prisma.users.findFirst({
            where: { id },
            select: selectCondition,
        });
    }

    static async createUser(data: any) {
        const existingEmail = await prisma.users.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new AppError("Email already exists", 409);
        }

        // Chỉ check phone nếu có
        if (data.phone) {
            const existingPhone = await prisma.users.findUnique({
                where: { phone: data.phone },
            });

            if (existingPhone) {
                throw new AppError("Phone already exists", 409);
            }
        }

        const { confirmPassword, roleId, ...userData } = data;
        const hashedPassword = await hashPassword(userData.password);

        const roleUser = await prisma.roles.findUnique({
            where: { name: UserRole.USER }
        });

        if (!roleUser) {
            throw new AppError("Default user role not found", 500);
        }

        // Tạo user và gắn role trong transaction
        const user = await prisma.$transaction(async (tx) => {
            // Tạo user
            const newUser = await tx.users.create({
                data: {
                    email: userData.email,
                    phone: userData.phone || null,
                    password: hashedPassword,
                    avatar: userData.avatar,
                    fullname: userData.fullname,
                    bio: userData.bio || null,
                    address: userData.address || null,
                    status: userData.status || UserStatus.INACTIVE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Gắn role cho user mới
            await tx.usersRoles.create({
                data: {
                    userId: newUser.id,
                    roleId: roleId,
                }
            });

            return newUser;
        });

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    static async updateUser(id: bigint, data: any) {
        // Chỉ cho phép update password, roleId
        const { confirmPassword, roleId, password } = data;

        // Xây dựng object update (CHỈ các fields được phép)
        const updateData: any = {
            updatedAt: new Date(),
        };

        // Nếu có password, hash và thêm vào updateData
        if (password) {
            const hashedPassword = await hashPassword(password);
            updateData.password = hashedPassword;
        }

        // Transaction để update user và role
        const user = await prisma.$transaction(async (tx) => {
            // Cập nhật user (Prisma sẽ throw error nếu user không tồn tại)
            const updatedUser = await tx.users.update({
                where: { id },
                data: updateData,
            });

            // Nếu có roleId, cập nhật role và cleanup permissions
            if (roleId) {
                // Parallel queries để tăng tốc
                const [newRole, currentUserPermissions] = await Promise.all([
                    tx.roles.findUnique({
                        where: { id: roleId },
                        include: {
                            rolesPermissions: {
                                select: { permissionId: true }  // Chỉ lấy ID
                            }
                        }
                    }),
                    tx.usersPermissions.findMany({
                        where: { userId: id },
                        select: { permissionId: true, isDeny: true }  // Chỉ lấy fields cần thiết
                    })
                ]);

                if (!newRole) {
                    throw new AppError("Role not found", 404);
                }

                // Lấy danh sách permission IDs của role mới
                const newRolePermissionIds = new Set(
                    newRole.rolesPermissions.map(rp => rp.permissionId)
                );

                // Xác định permissions cần xóa
                const permissionIdsToDelete = currentUserPermissions
                    .filter(up => {
                        if (up.isDeny === false) {
                            // GRANTED: Xóa nếu role mới đã có
                            return newRolePermissionIds.has(up.permissionId);
                        } else {
                            // DENIED: Xóa nếu role mới KHÔNG có
                            return !newRolePermissionIds.has(up.permissionId);
                        }
                    })
                    .map(up => up.permissionId);

                // Batch operations
                await Promise.all([
                    // Xóa permissions thừa (nếu có)
                    permissionIdsToDelete.length > 0
                        ? tx.usersPermissions.deleteMany({
                            where: {
                                userId: id,
                                permissionId: { in: permissionIdsToDelete }
                            }
                        })
                        : Promise.resolve(),
                    
                    // Xóa role cũ
                    tx.usersRoles.deleteMany({ where: { userId: id } })
                ]);

                // Thêm role mới
                await tx.usersRoles.create({
                    data: {
                        userId: id,
                        roleId: roleId,
                    }
                });
            }

            return updatedUser;
        });

        // Loại bỏ password khỏi response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async blockUser(id: bigint) {
        await prisma.users.update({
            where: { id },
            data: {
                status: UserStatus.BLOCKED,
                updatedAt: new Date(),
            },
        });

        await prisma.jwtTokens.updateMany({ 
            where: { userId: id }, data: { revokedAt: new Date() } 
        })
    }

    static async unblockUser(id: bigint) {
        await prisma.users.update({
            where: { id },
            data: {
                status: UserStatus.ACTIVE,
                updatedAt: new Date(),
            },
        });
    }

    static async updateUserPermission(id: bigint, data: any) {
        const { permissions: allowedPermissionIds } = data;

        // Transaction để đảm bảo consistency
        await prisma.$transaction(async (tx) => {
            // 1. Kiểm tra user tồn tại
            const user = await tx.users.findUnique({
                where: { id },
                select: { id: true }
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            // 2. Lấy user permissions hiện tại
            const currentUserPermissions = await tx.usersPermissions.findMany({
                where: { userId: id },
                select: { permissionId: true, isDeny: true }
            });

            // 3. Tạo Set để lookup nhanh O(1)
            const allowedSet = new Set(allowedPermissionIds.map((id: bigint) => id.toString()));
            const currentPermissionsMap = new Map(
                currentUserPermissions.map(up => [up.permissionId.toString(), up.isDeny])
            );

            // 4. Xác định operations cần thực hiện
            const toCreate: { userId: bigint; permissionId: bigint; isDeny: boolean }[] = [];
            const toUpdate: { permissionId: bigint; isDeny: boolean }[] = [];

            // 4a. Xử lý allowed permissions (permissions trong mảng)
            for (const permId of allowedPermissionIds) {
                const permIdStr = permId.toString();
                const currentStatus = currentPermissionsMap.get(permIdStr);

                if (currentStatus === undefined) {
                    // Permission chưa có → Thêm granted
                    toCreate.push({
                        userId: id,
                        permissionId: permId,
                        isDeny: false
                    });
                } else if (currentStatus === true) {
                    // Permission đang bị denied → Chuyển thành granted
                    toUpdate.push({
                        permissionId: permId,
                        isDeny: false
                    });
                }
                // Nếu currentStatus === false → Bỏ qua (đã granted rồi)
            }

            // 4b. Xử lý permissions KHÔNG trong mảng
            for (const [permIdStr, isDeny] of currentPermissionsMap) {
                if (!allowedSet.has(permIdStr)) {
                    // Permission không trong allowed list
                    if (isDeny === false) {
                        // Đang granted → Chuyển thành denied
                        toUpdate.push({
                            permissionId: BigInt(permIdStr),
                            isDeny: true
                        });
                    }
                    // Nếu isDeny === true → Bỏ qua (đã denied rồi)
                }
            }

            // 5. Thực hiện operations
            const operations: Promise<any>[] = [];

            // Create new permissions
            if (toCreate.length > 0) {
                operations.push(
                    tx.usersPermissions.createMany({
                        data: toCreate
                    })
                );
            }

            // Update existing permissions
            for (const update of toUpdate) {
                operations.push(
                    tx.usersPermissions.update({
                        where: {
                            userId_permissionId: {
                                userId: id,
                                permissionId: update.permissionId
                            }
                        },
                        data: {
                            isDeny: update.isDeny
                        }
                    })
                );
            }

            // Execute all operations in parallel
            if (operations.length > 0) {
                await Promise.all(operations);
            }
        });
    }
}
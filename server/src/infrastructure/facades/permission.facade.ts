import prisma from "../libs/prisma";

export class PermissionFacade {
    // ── System Permissions ──────────────────────────────────────────────────

    static findPermissions(where: any, select: any, orderBy: any, skip: number, take: number) {
        return prisma.permissions.findMany({ where, select, orderBy, skip, take });
    }

    static countPermissions(where: any) {
        return prisma.permissions.count({ where });
    }

    static findPermissionById(id: bigint) {
        return prisma.permissions.findFirst({ where: { id } });
    }

    static findPermissionByKey(key: string) {
        return prisma.permissions.findUnique({ where: { key } });
    }

    static findPermissionByKeyExcluding(key: string, excludeId: bigint) {
        return prisma.permissions.findFirst({ where: { key, id: { not: excludeId } } });
    }

    static createPermission(data: { key: string; name: string }) {
        return prisma.permissions.create({ data });
    }

    static updatePermission(id: bigint, data: any) {
        return prisma.permissions.update({ where: { id }, data });
    }

    // ── Project Permissions ─────────────────────────────────────────────────

    static findProjectPermissions(where: any, orderBy: any, skip: number, take: number) {
        return prisma.projectPermissions.findMany({
            where,
            select: { id: true, key: true, name: true },
            orderBy,
            skip,
            take,
        });
    }

    static countProjectPermissions(where: any) {
        return prisma.projectPermissions.count({ where });
    }

    static findProjectPermissionById(id: bigint) {
        return prisma.projectPermissions.findUnique({
            where: { id },
            select: {
                id: true,
                key: true,
                name: true,
                memberRolesPermissions: { select: { role: true } },
            },
        });
    }

    static findProjectPermissionByKey(key: string) {
        return prisma.projectPermissions.findUnique({ where: { key } });
    }

    static findProjectPermissionByKeyExcluding(key: string, excludeId: bigint) {
        return prisma.projectPermissions.findFirst({ where: { key, id: { not: excludeId } } });
    }

    static createProjectPermission(data: { key: string; name: string }) {
        return prisma.projectPermissions.create({
            data,
            select: { id: true, key: true, name: true },
        });
    }

    static updateProjectPermission(id: bigint, data: any) {
        return prisma.projectPermissions.update({
            where: { id },
            data,
            select: { id: true, key: true, name: true },
        });
    }

    static deleteProjectPermission(id: bigint) {
        return prisma.projectPermissions.delete({ where: { id } });
    }

    // ── Auth / OTP ──────────────────────────────────────────────────────────

    static findMemberRolePermission(role: string, permissionKey: string) {
        return prisma.memberRolesPermissions.findFirst({
            where: { role: role as any, projectPermission: { key: permissionKey } },
        });
    }
}

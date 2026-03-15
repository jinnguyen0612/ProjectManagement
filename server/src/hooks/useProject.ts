import prisma from "../infrastructure/libs/prisma";
import { AppError } from "../core/errors/app-error";
import { currentUserWithRole } from "./useAuth";
import { MemberRole } from "../core/enums/role";

/**
 * Lấy member record của user hiện tại trong project.
 * Trả về null nếu không phải member.
 */
export const getCurrentMemberInProject = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();

    if (isAdmin) return null; // admin bypass

    const member = await prisma.members.findFirst({
        where: { projectId, userId: user.id },
    });

    return member;
};

/**
 * Kiểm tra user hiện tại có phải member của project không.
 * Admin luôn pass.
 */
export const assertProjectMember = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await prisma.members.findFirst({
        where: { projectId, userId: user.id },
    });

    if (!member) {
        throw new AppError("You are not a member of this project", 403);
    }
};

/**
 * Kiểm tra user hiện tại có role cụ thể trong project không.
 * Admin luôn pass.
 * @param projectId
 * @param roles - Danh sách roles được phép
 */
export const assertProjectRole = async (
    projectId: bigint,
    roles: MemberRole[]
) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await prisma.members.findFirst({
        where: { projectId, userId: user.id },
    });

    if (!member) {
        throw new AppError("You are not a member of this project", 403);
    }

    if (!roles.includes(member.role as MemberRole)) {
        throw new AppError("You don't have the required role in this project", 403);
    }
};

/**
 * Kiểm tra user hiện tại có phải owner của project không.
 * Admin luôn pass.
 */
export const assertProjectOwner = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    if (project.ownerId !== user.id) {
        throw new AppError("You are not the owner of this project", 403);
    }
};

/**
 * Kiểm tra user hiện tại có phải owner hoặc leader của project không.
 * Admin luôn pass.
 */
export const assertProjectOwnerOrLeader = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    if (project.ownerId === user.id) return;

    const member = await prisma.members.findFirst({
        where: { projectId, userId: user.id },
    });

    if (!member || member.role !== MemberRole.LEADER) {
        throw new AppError("You must be the project owner or leader", 403);
    }
};

/**
 * Kiểm tra member hiện tại có permission cụ thể trong project không.
 * Logic:
 *  1. Admin → luôn pass
 *  2. Lấy member record + MembersPermissions override
 *  3. Nếu có override isDeny=true → deny
 *  4. Nếu có override isDeny=false → grant (bất kể role)
 *  5. Fallback về MemberRolesPermissions của role (từ DB)
 *
 * @param projectId
 * @param permissionKey - e.g. 'task.create', 'member.add'
 */
export const assertProjectPermission = async (
    projectId: bigint,
    permissionKey: string
) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await prisma.members.findFirst({
        where: { projectId, userId: user.id },
        include: {
            membersPermissions: {
                include: { projectPermission: true },
            },
        },
    });

    if (!member) {
        throw new AppError("You are not a member of this project", 403);
    }

    // Check per-member override
    const override = member.membersPermissions.find(
        (mp) => mp.projectPermission.key === permissionKey
    );

    if (override) {
        if (override.isDeny) {
            throw new AppError(`Permission denied: ${permissionKey}`, 403);
        }
        return; // explicitly granted
    }

    // Fallback: check MemberRolesPermissions in DB
    const rolePermission = await prisma.memberRolesPermissions.findFirst({
        where: {
            role: member.role,
            projectPermission: { key: permissionKey },
        },
    });

    if (!rolePermission) {
        throw new AppError(`Permission denied: ${permissionKey}`, 403);
    }
};

/**
 * Kiểm tra member hiện tại có permission mà không throw — trả về boolean.
 * Hữu ích khi muốn check điều kiện mà không muốn dừng flow.
 */
export const hasProjectPermission = async (
    projectId: bigint,
    permissionKey: string
): Promise<boolean> => {
    try {
        await assertProjectPermission(projectId, permissionKey);
        return true;
    } catch {
        return false;
    }
};

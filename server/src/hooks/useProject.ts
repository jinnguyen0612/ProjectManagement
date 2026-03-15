import { AppError } from "../core/errors/app-error";
import { currentUserWithRole } from "./useAuth";
import { MemberFacade } from "../infrastructure/facades/member.facade";
import { ProjectFacade } from "../infrastructure/facades/project.facade";
import { PermissionFacade } from "../infrastructure/facades/permission.facade";
import { MemberRole } from "../core/enums/role";

/**
 * Lấy member record của user hiện tại trong project.
 * Trả về null nếu không phải member hoặc là admin.
 */
export const getCurrentMemberInProject = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return null;
    return MemberFacade.findByUserId(projectId, user.id);
};

/**
 * Kiểm tra user hiện tại có phải member của project không.
 * Admin luôn pass.
 */
export const assertProjectMember = async (projectId: bigint) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await MemberFacade.findByUserId(projectId, user.id);
    if (!member) throw new AppError("You are not a member of this project", 403);
};

/**
 * Kiểm tra user hiện tại có role cụ thể trong project không.
 * Admin luôn pass.
 */
export const assertProjectRole = async (projectId: bigint, roles: MemberRole[]) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await MemberFacade.findByUserId(projectId, user.id);
    if (!member) throw new AppError("You are not a member of this project", 403);

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

    const project = await ProjectFacade.findRaw(projectId);
    if (!project) throw new AppError("Project not found", 404);

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

    const project = await ProjectFacade.findRaw(projectId);
    if (!project) throw new AppError("Project not found", 404);

    if (project.ownerId === user.id) return;

    const member = await MemberFacade.findByUserId(projectId, user.id);
    if (!member || member.role !== MemberRole.LEADER) {
        throw new AppError("You must be the project owner or leader", 403);
    }
};

/**
 * Kiểm tra member hiện tại có permission cụ thể trong project không.
 * Logic:
 *  1. Admin → luôn pass
 *  2. Lấy member + MembersPermissions override
 *  3. isDeny=true → deny | isDeny=false → grant
 *  4. Fallback về MemberRolesPermissions của role
 */
export const assertProjectPermission = async (projectId: bigint, permissionKey: string) => {
    const { user, isAdmin } = await currentUserWithRole();
    if (isAdmin) return;

    const member = await MemberFacade.findByUserIdWithPermissions(projectId, user.id);
    if (!member) throw new AppError("You are not a member of this project", 403);

    const override = member.membersPermissions.find(
        (mp) => mp.projectPermission.key === permissionKey
    );

    if (override) {
        if (override.isDeny) throw new AppError(`Permission denied: ${permissionKey}`, 403);
        return;
    }

    const rolePermission = await PermissionFacade.findMemberRolePermission(member.role, permissionKey);
    if (!rolePermission) throw new AppError(`Permission denied: ${permissionKey}`, 403);
};

/**
 * Trả về boolean thay vì throw — hữu ích khi check điều kiện mà không muốn dừng flow.
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

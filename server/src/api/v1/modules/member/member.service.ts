import { AppError } from "../../../../core/errors/app-error";
import { assertProjectPermission, assertProjectOwnerOrLeader } from "../../../../hooks/useProject";
import { MemberRole } from "../../../../core/enums/role";
import { currentUserWithRole } from "../../../../hooks/useAuth";
import { MemberFacade } from "../../../../infrastructure/facades/member.facade";
import { ProjectFacade } from "../../../../infrastructure/facades/project.facade";
import { UserFacade } from "../../../../infrastructure/facades/user.facade";

export class MemberService {
    static async getMemberDetail(projectId: bigint, memberId: bigint) {
        const member = await MemberFacade.findInProject(projectId, memberId);
        if (!member) throw new AppError('Member not found in this project', 404);
        return member;
    }

    static async addMember(projectId: bigint, data: any) {
        const project = await ProjectFacade.findRaw(projectId);
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.create');

        const user = await UserFacade.findById(data.userId);
        if (!user) throw new AppError('User not found', 404);

        const existing = await MemberFacade.findByUserId(projectId, data.userId);
        if (existing) throw new AppError('User is already a member of this project', 409);

        const { user: currentUser } = await currentUserWithRole();

        return MemberFacade.create({
            projectId,
            userId: data.userId,
            role: data.role ?? MemberRole.MEMBER,
            addBy: currentUser.id,
        });
    }

    static async removeMember(projectId: bigint, memberId: bigint) {
        const project = await ProjectFacade.findRaw(projectId);
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.delete');

        const member = await MemberFacade.findByUserId(projectId, memberId);
        if (!member) throw new AppError('Member not found in this project', 404);

        if (member.userId === project.ownerId) {
            throw new AppError('Cannot remove the project owner', 403);
        }

        await MemberFacade.delete(memberId);
    }

    static async changeMemberRole(projectId: bigint, memberId: bigint, role: MemberRole) {
        const project = await ProjectFacade.findRaw(projectId);
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.update');

        const member = await MemberFacade.findInProject(projectId, memberId);
        if (!member) throw new AppError('Member not found in this project', 404);

        if (member.user.id === project.ownerId) {
            throw new AppError('Cannot change role of the project owner', 403);
        }

        return MemberFacade.updateRole(memberId, role);
    }

    static async updateMemberPermissions(
        projectId: bigint,
        memberId: bigint,
        permissions: { projectPermissionId: bigint; isDeny: boolean }[]
    ) {
        const project = await ProjectFacade.findRaw(projectId);
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectOwnerOrLeader(projectId);

        const member = await MemberFacade.findInProject(projectId, memberId);
        if (!member) throw new AppError('Member not found in this project', 404);

        const permIds = permissions.map((p) => p.projectPermissionId);
        const existing = await MemberFacade.validatePermissionIds(permIds);
        if (existing.length !== permIds.length) {
            throw new AppError('One or more project permissions not found', 404);
        }

        await MemberFacade.upsertPermissions(memberId, permissions);
        return MemberService.getMemberDetail(projectId, memberId);
    }
}

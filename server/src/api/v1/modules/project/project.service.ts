import { buildWhereCondition } from "../../../../shared/pagination";
import { AppError } from "../../../../core/errors/app-error";
import { currentUserWithRole } from "../../../../hooks/useAuth";
import { assertProjectOwnerOrLeader, assertProjectOwner } from "../../../../hooks/useProject";
import { ProjectStatus } from "../../../../core/enums/status";
import { generateProjectCode } from "../../../../core/utils/generate-code";
import { ProjectFacade } from "../../../../infrastructure/facades/project.facade";

export class ProjectService {
    static async getProjects(
        skip: number,
        limit: number,
        search?: string,
        searchField?: string,
        filters: Record<string, any> = {},
        sortBy: string = 'id',
        sortOrder: 'asc' | 'desc' = 'desc',
        ownerSearch?: string,
        ownerSearchField?: 'fullname' | 'phone' | 'email'
    ) {
        const { user, isAdmin } = await currentUserWithRole();
        const SEARCHABLE_FIELDS = isAdmin ? ['code', 'name', 'status'] : ['name', 'status'];

        let whereCondition: any = {};

        if (!isAdmin) {
            whereCondition.OR = [
                { ownerId: user.id },
                { members: { some: { userId: user.id } } },
            ];
        }

        if (search) {
            const searchCondition = searchField && SEARCHABLE_FIELDS.includes(searchField)
                ? { [searchField]: { contains: search, mode: 'insensitive' } }
                : { OR: SEARCHABLE_FIELDS.map(f => ({ [f]: { contains: search, mode: 'insensitive' } })) };

            whereCondition = whereCondition.OR
                ? { AND: [{ OR: whereCondition.OR }, searchCondition] }
                : { ...whereCondition, ...searchCondition };
        }

        whereCondition = buildWhereCondition(whereCondition, filters, { status: 'exact' });

        if (isAdmin && ownerSearch) {
            const OWNER_FIELDS = ['fullname', 'phone', 'email'];
            const ownerCondition = ownerSearchField && OWNER_FIELDS.includes(ownerSearchField)
                ? { [ownerSearchField]: { contains: ownerSearch, mode: 'insensitive' } }
                : { OR: OWNER_FIELDS.map(f => ({ [f]: { contains: ownerSearch, mode: 'insensitive' } })) };
            whereCondition = { AND: [whereCondition, { owner: ownerCondition }] };
        }

        const selectCondition = isAdmin ? {
            id: true, code: true, name: true, status: true, bgColor: true,
            ownerId: true, createdAt: true, updatedAt: true,
            _count: { select: { statuses: true, members: true } },
        } : {
            code: true, name: true, bgColor: true, status: true,
            _count: { select: { statuses: true, members: true } },
        };

        const [projects, total] = await Promise.all([
            ProjectFacade.findMany(whereCondition, selectCondition, { [sortBy]: sortOrder }, skip, limit),
            ProjectFacade.count(whereCondition),
        ]);

        return { projects, total };
    }

    static async getProjectDetail(id: bigint) {
        const { user, isAdmin } = await currentUserWithRole();

        const project = await ProjectFacade.findById(id);
        if (!project) throw new AppError("Project not found", 404);

        if (!isAdmin) {
            const isMember = project.members.some((m) => m.user.id === user.id);
            const isOwner = project.ownerId === user.id;
            if (!isMember && !isOwner) throw new AppError("Project not found", 404);
        }

        return project;
    }

    static async createProject(data: any) {
        const code = generateProjectCode(8);
        const { user: userCurrent, isAdmin } = await currentUserWithRole();

        let ownerId: bigint;
        if (!isAdmin) {
            ownerId = userCurrent.id;
        } else {
            if (!data.ownerId) throw new AppError("Owner is required", 400);
            ownerId = data.ownerId;
        }

        return ProjectFacade.createWithDefaults({
            code,
            name: data.name,
            description: data.description,
            bgColor: data.bgColor,
            ownerId,
        });
    }

    static async updateProject(id: bigint, data: any) {
        const project = await ProjectFacade.findRaw(id);
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectOwnerOrLeader(id);

        const updateData: any = { updatedAt: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;
        if (data.status !== undefined) updateData.status = data.status;

        return ProjectFacade.update(id, updateData);
    }

    static async archiveProject(id: bigint) {
        const project = await ProjectFacade.findRaw(id);
        if (!project) throw new AppError('Project not found', 404);
        if (project.status === ProjectStatus.ARCHIVED) throw new AppError('Project is already archived', 400);

        await assertProjectOwner(id);
        return ProjectFacade.archive(id);
    }

    static async starProject(projectId: bigint) {
        const { user } = await currentUserWithRole();
        const project = await ProjectFacade.findRaw(projectId);
        if (!project) throw new AppError('Project not found', 404);
        await ProjectFacade.upsertStar(user.id, projectId);
    }

    static async unstarProject(projectId: bigint) {
        const { user } = await currentUserWithRole();
        await ProjectFacade.deleteStar(user.id, projectId);
    }
}

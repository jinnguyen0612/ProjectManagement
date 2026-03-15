import { AppError } from "../../../../core/errors/app-error";
import { assertProjectMember, assertProjectPermission } from "../../../../hooks/useProject";
import { StatusFacade } from "../../../../infrastructure/facades/status.facade";

export class StatusService {
    static async getStatuses(projectId: bigint) {
        await assertProjectMember(projectId);
        return StatusFacade.findAll(projectId);
    }

    static async createStatus(projectId: bigint, data: { name: string; bgColor?: string }) {
        await assertProjectPermission(projectId, 'status.create');

        const existing = await StatusFacade.findByName(projectId, data.name);
        if (existing) throw new AppError('Status name already exists in this project', 409);

        const last = await StatusFacade.findLastPosition(projectId);

        return StatusFacade.create({
            projectId,
            name: data.name,
            bgColor: data.bgColor ?? null,
            position: (last?.position ?? -1) + 1,
        });
    }

    static async updateStatus(projectId: bigint, statusId: bigint, data: { name?: string; bgColor?: string }) {
        await assertProjectPermission(projectId, 'status.update');

        const status = await StatusFacade.findOne(statusId, projectId);
        if (!status) throw new AppError('Status not found', 404);

        if (data.name && data.name !== status.name) {
            const conflict = await StatusFacade.findByName(projectId, data.name, statusId);
            if (conflict) throw new AppError('Status name already exists in this project', 409);
        }

        return StatusFacade.update(statusId, {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.bgColor !== undefined && { bgColor: data.bgColor }),
        });
    }

    static async deleteStatus(projectId: bigint, statusId: bigint) {
        await assertProjectPermission(projectId, 'status.delete');

        const status = await StatusFacade.findOne(statusId, projectId);
        if (!status) throw new AppError('Status not found', 404);

        const taskCount = await StatusFacade.countTasks(statusId);
        if (taskCount > 0) throw new AppError('Cannot delete status that has tasks', 400);

        await StatusFacade.delete(statusId);
    }

    static async reorderStatuses(projectId: bigint, orderedIds: bigint[]) {
        await assertProjectPermission(projectId, 'status.update');

        const statuses = await StatusFacade.findAllIds(projectId);
        const existingIds = new Set(statuses.map((s) => s.id.toString()));
        const allValid = orderedIds.every((id) => existingIds.has(id.toString()));

        if (!allValid || orderedIds.length !== statuses.length) {
            throw new AppError('Invalid status IDs for reorder', 400);
        }

        await StatusFacade.reorder(orderedIds);
        return StatusFacade.findAll(projectId);
    }
}

import { AppError } from "../../../../core/errors/app-error";
import { assertProjectMember, assertProjectPermission } from "../../../../hooks/useProject";
import { currentUserWithRole } from "../../../../hooks/useAuth";
import { generateTaskCode } from "../../../../core/utils/generate-code";
import { TaskFacade } from "../../../../infrastructure/facades/task.facade";

export class TaskService {
    static async getTasks(projectId: bigint, filters: { statusId?: bigint; memberId?: bigint } = {}) {
        await assertProjectMember(projectId);

        const where: any = { projectId };
        if (filters.statusId) where.statusId = filters.statusId;
        if (filters.memberId) where.tasksMembers = { some: { memberId: filters.memberId } };

        return TaskFacade.findMany(where);
    }

    static async getTaskDetail(projectId: bigint, taskId: bigint) {
        await assertProjectMember(projectId);

        const task = await TaskFacade.findOne(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);
        return task;
    }

    static async createTask(projectId: bigint, data: any) {
        await assertProjectPermission(projectId, 'task.create');

        const { user } = await currentUserWithRole();

        const status = await TaskFacade.findStatusInProject(data.statusId, projectId);
        if (!status) throw new AppError('Status not found in this project', 404);

        const last = await TaskFacade.findLastPosition(projectId, data.statusId);
        const code = generateTaskCode(6);

        return TaskFacade.create({
            code,
            projectId,
            statusId: data.statusId,
            bgColor: data.bgColor ?? null,
            dateStart: data.dateStart ?? null,
            dateEnd: data.dateEnd ?? null,
            position: (last?.position ?? -1n) + 1n,
            createdBy: user.id,
        });
    }

    static async updateTask(projectId: bigint, taskId: bigint, data: any) {
        await assertProjectPermission(projectId, 'task.update');

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        if (data.statusId) {
            const status = await TaskFacade.findStatusInProject(data.statusId, projectId);
            if (!status) throw new AppError('Status not found in this project', 404);
        }

        const updateData: any = { updatedAt: new Date() };
        if (data.statusId !== undefined) updateData.statusId = data.statusId;
        if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;
        if (data.dateStart !== undefined) updateData.dateStart = data.dateStart;
        if (data.dateEnd !== undefined) updateData.dateEnd = data.dateEnd;
        if (data.position !== undefined) updateData.position = data.position;

        return TaskFacade.update(taskId, updateData);
    }

    static async deleteTask(projectId: bigint, taskId: bigint) {
        await assertProjectPermission(projectId, 'task.delete');

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        await TaskFacade.delete(taskId);
    }

    static async assignMembers(projectId: bigint, taskId: bigint, memberIds: bigint[]) {
        await assertProjectPermission(projectId, 'task.update');

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        const members = await TaskFacade.validateMembersInProject(memberIds, projectId);
        if (members.length !== memberIds.length) {
            throw new AppError('One or more members not found in this project', 404);
        }

        await TaskFacade.replaceAssignees(taskId, memberIds);
        return TaskFacade.findWithAssignees(taskId);
    }
}

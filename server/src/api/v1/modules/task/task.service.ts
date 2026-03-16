import { AppError } from "../../../../core/errors/app-error";
import { assertProjectMember, assertProjectPermission, assertProjectRole } from "../../../../hooks/useProject";
import { currentUserWithRole } from "../../../../hooks/useAuth";
import { generateTaskCode } from "../../../../core/utils/generate-code";
import { TaskFacade } from "../../../../infrastructure/facades/task.facade";
import { MemberRole } from "../../../../core/enums/role";

export class TaskService {
    static async getTasks(projectId: bigint, filters: { statusId?: bigint; memberId?: bigint; isCompleted?: boolean } = {}) {
        await assertProjectMember(projectId);

        const where: any = { projectId };
        if (filters.statusId) where.statusId = filters.statusId;
        if (filters.memberId) where.tasksMembers = { some: { memberId: filters.memberId } };
        if (filters.isCompleted !== undefined) where.isCompleted = filters.isCompleted;

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
            name: data.name,
            description: data.description ?? null,
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
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;
        if (data.dateStart !== undefined) updateData.dateStart = data.dateStart;
        if (data.dateEnd !== undefined) updateData.dateEnd = data.dateEnd;
        if (data.position !== undefined) updateData.position = data.position;

        return TaskFacade.update(taskId, updateData);
    }

    static async completeTask(projectId: bigint, taskId: bigint) {
        await assertProjectRole(projectId, [MemberRole.LEADER]);

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        return TaskFacade.setCompleted(taskId, true);
    }

    static async uncompleteTask(projectId: bigint, taskId: bigint) {
        await assertProjectRole(projectId, [MemberRole.LEADER]);

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        return TaskFacade.setCompleted(taskId, false);
    }

    static async changeTaskStatus(projectId: bigint, taskId: bigint, statusId: bigint) {
        await assertProjectPermission(projectId, 'task.update');

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        const status = await TaskFacade.findStatusInProject(statusId, projectId);
        if (!status) throw new AppError('Status not found in this project', 404);

        return TaskFacade.changeStatus(taskId, statusId);
    }

    static async moveTask(
        projectId: bigint,
        taskId: bigint,
        newStatusId: bigint,
        targetOrderedIds: bigint[],
        sourceOrderedIds?: bigint[]
    ) {
        await assertProjectPermission(projectId, 'task.update');

        const task = await TaskFacade.findRaw(taskId, projectId);
        if (!task) throw new AppError('Task not found', 404);

        const status = await TaskFacade.findStatusInProject(newStatusId, projectId);
        if (!status) throw new AppError('Status not found in this project', 404);

        const isSameStatus = task.statusId === newStatusId;
        const updates: { id: bigint; position: bigint; statusId?: bigint }[] = [];

        // Cập nhật position cho status đích
        targetOrderedIds.forEach((id, index) => {
            updates.push({
                id,
                position: BigInt(index),
                // Chỉ set statusId cho task được kéo (hoặc tất cả nếu muốn chắc chắn)
                ...(id === taskId && !isSameStatus ? { statusId: newStatusId } : {}),
            });
        });

        // Cập nhật position cho status nguồn (nếu kéo sang status khác)
        if (!isSameStatus && sourceOrderedIds) {
            sourceOrderedIds.forEach((id, index) => {
                updates.push({ id, position: BigInt(index) });
            });
        }

        await TaskFacade.bulkUpdatePositions(updates);
        return TaskFacade.findOne(taskId, projectId);
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

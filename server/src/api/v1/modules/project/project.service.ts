import prisma from "../../../../infrastructure/libs/prisma";
import { buildWhereCondition } from "../../../../shared/pagination";
import { AppError } from "../../../../core/errors/app-error";
import { currentUserWithRole } from "../../../../hooks/useAuth";
import { assertProjectOwnerOrLeader, assertProjectOwner } from "../../../../hooks/useProject";
import { MemberRole } from "../../../../core/enums/role";
import { UserStatus, ProjectStatus } from "../../../../core/enums/status";
import { generateProjectCode } from "../../../../core/utils/generate-code";

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

        // Nếu không phải admin, chỉ xem projects mà user là owner hoặc member
        if (!isAdmin) {
            whereCondition.OR = [
                { ownerId: user.id },  // User là owner
                {
                    members: {
                        some: {
                            userId: user.id  // User là member
                        }
                    }
                }
            ];
        }

        // Add search
        if (search) {
            const searchCondition = searchField && SEARCHABLE_FIELDS.includes(searchField)
                ? {
                    [searchField]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }
                : {
                    OR: SEARCHABLE_FIELDS.map(field => ({
                        [field]: {
                            contains: search,
                            mode: 'insensitive',
                        }
                    }))
                };

            // Merge search với whereCondition hiện tại
            if (whereCondition.OR) {
                // Nếu đã có OR (từ !isAdmin), wrap lại
                whereCondition = {
                    AND: [
                        { OR: whereCondition.OR },
                        searchCondition
                    ]
                };
            } else {
                whereCondition = { ...whereCondition, ...searchCondition };
            }
        }

        // Add filters (operators tự động xử lý)
        whereCondition = buildWhereCondition(whereCondition, filters, {
            status: 'exact',
        });

        // Filter by owner info (chỉ admin mới dùng được)
        if (isAdmin && ownerSearch) {
            const OWNER_SEARCHABLE_FIELDS = ['fullname', 'phone', 'email'];
            const ownerCondition = ownerSearchField && OWNER_SEARCHABLE_FIELDS.includes(ownerSearchField)
                ? { [ownerSearchField]: { contains: ownerSearch, mode: 'insensitive' } }
                : {
                    OR: OWNER_SEARCHABLE_FIELDS.map(field => ({
                        [field]: { contains: ownerSearch, mode: 'insensitive' }
                    }))
                };

            whereCondition = {
                AND: [
                    whereCondition,
                    { owner: ownerCondition }
                ]
            };
        }

        // Build orderBy
        const orderBy: any = {
            [sortBy]: sortOrder,
        };

        // Select fields based on role
        const selectCondition = isAdmin ? {
            id: true,
            code: true,
            name: true,
            status: true,
            bgColor: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    statuses: true,
                    members: true,
                }
            }
        } : {
            code: true,
            name: true,
            bgColor: true,
            status: true,
            _count: {
                select: {
                    statuses: true,
                    members: true,
                }
            }
        };

        const [projects, total] = await Promise.all([
            prisma.projects.findMany({
                where: whereCondition,
                select: selectCondition,
                orderBy,
                skip,
                take: limit,
            }),
            prisma.projects.count({
                where: whereCondition,
            }),
        ]);

        return { projects, total };
    }

    static async getProjectDetail(id: bigint) {
        const { user, isAdmin } = await currentUserWithRole();

        const project = await prisma.projects.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
                status: true,
                bgColor: true,
                ownerId: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        phone: true
                    }
                },
                members: {
                    where: {
                        user: {
                            status: UserStatus.ACTIVE
                        }
                    },
                    select: {
                        id: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                avatar: true,
                                fullname: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        statuses: true,
                        members: true,
                    }
                }
            }
        });

        if (!project) {
            throw new AppError("Project not found", 404);
        }

        // Non-admin chỉ xem được project mà họ là owner hoặc member
        if (!isAdmin) {
            const isMember = project.members.some(m => m.user.id === user.id);
            const isOwner = project.ownerId === user.id;
            if (!isMember && !isOwner) {
                throw new AppError("Project not found", 404);
            }
        }

        return project;
    }

    static async createProject(data: any) {
        const code = generateProjectCode(8);
        const { user: userCurrent, isAdmin } = await currentUserWithRole();

        // Xác định ownerId
        let ownerId: bigint;
        if (!isAdmin) {
            ownerId = userCurrent.id;
        } else {
            if (!data.ownerId) {
                throw new AppError("Owner is required", 400);
            }
            ownerId = data.ownerId;
        }

        const project = await prisma.$transaction(async (tx) => {
            const newProject = await tx.projects.create({
                data: {
                    code,
                    name: data.name,
                    description: data.description || null,
                    bgColor: data.bgColor || null,
                    status: 'active',
                    ownerId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    members: {
                        create: {
                            userId: ownerId,
                            role: MemberRole.LEADER,
                            joinedAt: new Date(),
                        }
                    }
                },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    bgColor: true,
                    ownerId: true,
                    createdAt: true,
                    updatedAt: true,
                    owner: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true,
                            phone: true
                        }
                    },
                    members: {
                        where: {
                            user: {
                                status: UserStatus.ACTIVE
                            }
                        },
                        select: {
                            id: true,
                            role: true,
                            user: {
                                select: {
                                    id: true,
                                    avatar: true,
                                    fullname: true,
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            statuses: true,
                            members: true,
                        }
                    }
                }
            });

            await tx.statuses.createMany({
                data: [
                    { name: "To Do", bgColor: "#f59e0b", projectId: newProject.id },
                    { name: "In Progress", bgColor: "#3b82f6", projectId: newProject.id },
                    { name: "Done", bgColor: "#10b981", projectId: newProject.id },
                ]
            });

            return newProject;
        });

        return project;
    }

    static async updateProject(id: bigint, data: any) {
        const project = await prisma.projects.findUnique({ where: { id } });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        await assertProjectOwnerOrLeader(id);

        const updateData: any = { updatedAt: new Date() };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;
        if (data.status !== undefined) updateData.status = data.status;

        return prisma.projects.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                code: true,
                name: true,
                status: true,
                bgColor: true,
                ownerId: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    static async archiveProject(id: bigint) {
        const project = await prisma.projects.findUnique({ where: { id } });
        if (!project) throw new AppError('Project not found', 404);

        if (project.status === ProjectStatus.ARCHIVED) {
            throw new AppError('Project is already archived', 400);
        }

        await assertProjectOwner(id);

        return prisma.projects.update({
            where: { id },
            data: { status: ProjectStatus.ARCHIVED, updatedAt: new Date() },
            select: {
                id: true,
                code: true,
                name: true,
                status: true,
                bgColor: true,
                ownerId: true,
                updatedAt: true,
            }
        });
    }

}

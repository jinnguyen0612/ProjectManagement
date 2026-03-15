import { z } from "zod";
import { MemberRole } from "../../../../core/enums/role";

const projectIdParam = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

const projectMemberParams = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
    memberId: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

export const getMemberDetailSchema = z.object({ params: projectMemberParams });

export const addMemberSchema = z.object({
    params: projectIdParam,
    body: z.object({
        userId: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
        role: z.enum([MemberRole.LEADER, MemberRole.MEMBER, MemberRole.VIEWER]).optional(),
    }),
});

export const removeMemberSchema = z.object({ params: projectMemberParams });

export const changeMemberRoleSchema = z.object({
    params: projectMemberParams,
    body: z.object({
        role: z.enum([MemberRole.LEADER, MemberRole.MEMBER, MemberRole.VIEWER]),
    }),
});

export const updateMemberPermissionsSchema = z.object({
    params: projectMemberParams,
    body: z.object({
        permissions: z.array(z.object({
            projectPermissionId: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
            isDeny: z.boolean(),
        })).min(1),
    }),
});

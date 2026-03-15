import { z } from "zod";
import { MemberRole } from "../../../../core/enums/role";

const projectMemberParams = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid Project ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid Project ID"),
    memberId: z.string()
        .regex(/^\d+$/, "Invalid Member ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid Member ID"),
});

export const getMemberDetailSchema = z.object({
    params: projectMemberParams,
});

export const addMemberSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, "Invalid Project ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid Project ID"),
    }),
    body: z.object({
        userId: z.string()
            .regex(/^\d+$/, "Invalid User ID")
            .transform((val) => BigInt(val)),
        role: z.enum([MemberRole.LEADER, MemberRole.MEMBER, MemberRole.VIEWER]).optional(),
    }),
});

export const removeMemberSchema = z.object({
    params: projectMemberParams,
});

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
            projectPermissionId: z.string()
                .regex(/^\d+$/, "Invalid Permission ID")
                .transform((val) => BigInt(val)),
            isDeny: z.boolean(),
        })).min(1),
    }),
});

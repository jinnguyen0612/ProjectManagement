import { object, z } from "zod";

export const createClientKeySchema = object ({
    body: z.object({
        name: z.string().min(1,"Name is required"),
    })
})

export type createClientKeyInput = z.infer<typeof createClientKeySchema>["body"];
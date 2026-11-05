import { z } from "zod";

export const createWorkerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  employeeId: z.string().trim().min(1, "Employee ID is required"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    .optional(),

  sector: z.string().trim().min(1).optional(),

  site: z.string().trim().min(1).optional(),

  language: z.enum(["en", "hi", "sat"]).default("en"),
});

export const updateWorkerSchema = createWorkerSchema.partial();

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
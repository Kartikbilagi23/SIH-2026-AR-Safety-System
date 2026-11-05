import { z } from "zod";

export const startTrainingSessionSchema = z.object({
  workerId: z.string().min(1),
  moduleId: z.string().min(1),
});

export type StartTrainingSessionInput =
  z.infer<typeof startTrainingSessionSchema>;

export const submitTrainingSessionSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedAnswer: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export type SubmitTrainingSessionInput =
  z.infer<typeof submitTrainingSessionSchema>;
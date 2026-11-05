import { z } from "zod";

const languageSchema = z.enum(["EN", "HI", "SAT"]);

const translationSchema = z.object({
  language: languageSchema,
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
});

export const createTrainingModuleSchema = z.object({
  category: z.string().trim().min(2),
  durationMin: z.number().int().positive().optional(),

  translations: z
    .array(translationSchema)
    .min(1, "At least one translation is required")
    .superRefine((translations, ctx) => {
      const languages = translations.map(
        (translation) => translation.language
      );

      if (new Set(languages).size !== languages.length) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate languages are not allowed",
        });
      }
    }),
});

export const updateTrainingModuleSchema =
  createTrainingModuleSchema.partial();

export type CreateTrainingModuleInput =
  z.infer<typeof createTrainingModuleSchema>;

export type UpdateTrainingModuleInput =
  z.infer<typeof updateTrainingModuleSchema>;
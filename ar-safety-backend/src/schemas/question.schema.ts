
import { z } from "zod";

const languageSchema = z.enum(["EN", "HI", "SAT"]);

const questionTranslationSchema = z.object({
  language: languageSchema,
  question: z.string().trim().min(5),
  options: z.array(z.string().trim().min(1)).min(2).max(6),
});

const translationsSchema = z
  .array(questionTranslationSchema)
  .min(1)
  .superRefine((translations, ctx) => {
    const languages = translations.map((translation) => translation.language);

    if (new Set(languages).size !== languages.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate languages are not allowed",
      });
    }
  });

const questionFields = {
  correctAnswer: z.number().int().nonnegative(),
  translations: translationsSchema,
};

export const createQuestionSchema = z
  .object(questionFields)
  .superRefine((data, ctx) => {
    for (const translation of data.translations) {
      if (data.correctAnswer >= translation.options.length) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Correct answer index must match an available option",
        });
      }
    }
  });

export const updateQuestionSchema = z
  .object({
    correctAnswer: questionFields.correctAnswer.optional(),
    translations: translationsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Validate the answer index when both fields are supplied.
    if (
      data.correctAnswer !== undefined &&
      data.translations !== undefined
    ) {
      for (const translation of data.translations) {
        if (data.correctAnswer >= translation.options.length) {
          ctx.addIssue({
            code: "custom",
            path: ["correctAnswer"],
            message: "Correct answer index must match an available option",
          });
        }
      }
    }
  });

  export type CreateQuestionInput = z.infer<
  typeof createQuestionSchema
>;

export type UpdateQuestionInput = z.infer<
  typeof updateQuestionSchema
>;

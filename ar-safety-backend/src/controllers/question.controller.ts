import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import type { CreateQuestionInput, UpdateQuestionInput } from "../schemas/question.schema.js";

export const createQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { moduleId } = req.params;

    if (!moduleId || Array.isArray(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const data = req.body as CreateQuestionInput;

    const module = await prisma.trainingModule.findUnique({
      where: {
        id: moduleId,
      },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Training module not found",
      });
    }

    for (const translation of data.translations) {
      if (data.correctAnswer >= translation.options.length) {
        return res.status(400).json({
          success: false,
          message: `correctAnswer must be between 0 and ${
            translation.options.length - 1
          }`,
        });
      }
    }

    const question = await prisma.question.create({
      data: {
        moduleId,
        correctAnswer: data.correctAnswer,

        translations: {
          create: data.translations,
        },
      },

      include: {
        translations: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const data = req.body as UpdateQuestionInput;

    const existingQuestion =
      await prisma.question.findUnique({
        where: { id },
      });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (data.correctAnswer !== undefined) {
      if (data.translations) {
        for (const translation of data.translations) {
          if (
            data.correctAnswer >=
            translation.options.length
          ) {
            return res.status(400).json({
              success: false,
              message: "Invalid correctAnswer index",
            });
          }
        }
      }
    }

    const question = await prisma.question.update({
      where: { id },

      data: {
        ...(data.correctAnswer !== undefined && {
          correctAnswer: data.correctAnswer,
        }),

        ...(data.translations && {
          translations: {
            deleteMany: {},
            create: data.translations,
          },
        }),
      },

      include: {
        translations: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await prisma.question.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
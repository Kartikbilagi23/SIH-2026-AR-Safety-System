import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import { type CreateTrainingModuleInput } from "../schemas/training-module.schema.js";

export const createTrainingModule = async (
    req: Request,
    res: Response
) => {
    try {
        const data = req.body as CreateTrainingModuleInput;

        const module = await prisma.trainingModule.create({
            data: {
                category: data.category,
                durationMin: data.durationMin?? null,
                translations: {
                    create: data.translations.map((translation) => ({
                        language: translation.language,
                        title: translation.title,
                        description: translation.description ?? null,
                    })),
                }
            },
            include: {
                translations: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Training module created successfully",
            data: module,
        });
    } catch (error: unknown) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getTrainingModules = async (
    _req: Request,
    res: Response
) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            include: {
                translations: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: modules,
        });
    } catch (error: unknown) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getTrainingModuleById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await prisma.trainingModule.findUnique({
      where: {
        id,
      },
      include: {
        translations: true,
        questions: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Training module not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const publishTrainingModule = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module =
      await prisma.trainingModule.findUnique({
        where: { id },
        include: {
          translations: true,
          questions: true,
        },
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Training module not found",
      });
    }

    if (module.translations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Module must have at least one translation",
      });
    }

    if (module.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Module must have at least one question",
      });
    }

    const updatedModule =
      await prisma.trainingModule.update({
        where: { id },

        data: {
          status: "PUBLISHED",
        },

        include: {
          translations: true,
          questions: {
            include: {
              translations: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Training module published successfully",
      data: updatedModule,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
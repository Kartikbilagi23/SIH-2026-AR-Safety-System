import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import type { UpdateWorkerInput } from "../schemas/worker.schema.js"


export const createWorker = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            employeeId,
            phone,
            sector,
            site,
            language,
        } = req.body;

        if (!name || !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Name and employeeId are required",
            });
        }

        const existingWorker = await prisma.worker.findUnique({
            where: {
                employeeId,
            },
        });

        if (existingWorker) {
            return res.status(409).json({
                success: false,
                message: "Worker with this employeeId already exists",
            });
        }

        const worker = await prisma.worker.create({
            data: {
                name,
                employeeId,
                phone,
                sector,
                site,
                language: language || "en",
            },
        });

        return res.status(201).json({
            success: true,
            message: "Worker created successfully",
            data: worker,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getWorkers = async (
    _req: Request,
    res: Response
) => {
    try {
        const workers = await prisma.worker.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: workers,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const getWorkerById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID"
            });
        }
        const worker = await prisma.worker.findUnique({
            where: {
                id,
            },
            include: {
                sessions: {
                    include: {
                        module: true,
                    },
                    orderBy: {
                        startedAt: "desc",
                    },
                },
                certificates: true,
            },
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: worker,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateWorker = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        const data = req.body as UpdateWorkerInput;

        const existingWorker = await prisma.worker.findUnique({
            where: { id },
        });

        if (!existingWorker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        if (data.employeeId !== undefined) {
            const duplicate = await prisma.worker.findFirst({
                where: {
                    employeeId: data.employeeId,
                    NOT: {
                        id,
                    },
                },
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Employee ID already belongs to another worker",
                });
            }
        }
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== undefined)
        );
        const worker = await prisma.worker.update({
            where: { id },
            data:updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Worker updated successfully",
            data: worker,
        });
    } catch (error: unknown) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const deleteWorker = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    const worker = await prisma.worker.findUnique({
      where: { id },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    await prisma.worker.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

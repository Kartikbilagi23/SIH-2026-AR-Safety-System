import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import {
  type StartTrainingSessionInput, type SubmitTrainingSessionInput
} from "../schemas/training-session.schema.js";
import { generateCertificateNumber } from "../utils/certificate.js";

export const startTrainingSession = async (
  req: Request,
  res: Response
) => {
  try {
    const data = req.body as StartTrainingSessionInput;

    const worker = await prisma.worker.findUnique({
      where: {
        id: data.workerId,
      },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const module = await prisma.trainingModule.findUnique({
      where: {
        id: data.moduleId,
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

    if (module.status !== "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Training module is not published",
      });
    }

    if (module.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Training module has no questions",
      });
    }
    const previousAttempts =
      await prisma.trainingSession.count({
        where: {
          workerId: data.workerId,
          moduleId: data.moduleId,
        },
      });

    const attemptNumber = previousAttempts + 1;
    const activeSession =
      await prisma.trainingSession.findFirst({
        where: {
          workerId: data.workerId,
          moduleId: data.moduleId,
          completedAt: null,
        },
      });

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: "Worker already has an active training session",
        data: {
          sessionId: activeSession.id,
          attemptNumber: activeSession.attemptNumber,
        },
      });
    }
    const session = await prisma.trainingSession.create({
      data: {
        workerId: data.workerId,
        moduleId: data.moduleId,
        attemptNumber
      },
    });

    const questions = module.questions.map((question) => ({
      id: question.id,
      translations: question.translations,
    }));

    return res.status(201).json({
      success: true,
      message: "Training session started",
      data: {
        sessionId: session.id,
        module: {
          id: module.id,
          category: module.category,
          durationMin: module.durationMin,
          translations: module.translations,
        },
        questions,
      },
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const submitTrainingSession = async (
// {
//   "answers": [
//     {
//       "questionId": "cmupt9n9t0000d8vdibe3l4rd",
//       "selectedAnswer": 2
//     }
//   ]
// } expected body
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || Array.isArray(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const data = req.body as SubmitTrainingSessionInput;

    const session = await prisma.trainingSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        module: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    if (session.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Training session is already completed",
      });
    }

    const questionMap = new Map(
      session.module.questions.map((question) => [
        question.id,
        question,
      ])
    );

    const submittedQuestionIds = new Set<string>();

    for (const answer of data.answers) {
      if (submittedQuestionIds.has(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate question submitted",
        });
      }

      submittedQuestionIds.add(answer.questionId);

      const question = questionMap.get(answer.questionId);

      if (!question) {
        return res.status(400).json({
          success: false,
          message: "Question does not belong to this module",
        });
      }
    }

    const results = data.answers.map((answer) => {
      const question = questionMap.get(answer.questionId)!;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect:
          answer.selectedAnswer === question.correctAnswer,
      };
    });

    const correctAnswers = results.filter(
      (result) => result.isCorrect
    ).length;

    const totalQuestions = session.module.questions.length;

    const score = Math.round(
      (correctAnswers / totalQuestions) * 100
    );

    const passed = score >= 70;
    let certificate = null;
    await prisma.$transaction(async (tx) => {
      await tx.assessmentAnswer.createMany({
        data: results.map((result) => ({
          sessionId,
          questionId: result.questionId,
          selectedAnswer: result.selectedAnswer,
          isCorrect: result.isCorrect,
        })),
      });

      await tx.trainingSession.update({
        where: {
          id: sessionId,
        },
        data: {
          completedAt: new Date(),
          score,
          passed,
        },
      });
      if (passed) {
        certificate = await tx.certificate.create({
          data: {
            certificateNumber:
              generateCertificateNumber(),
            workerId: session.workerId,
            moduleId: session.moduleId,
            sessionId,
          },
        });
      }
    });
    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        sessionId,
        totalQuestions,
        answeredQuestions: results.length,
        correctAnswers,
        score,
        passed,
        certificate
      },
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getTrainingSessionHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const { workerId, moduleId } = req.params;

    if (
      !workerId ||
      Array.isArray(workerId) ||
      !moduleId ||
      Array.isArray(moduleId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker or module ID",
      });
    }

    const sessions =
      await prisma.trainingSession.findMany({
        where: {
          workerId,
          moduleId,
        },
        select: {
          id: true,
          attemptNumber: true,
          score: true,
          passed: true,
          startedAt: true,
          completedAt: true,
        },
        orderBy: {
          attemptNumber: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

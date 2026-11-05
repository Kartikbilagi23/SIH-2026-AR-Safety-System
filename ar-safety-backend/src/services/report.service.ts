import { prisma } from "../config/prisma.js";

export const getReportOverview = async () => {
  const [
    totalWorkers,
    totalSessions,
    completedSessions,
    inProgressSessions,
    failedSessions,
    passedSessions,
    certificatesIssued,
    scoreAggregate,
  ] = await Promise.all([
    prisma.worker.count(),

    prisma.trainingSession.count(),

    prisma.trainingSession.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.trainingSession.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.trainingSession.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.trainingSession.count({
      where: {
        passed: true,
      },
    }),

    prisma.certificate.count(),

    prisma.trainingSession.aggregate({
      _avg: {
        score: true,
      },
      where: {
        score: {
          not: null,
        },
      },
    }),
  ]);

  const completionRate =
    totalSessions === 0
      ? 0
      : (completedSessions / totalSessions) * 100;

  const passRate =
    completedSessions === 0
      ? 0
      : (passedSessions / completedSessions) * 100;

  const averageScore = scoreAggregate._avg.score ?? 0;

  return {
    summary: {
      totalWorkers,
      totalSessions,
      completedSessions,
      inProgressSessions,
      failedSessions,
      passedSessions,
      certificatesIssued,
      completionRate: Number(completionRate.toFixed(2)),
      passRate: Number(passRate.toFixed(2)),
      averageScore: Number(averageScore.toFixed(2)),
    },
  };
};

export const getTrainingStatusReport = async () => {
  const [completed, inProgress, failed] = await Promise.all([
    prisma.trainingSession.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.trainingSession.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.trainingSession.count({
      where: {
        status: "FAILED",
      },
    }),
  ]);

  return {
    statusDistribution: [
      {
        status: "COMPLETED",
        count: completed,
      },
      {
        status: "IN_PROGRESS",
        count: inProgress,
      },
      {
        status: "FAILED",
        count: failed,
      },
    ],
  };
};

export const getModulePerformanceReport = async () => {
  const modules = await prisma.trainingModule.findMany({
    select: {
      id: true,
      category: true,

      translations: {
        where: {
          language: "EN",
        },
        select: {
          title: true,
        },
      },

      sessions: {
        select: {
          status: true,
          passed: true,
          score: true,
        },
      },
    },
  });

  const modulePerformance = modules.map((module) => {
    const sessions = module.sessions;

    const attempts = sessions.length;

    const completed = sessions.filter(
      (session) => session.status === "COMPLETED"
    ).length;

    const passed = sessions.filter(
      (session) => session.passed === true
    ).length;

    const failed = sessions.filter(
      (session) => session.status === "FAILED"
    ).length;

    const scoredSessions = sessions.filter(
      (session) => session.score !== null
    );

    const averageScore =
      scoredSessions.length === 0
        ? 0
        : scoredSessions.reduce(
            (sum, session) => sum + (session.score ?? 0),
            0
          ) / scoredSessions.length;

    return {
      moduleId: module.id,
      moduleName: module.translations[0]?.title ?? "Untitled Module",
      category: module.category,
      attempts,
      completed,
      passed,
      failed,
      averageScore: Number(averageScore.toFixed(2)),
    };
  });

  return {
    modules: modulePerformance,
  };
};
export const getTrainingTrendReport = async () => {
  const today = new Date();

  today.setHours(23, 59, 59, 999);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const sessions = await prisma.trainingSession.findMany({
    where: {
      startedAt: {
        gte: startDate,
        lte: today,
      },
    },
    select: {
      startedAt: true,
      completedAt: true,
      status: true,
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  const trend = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    const started = sessions.filter((session) => {
      const sessionDate = new Date(session.startedAt);

      return (
        sessionDate.getFullYear() === year &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      );
    }).length;

    const completed = sessions.filter((session) => {
      if (!session.completedAt) {
        return false;
      }

      const completedDate = new Date(session.completedAt);

      return (
        completedDate.getFullYear() === year &&
        completedDate.getMonth() === date.getMonth() &&
        completedDate.getDate() === date.getDate()
      );
    }).length;

    trend.push({
      date: dateKey,
      started,
      completed,
    });
  }

  return {
    trend,
  };
};

export const getRecentTrainingActivity = async () => {
  const sessions = await prisma.trainingSession.findMany({
    take: 10,
    orderBy: {
      startedAt: "desc",
    },
    select: {
      id: true,
      score: true,
      status: true,
      startedAt: true,
      completedAt: true,
      attemptNumber: true,

      worker: {
        select: {
          name: true,
          employeeId: true,
        },
      },

      module: {
        select: {
          category: true,

          translations: {
            where: {
              language: "EN",
            },
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  const activity = sessions.map((session) => ({
    sessionId: session.id,

    workerName: session.worker.name,
    employeeId: session.worker.employeeId,

    moduleName:
      session.module.translations[0]?.title ??
      "Untitled Module",

    category: session.module.category,

    score: session.score,

    status: session.status,

    attemptNumber: session.attemptNumber,

    startedAt: session.startedAt,
    completedAt: session.completedAt,
  }));

  return {
    activity,
  };
};
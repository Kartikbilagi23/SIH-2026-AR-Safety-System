import { Router } from "express";

import {
  createTrainingModule,
  getTrainingModules,
  getTrainingModuleById,
  publishTrainingModule
} from "../controllers/training-module.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createQuestion,updateQuestion,deleteQuestion } from "../controllers/question.controller.js";
import {
  createTrainingModuleSchema,
} from "../schemas/training-module.schema.js";
import { createQuestionSchema,updateQuestionSchema } from "../schemas/question.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createTrainingModuleSchema),
  createTrainingModule
);
router.post(
  "/:moduleId/questions",
  validate(createQuestionSchema),
  createQuestion
);

router.patch(
  "/questions/:id",
  validate(updateQuestionSchema),
  updateQuestion
);

router.patch(
  "/:id/publish",
  publishTrainingModule
);

router.delete(
  "/questions/:id",
  deleteQuestion
);
router.get("/", getTrainingModules);

router.get("/:id", getTrainingModuleById);

export default router;
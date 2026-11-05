import { Router } from "express";

import {
  startTrainingSession,submitTrainingSession,getTrainingSessionHistory
} from "../controllers/training-session.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  startTrainingSessionSchema,submitTrainingSessionSchema
} from "../schemas/training-session.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(startTrainingSessionSchema),
  startTrainingSession
);
router.post(
  "/:sessionId/submit",
  validate(submitTrainingSessionSchema),
  submitTrainingSession
);
router.get(
  "/worker/:workerId/module/:moduleId",
  getTrainingSessionHistory
);


export default router;
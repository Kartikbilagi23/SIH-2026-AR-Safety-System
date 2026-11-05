import { Router } from "express";

import {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
} from "../controllers/worker.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createWorkerSchema, updateWorkerSchema } from "../schemas/worker.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createWorkerSchema),
  createWorker
);

router.get("/", getWorkers);

router.get("/:id", getWorkerById);

router.patch(
  "/:id",
  validate(updateWorkerSchema),
  updateWorker
);

router.delete("/:id", deleteWorker);

export default router;


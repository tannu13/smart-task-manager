import { Router } from "express";
import {
  CreateTaskSchema,
  createTaskController,
} from "../controllers/tasks.controller.";
import { validateBody } from "../middleware/validation";

const tasksRouter = Router();

tasksRouter.post("/", validateBody(CreateTaskSchema), createTaskController);

export default tasksRouter;

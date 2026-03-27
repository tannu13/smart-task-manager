import { Router } from "express";
import {
  CreateTaskSchema,
  createTasksController,
} from "../controllers/tasks.controller.";
import { validateBody } from "../middleware/validation";

const tasksRouter = Router();

tasksRouter.post("/", validateBody(CreateTaskSchema), createTasksController);

export default tasksRouter;

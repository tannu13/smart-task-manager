import { Router } from "express";
import {
  CreateTaskSchema,
  createTaskController,
  getTasksController,
} from "../controllers/tasks.controller.";
import { validateBody } from "../middleware/validation";

const tasksRouter = Router();

tasksRouter.post("/", validateBody(CreateTaskSchema), createTaskController);
tasksRouter.get("/", getTasksController);

export default tasksRouter;

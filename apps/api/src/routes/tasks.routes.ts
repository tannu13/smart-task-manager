import { Router } from "express";
import {
  CreateTaskSchema,
  TaskIdSchema,
  createTaskController,
  deleteTaskController,
  getTasksController,
} from "../controllers/tasks.controller.";
import { validateBody, validateParams } from "../middleware/validation";

const tasksRouter = Router();

tasksRouter.post("/", validateBody(CreateTaskSchema), createTaskController);
tasksRouter.get("/", getTasksController);
tasksRouter.delete("/:id", validateParams(TaskIdSchema), deleteTaskController);

export default tasksRouter;

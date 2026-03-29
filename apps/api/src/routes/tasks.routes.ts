import { Router } from "express";
import {
  CreateTaskSchema,
  TaskIdSchema,
  createTaskController,
  deleteTaskController,
  getTasksController,
  getTasksSummaryController,
} from "../controllers/tasks.controller";
import { validateBody, validateParams } from "../middleware/validation";

const tasksRouter = Router();

tasksRouter.post("/", validateBody(CreateTaskSchema), createTaskController);
tasksRouter.get("/", getTasksController);
tasksRouter.delete("/:id", validateParams(TaskIdSchema), deleteTaskController);
tasksRouter.get("/summary", getTasksSummaryController);

export default tasksRouter;

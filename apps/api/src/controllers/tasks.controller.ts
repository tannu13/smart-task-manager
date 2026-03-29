import { Request, Response } from "express";
import z from "zod";
import {
  buildFallbackSummary,
  buildTasksSummaryPrompt,
  createTaskService,
  deleteTaskService,
  generateTaskSummaryWithAI,
  getPendingTasksService,
  getTasksService,
} from "../services/tasks.service";

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
});
export const createTaskController = async (req: Request, res: Response) => {
  const newTask = await createTaskService(req.body.title);
  return res.status(201).json({
    data: { task: newTask },
  });
};

export const getTasksController = async (req: Request, res: Response) => {
  const tasksList = await getTasksService();
  return res.status(200).json({
    data: {
      tasks: tasksList,
    },
  });
};

export const TaskIdSchema = z.object({
  id: z.uuid("Invalid task ID format"),
});
export const deleteTaskController = async (req: Request, res: Response) => {
  const taskId = req.params.id as string;
  await deleteTaskService(taskId);
  return res.sendStatus(204);
};

export const getTasksSummaryController = async (
  req: Request,
  res: Response,
) => {
  const pendingTasks = await getPendingTasksService();
  if (pendingTasks.length === 0) {
    return res.status(200).json({
      data: {
        summary: "You have no pending tasks.",
      },
    });
  }

  const prompt = buildTasksSummaryPrompt(pendingTasks);
  let summary = "";
  let isFallbackSummary = false;

  try {
    summary = await generateTaskSummaryWithAI(prompt);
  } catch (err) {
    summary = buildFallbackSummary(pendingTasks);
    isFallbackSummary = true;
  }

  return res.status(200).json({
    data: {
      summary,
    },
    meta: { source: isFallbackSummary ? "fallback" : "ai" },
  });
};

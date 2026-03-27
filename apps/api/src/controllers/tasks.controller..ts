import { Request, Response } from "express";
import z from "zod";
import { createTaskService } from "../services/tasks.service";

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
});
export const createTaskController = async (req: Request, res: Response) => {
  const newTask = await createTaskService(req.body.title);
  return res.status(201).json({
    data: { task: newTask },
  });
};

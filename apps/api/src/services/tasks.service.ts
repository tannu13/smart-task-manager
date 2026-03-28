import { desc, eq } from "drizzle-orm";
import db from "../db/connection";
import { tasks } from "../db/schema";
import { AppError } from "../utils/app-error";

export const createTaskService = async (title: string) => {
  const [newTask] = await db.insert(tasks).values({ title }).returning();
  return newTask;
};

export const getTasksService = async () => {
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
};

export const deleteTaskService = async (id: string) => {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();

  if (result.length === 0) {
    throw new AppError("Task not found", 404, "NOT_FOUND");
  }

  return result[0];
};

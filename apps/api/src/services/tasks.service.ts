import { desc } from "drizzle-orm";
import db from "../db/connection";
import { tasks } from "../db/schema";

export const createTaskService = async (title: string) => {
  const [newTask] = await db.insert(tasks).values({ title }).returning();
  return newTask;
};

export const getTasksService = async () => {
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
};

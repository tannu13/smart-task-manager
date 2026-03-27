import db from "../db/connection";
import { tasks } from "../db/schema";

export const createTaskService = async (title: string) => {
  try {
    const [newTask] = await db.insert(tasks).values({ title }).returning();
    return newTask;
  } catch (err) {
    console.error(
      "Error creating task:",
      err instanceof Error ? err.message : err,
    );
    throw new Error("unable to create task");
  }
};

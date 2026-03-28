import { desc, eq } from "drizzle-orm";
import db from "../db/connection";
import { Task, tasks } from "../db/schema";
import { AppError } from "../utils/app-error";

export const createTaskService = async (title: string) => {
  const [newTask] = await db.insert(tasks).values({ title }).returning();
  return newTask;
};

export const getTasksService = async () => {
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
};

export const getPendingTasksService = async () => {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.isCompleted, false))
    .orderBy(desc(tasks.createdAt));
};

export const buildTasksSummaryPrompt = (tasks: Task[]) => {
  const tasksList = tasks.map((t) => `- ${t.title}`).join("\n");
  return `You are a productivity assistant.

Given the following tasks:
${tasksList}

Based on these, write a short daily briefing:
- Prioritize: Identify the most impactful tasks.
- Strategy: Suggest exactly what to start with to build momentum.
- Constraint: Keep the total response under 5 sentences.
- Tone: Be clear, actionable, and encouraging.`;
};

export const generateTaskSummaryWithOpenAI = async (prompt: string) => {
  return "";
};
export const buildFallbackSummary = (tasks: Task[]): string => {
  if (tasks.length === 0) {
    return "Your task list is currently empty. Enjoy the headspace!";
  }

  const firstTask = tasks[0].title;
  const totalTasks = tasks.length;

  if (totalTasks === 1) {
    return `You have one task today: ${firstTask}. Let's get it done!`;
  }

  return (
    `You have ${totalTasks} tasks to tackle. ` +
    `Start by focusing on ${firstTask}, then move through the rest of your list. ` +
    `You've got this!`
  );
};

export const deleteTaskService = async (id: string) => {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();

  if (result.length === 0) {
    throw new AppError("Task not found", 404, "NOT_FOUND");
  }

  return result[0];
};

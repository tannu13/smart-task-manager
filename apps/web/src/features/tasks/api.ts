import { request } from "@/lib/api-client";
import type {
  CreateTaskInput,
  SummaryResponse,
  Task,
  TasksResponse,
} from "./types";

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await request<TasksResponse>("/tasks");
  return response.data.tasks;
};

export const fetchTasksSummary = async () => {
  const response = await request<SummaryResponse>("/tasks/summary");
  return {
    summary: response.data.summary,
    pendingTasksCount: response.data.pendingTasksCount,
    source: response.meta?.source,
  };
};

export const createTask = async ({ title }: CreateTaskInput) => {
  const response = await request<{ data: { task: Task } }>("/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return response.data.task;
};

export const deleteTask = async (taskId: string) => {
  await request<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
};

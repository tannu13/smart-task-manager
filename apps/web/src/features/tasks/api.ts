import { ApiClientError, type ApiErrorDetail, request } from "@/lib/api-client";
import { ZodError, type ZodType } from "zod";
import type {
  CreateTaskInput,
  CreateTaskResponse,
  Task,
  TasksResponse,
  SummaryResponse,
} from "./types";
import {
  CreateTaskInputSchema,
  CreateTaskResponseSchema,
  SummaryResponseSchema,
  TasksResponseSchema,
} from "./types";

const parseApiResponse = <T>(
  schema: ZodType<T>,
  payload: unknown,
  route: string,
): T => {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      const details: ApiErrorDetail[] = error.issues.map((issue) => ({
        field: issue.path.join(".") || "response",
        message: issue.message,
      }));

      throw new ApiClientError(
        `The API response for ${route} did not match the expected shape.`,
        500,
        "INVALID_RESPONSE",
        details,
      );
    }

    throw error;
  }
};

export const fetchTasks = async (): Promise<Task[]> => {
  const response = parseApiResponse(
    TasksResponseSchema,
    await request<TasksResponse>("/tasks"),
    "GET /tasks",
  );

  return response.data.tasks;
};

export const fetchTasksSummary = async () => {
  const response = parseApiResponse(
    SummaryResponseSchema,
    await request<SummaryResponse>("/tasks/summary"),
    "GET /tasks/summary",
  );

  return {
    summary: response.data.summary,
    pendingTasksCount: response.data.pendingTasksCount,
    source: response.meta?.source,
  };
};

export const createTask = async ({ title }: CreateTaskInput) => {
  const payload = CreateTaskInputSchema.parse({ title });
  const response = parseApiResponse(
    CreateTaskResponseSchema,
    await request<CreateTaskResponse>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "POST /tasks",
  );

  return response.data.task;
};

export const deleteTask = async (taskId: string) => {
  await request<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
};

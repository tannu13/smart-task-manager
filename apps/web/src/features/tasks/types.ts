import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.string(),
});

export const TasksResponseSchema = z.object({
  data: z.object({
    tasks: z.array(TaskSchema),
  }),
});

export const SummarySourceSchema = z.enum(["ai", "fallback"]);

export const SummaryResponseSchema = z.object({
  data: z.object({
    summary: z.string(),
    pendingTasksCount: z.number().int().nonnegative(),
  }),
  meta: z
    .object({
      source: SummarySourceSchema,
    })
    .optional(),
});

export const CreateTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const CreateTaskResponseSchema = z.object({
  data: z.object({
    task: TaskSchema,
  }),
});

export type Task = z.infer<typeof TaskSchema>;
export type TasksResponse = z.infer<typeof TasksResponseSchema>;
export type SummarySource = z.infer<typeof SummarySourceSchema>;
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type CreateTaskResponse = z.infer<typeof CreateTaskResponseSchema>;

export type TasksSummary = {
  summary: string;
  pendingTasksCount: number;
  source?: SummarySource;
};

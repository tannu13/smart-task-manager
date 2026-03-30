export type Task = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
};

export type TasksResponse = {
  data: {
    tasks: Task[];
  };
};

export type SummarySource = "ai" | "fallback";

export type SummaryResponse = {
  data: {
    summary: string;
    pendingTasksCount: number;
  };
  meta?: {
    source: SummarySource;
  };
};

export type CreateTaskInput = {
  title: string;
};

export type TasksSummary = {
  summary: string;
  pendingTasksCount: number;
  source?: SummarySource;
};

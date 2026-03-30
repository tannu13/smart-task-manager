import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, fetchTasks, fetchTasksSummary } from "./api";

export const taskQueryKeys = {
  all: ["tasks"] as const,
  summary: ["tasks", "summary"] as const,
};

export const useTasksQuery = () =>
  useQuery({
    queryKey: taskQueryKeys.all,
    queryFn: fetchTasks,
  });

export const useTasksSummaryQuery = () =>
  useQuery({
    queryKey: taskQueryKeys.summary,
    queryFn: fetchTasksSummary,
    enabled: false,
  });

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: taskQueryKeys.summary,
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: taskQueryKeys.summary,
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
  });
};

import { ApiClientError } from "@/lib/api-client";
import { useState } from "react";
import { useDeleteTaskMutation, useTasksQuery } from "../hooks";
import { formatTaskDate, getErrorMessage } from "../utils";

const loadingSkeleton = Array.from({ length: 3 }, (_, index) => index);

export const TaskList = () => {
  const tasksQuery = useTasksQuery();
  const deleteTaskMutation = useDeleteTaskMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = async (taskId: string) => {
    try {
      setPendingDeleteId(taskId);
      await deleteTaskMutation.mutateAsync(taskId);
    } catch {
      // The mutation error state is rendered below the list header.
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="rounded-[28px] border border-(--line) bg-(--surface) p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
            Task queue
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-(--ink)">
            Pending work from newest to oldest.
          </h2>
        </div>
        <span className="rounded-full border border-(--line) bg-white/80 px-3 py-2 text-sm text-(--muted)">
          {tasksQuery.data?.length ?? 0} item
          {tasksQuery.data?.length === 1 ? "" : "s"}
        </span>
      </div>

      {deleteTaskMutation.error instanceof ApiClientError ? (
        <p
          className="mt-4 rounded-2xl border border-(--danger-soft) bg-(--danger-soft) px-4 py-3 text-sm text-(--danger-strong)"
          role="alert"
        >
          {deleteTaskMutation.error.message}
        </p>
      ) : null}

      {tasksQuery.isPending ? (
        <ul className="mt-6 space-y-4" aria-label="Loading tasks">
          {loadingSkeleton.map((item) => (
            <li
              key={item}
              className="animate-pulse rounded-3xl border border-black/5 bg-white/70 p-5"
            >
              <div className="h-5 w-2/3 rounded-full bg-stone-200" />
              <div className="mt-4 h-4 w-1/3 rounded-full bg-stone-200" />
            </li>
          ))}
        </ul>
      ) : null}

      {tasksQuery.isError ? (
        <div className="mt-6 rounded-3xl border border-(--danger-soft) bg-(--danger-soft) p-5">
          <p className="text-sm font-medium text-(--danger-strong)">
            {getErrorMessage(tasksQuery.error)}
          </p>
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className="mt-4 inline-flex rounded-full bg-(--danger-strong) px-4 py-2 text-sm font-semibold text-white"
          >
            Retry tasks
          </button>
        </div>
      ) : null}

      {!tasksQuery.isPending &&
      !tasksQuery.isError &&
      tasksQuery.data.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-(--line) bg-white/70 p-6 text-center">
          <p className="text-lg font-semibold text-(--ink)">No tasks yet.</p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">
            Start with one clear task, then use Generate Briefing when you want
            an updated summary.
          </p>
        </div>
      ) : null}

      {!tasksQuery.isPending &&
      !tasksQuery.isError &&
      tasksQuery.data.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {tasksQuery.data.map((task) => {
            const isDeleting =
              pendingDeleteId === task.id && deleteTaskMutation.isPending;

            return (
              <li
                key={task.id}
                className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!task.isCompleted ? (
                        <span className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent-strong)">
                          Pending
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-800">
                          Completed
                        </span>
                      )}
                      <span className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                        {formatTaskDate(task.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-semibold leading-7 text-(--ink)">
                      {task.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void handleDelete(task.id)}
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-(--ink) transition hover:border-(--danger-strong) hover:text-(--danger-strong) disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Removing..." : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
};

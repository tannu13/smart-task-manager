import { useEffect, useRef, useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { useDeleteTaskMutation, useTasksQuery } from "../hooks";
import type { Task } from "../types";
import { formatTaskDate, getErrorMessage } from "../utils";

const loadingSkeleton = Array.from({ length: 3 }, (_, index) => index);
const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type TaskItemProps = {
  isDeleting: boolean;
  onDeleteClick: () => void;
  task: Task;
};

const TaskItem = ({ isDeleting, onDeleteClick, task }: TaskItemProps) => {
  return (
    <li className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {!task.isCompleted ? (
              <Pill variant="accent">
                Pending
              </Pill>
            ) : (
              <Pill variant="success">
                Completed
              </Pill>
            )}
            <span className="text-xs uppercase tracking-[0.18em] text-(--muted)">
              {formatTaskDate(task.createdAt)}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold leading-7 text-(--ink)">
            {task.title}
          </p>
        </div>

        <Button
          variant="dangerOutline"
          disabled={isDeleting}
          onClick={onDeleteClick}
          className="shrink-0"
        >
          {isDeleting ? "Removing..." : "Delete"}
        </Button>
      </div>
    </li>
  );
};

export const TaskList = () => {
  const tasksQuery = useTasksQuery();
  const deleteTaskMutation = useDeleteTaskMutation();
  const [taskPendingDeletion, setTaskPendingDeletion] = useState<Task | null>(
    null,
  );
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!taskPendingDeletion) {
      return;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => {
        return !element.hasAttribute("disabled");
      });

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleteTaskMutation.isPending) {
        event.preventDefault();
        setTaskPendingDeletion(null);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (!activeElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        if (event.shiftKey) {
          lastElement?.focus();
        } else {
          firstElement?.focus();
        }
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus();
    };
  }, [deleteTaskMutation.isPending, taskPendingDeletion]);

  const handleDelete = async () => {
    if (!taskPendingDeletion) {
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync(taskPendingDeletion.id);
      setTaskPendingDeletion(null);
    } catch {
      // The mutation error state is rendered below the list header.
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
        <Pill
          variant="neutral"
          className="px-3 py-2 text-sm normal-case tracking-normal font-normal"
        >
          {tasksQuery.data?.length ?? 0} item
          {tasksQuery.data?.length === 1 ? "" : "s"}
        </Pill>
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
          <Button
            variant="danger"
            onClick={() => tasksQuery.refetch()}
            className="mt-4"
          >
            Retry tasks
          </Button>
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
              deleteTaskMutation.isPending &&
              deleteTaskMutation.variables === task.id;

            return (
              <TaskItem
                key={task.id}
                task={task}
                isDeleting={isDeleting}
                onDeleteClick={() => setTaskPendingDeletion(task)}
              />
            );
          })}
        </ul>
      ) : null}

      {taskPendingDeletion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            aria-describedby="delete-task-description"
            className="w-full max-w-md rounded-3xl border border-black/10 bg-(--surface) p-6 shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
              Confirm deletion
            </p>
            <h3
              id="delete-task-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-(--ink)"
            >
              Delete this task?
            </h3>
            <p
              id="delete-task-description"
              className="mt-3 text-sm leading-7 text-(--muted)"
            >
              This will permanently remove{" "}
              <span className="font-semibold text-(--ink)">
                {taskPendingDeletion.title}
              </span>{" "}
              from the list.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setTaskPendingDeletion(null)}
                disabled={deleteTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => void handleDelete()}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? "Removing..." : "Delete task"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

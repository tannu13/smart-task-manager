import { useMemo, useState, type FormEvent } from "react";
import { ApiClientError } from "@/lib/api-client";
import { useCreateTaskMutation } from "../hooks";

const TITLE_MAX_LENGTH = 255;

export const CreateTaskForm = () => {
  const createTaskMutation = useCreateTaskMutation();
  const [title, setTitle] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const trimmedLength = title.trim().length;

  const serverFieldError = useMemo(() => {
    if (!(createTaskMutation.error instanceof ApiClientError)) {
      return null;
    }

    return (
      createTaskMutation.error.details?.find(
        (detail) => detail.field === "title",
      )?.message || null
    );
  }, [createTaskMutation.error]);

  const statusMessage = clientError || serverFieldError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle) {
      setClientError("Task title cannot be empty.");
      return;
    }

    setClientError(null);

    try {
      await createTaskMutation.mutateAsync({ title: nextTitle });
      setTitle("");
    } catch {
      // The mutation error state is rendered inline.
    }
  };

  return (
    <form
      className="rounded-[28px] border border-(--line) bg-(--surface) p-6"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
            Create task
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-(--ink)">
            Capture the next thing that matters.
          </h2>
        </div>
        <p className="text-sm text-(--muted)">
          {trimmedLength}/{TITLE_MAX_LENGTH}
        </p>
      </div>

      <label
        className="mt-5 block text-sm font-medium text-(--ink)"
        htmlFor="task-title"
      >
        Task title
      </label>
      <input
        id="task-title"
        name="title"
        type="text"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Ship the frontend task board"
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-(--ink) outline-none transition focus:border-(--accent-strong) focus:ring-4 focus:ring-(--accent-soft)"
        aria-invalid={Boolean(statusMessage)}
        aria-describedby={
          statusMessage ? "task-title-error" : "task-title-help"
        }
        onChange={(event) => {
          setTitle(event.target.value);
          if (clientError) {
            setClientError(null);
          }
        }}
      />
      <p id="task-title-help" className="mt-2 text-sm text-(--muted)">
        Titles are trimmed and validated against the backend contract before the
        request is sent.
      </p>

      {statusMessage ? (
        <p
          id="task-title-error"
          className="mt-3 rounded-2xl border border-(--danger-soft) bg-(--danger-soft) px-4 py-3 text-sm text-(--danger-strong)"
          role="alert"
        >
          {statusMessage}
        </p>
      ) : null}

      {createTaskMutation.error instanceof ApiClientError &&
      !serverFieldError ? (
        <p
          className="mt-3 rounded-2xl border border-(--danger-soft) bg-(--danger-soft) px-4 py-3 text-sm text-(--danger-strong)"
          role="alert"
        >
          {createTaskMutation.error.message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-(--muted) basis-6/12">
          The task list updates immediately. Generate the briefing only when you
          want a fresh summary.
        </p>
        <button
          type="submit"
          disabled={createTaskMutation.isPending}
          className="inline-flex items-center justify-center rounded-full bg-(--ink) px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 basis-4/12"
        >
          {createTaskMutation.isPending ? "Adding task..." : "Add task"}
        </button>
      </div>
    </form>
  );
};

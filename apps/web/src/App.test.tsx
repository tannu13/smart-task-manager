import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { createAppQueryClient } from "@/lib/query-client";
import { server } from "@/test/server";
import type { Task } from "./features/tasks/types";

const API_URL = "http://localhost:4000";

const createTaskFixture = (overrides?: Partial<Task>): Task => ({
  id: crypto.randomUUID(),
  title: "Finish frontend integration",
  isCompleted: false,
  createdAt: "2026-03-29T08:00:00.000Z",
  ...overrides,
});

const renderApp = () => {
  const queryClient = createAppQueryClient({
    queriesRetry: false,
    mutationsRetry: false,
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

const useTaskApiHandlers = (tasks: Task[]) => {
  server.use(
    http.get(`${API_URL}/tasks`, () =>
      HttpResponse.json({
        data: {
          tasks,
        },
      }),
    ),
    http.get(`${API_URL}/tasks/summary`, () => {
      const summary =
        tasks.length === 0
          ? "You have no pending tasks."
          : `Focus on ${tasks[0].title} first, then move through the rest.`;

      return HttpResponse.json({
        data: {
          summary,
          pendingTasksCount: tasks.length,
        },
        ...(tasks.length > 0 ? { meta: { source: "ai" } } : {}),
      });
    }),
    http.post(`${API_URL}/tasks`, async ({ request }) => {
      const body = (await request.json()) as { title?: string };
      const title = body.title?.trim() || "";

      if (!title) {
        return HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              details: [{ field: "title", message: "Task title is required" }],
            },
          },
          { status: 400 },
        );
      }

      const nextTask = createTaskFixture({
        title,
        createdAt: "2026-03-29T09:15:00.000Z",
      });

      tasks.unshift(nextTask);

      return HttpResponse.json(
        {
          data: {
            task: nextTask,
          },
        },
        { status: 201 },
      );
    }),
    http.delete(`${API_URL}/tasks/:id`, ({ params }) => {
      const taskIndex = tasks.findIndex((task) => task.id === params.id);

      if (taskIndex === -1) {
        return HttpResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Task not found",
            },
          },
          { status: 404 },
        );
      }

      tasks.splice(taskIndex, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  );
};

describe("App", () => {
  it("waits for an explicit click before generating the briefing", async () => {
    const tasks = [
      createTaskFixture({
        id: "11111111-1111-4111-8111-111111111111",
        title: "Finish frontend integration",
      }),
      createTaskFixture({
        id: "22222222-2222-4222-8222-222222222222",
        title: "Review backend summary route",
        createdAt: "2026-03-29T07:00:00.000Z",
      }),
    ];

    useTaskApiHandlers(tasks);
    renderApp();

    expect(
      await screen.findByRole("heading", {
        name: /pending work from newest to oldest/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Finish frontend integration"),
    ).toBeVisible();
    expect(screen.getByText(/no briefing generated yet/i)).toBeVisible();
    expect(
      screen.queryByText(/focus on finish frontend integration first/i),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /generate briefing/i }),
    );

    expect(
      await screen.findByText(/focus on finish frontend integration first/i),
    ).toBeVisible();
    expect(screen.getByText(/ai powered/i)).toBeVisible();
  });

  it("creates a task without auto-generating the briefing", async () => {
    const tasks = [
      createTaskFixture({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Initial task",
      }),
    ];

    useTaskApiHandlers(tasks);
    renderApp();

    const input = await screen.findByLabelText(/task title/i);
    await userEvent.type(input, "Ship the apps/web UI");
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(await screen.findByText("Ship the apps/web UI")).toBeVisible();
    expect(screen.getByText(/no briefing generated yet/i)).toBeVisible();
  });

  it("deletes a task without auto-generating the briefing", async () => {
    const tasks = [
      createTaskFixture({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Finish frontend integration",
      }),
      createTaskFixture({
        id: "55555555-5555-4555-8555-555555555555",
        title: "Review backend summary route",
        createdAt: "2026-03-29T07:00:00.000Z",
      }),
    ];

    useTaskApiHandlers(tasks);
    renderApp();

    expect(
      await screen.findByText("Finish frontend integration"),
    ).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("button", { name: /delete/i })[0],
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Finish frontend integration"),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no briefing generated yet/i)).toBeVisible();
  });

  it("blocks blank task submission on the client", async () => {
    const tasks: Task[] = [];

    useTaskApiHandlers(tasks);
    renderApp();

    await screen.findByRole("heading", {
      name: /pending work from newest to oldest/i,
    });

    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(
      await screen.findByText(/task title cannot be empty/i),
    ).toBeVisible();
  });

  it("shows a graceful API error when briefing generation fails", async () => {
    const tasks = [
      createTaskFixture({
        id: "66666666-6666-4666-8666-666666666666",
        title: "Finish frontend integration",
      }),
    ];

    useTaskApiHandlers(tasks);
    server.use(
      http.get(`${API_URL}/tasks/summary`, () =>
        HttpResponse.json(
          {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            },
          },
          { status: 500 },
        ),
      ),
    );

    renderApp();

    await screen.findByText("Finish frontend integration");
    await userEvent.click(
      screen.getByRole("button", { name: /generate briefing/i }),
    );

    expect(await screen.findByText(/something went wrong/i)).toBeVisible();
  });

  it("shows a graceful error when the tasks response shape is invalid", async () => {
    server.use(
      http.get(`${API_URL}/tasks`, () =>
        HttpResponse.json({
          data: {
            tasks: [{ id: "not-a-uuid", title: 123 }],
          },
        }),
      ),
    );

    renderApp();

    expect(
      await screen.findByText(
        /did not match the expected shape|something unexpected happened/i,
      ),
    ).toBeVisible();
  });
});

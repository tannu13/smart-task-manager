import { SummaryPanel } from "@/features/tasks/components/SummaryPanel";
import { TaskWorkspace } from "@/features/tasks/components/TaskWorkspace";

function App() {
  return (
    <div className="min-h-screen bg-(--canvas) text-(--ink)">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-4xl border border-black/10 bg-(--panel) shadow-(--shadow) backdrop-blur">
          <header className="relative isolate overflow-hidden border-b border-black/10 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(180,83,9,0.14),transparent_32%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-(--line) bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
                  Smart Task Manager
                </span>
                <h1 className="mt-4 max-w-3xl font-['Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Georgia,serif] text-4xl leading-none tracking-[-0.04em] text-(--ink) sm:text-5xl lg:text-6xl">
                  Stay on the task. Let the briefing keep up.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
                  Create tasks, remove them when they are no longer needed, and
                  generate a concise daily briefing from the current pending
                  list.
                </p>
              </div>

              <div className="rounded-[28px] border border-(--line) bg-(--surface)/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
                  Current API surface
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-(--ink)">
                  <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                    <span>Create task</span>
                    <span className="rounded-full bg-(--accent-soft) px-2 py-1 text-xs font-medium text-(--accent-strong)">
                      POST /tasks
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                    <span>List tasks</span>
                    <span className="rounded-full bg-(--accent-soft) px-2 py-1 text-xs font-medium text-(--accent-strong)">
                      GET /tasks
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                    <span>Delete task</span>
                    <span className="rounded-full bg-(--accent-soft) px-2 py-1 text-xs font-medium text-(--accent-strong)">
                      DELETE /tasks/:id
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                    <span>Daily briefing</span>
                    <span className="rounded-full bg-(--accent-soft) px-2 py-1 text-xs font-medium text-(--accent-strong)">
                      GET /tasks/summary
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          <main className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.18fr_0.82fr]">
            <TaskWorkspace />
            <SummaryPanel />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

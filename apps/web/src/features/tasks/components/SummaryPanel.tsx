import { useTasksSummaryQuery } from "../hooks";
import { getErrorMessage } from "../utils";

export const SummaryPanel = () => {
  const summaryQuery = useTasksSummaryQuery();
  const hasSummary = Boolean(summaryQuery.data);
  const isGenerating = summaryQuery.isFetching;

  const sourceLabel = !hasSummary
    ? "On demand"
    : summaryQuery.data?.source === "fallback"
      ? "Fallback summary"
      : summaryQuery.data?.source === "ai"
        ? "AI powered"
        : "Current status";

  return (
    <aside className="rounded-[28px] border border-(--line) bg-(--surface) p-6">
      <div className="rounded-[28px] bg-[linear-gradient(160deg,rgba(15,118,110,0.1),rgba(255,255,255,0.95)_40%,rgba(180,83,9,0.08))] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">
              Daily briefing
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-(--ink)">
              A concise read on the current queue.
            </h2>
          </div>

          <span className="rounded-full border border-(--line) bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
            {sourceLabel}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void summaryQuery.refetch()}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-full bg-(--ink) px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating
              ? "Generating briefing..."
              : hasSummary
                ? "Generate again"
                : "Generate Briefing"}
          </button>
        </div>

        {isGenerating && !hasSummary ? (
          <div className="mt-6 animate-pulse space-y-4">
            <div className="h-4 w-3/5 rounded-full bg-stone-200" />
            <div className="h-4 w-full rounded-full bg-stone-200" />
            <div className="h-4 w-11/12 rounded-full bg-stone-200" />
          </div>
        ) : null}

        {summaryQuery.isError ? (
          <div className="mt-6 rounded-3xl border border-(--danger-soft) bg-(--danger-soft) p-5">
            <p className="text-sm font-medium text-(--danger-strong)">
              {getErrorMessage(summaryQuery.error)}
            </p>
          </div>
        ) : null}

        {!hasSummary && !isGenerating && !summaryQuery.isError ? (
          <div className="mt-6 rounded-3xl border border-dashed border-(--line) bg-white/70 p-5">
            <p className="text-sm font-medium text-(--ink)">
              No briefing generated yet.
            </p>
            <p className="mt-2 text-sm leading-7 text-(--muted)">
              Build or trim the task list first, then generate a briefing when
              you are ready for a fresh read of the queue.
            </p>
          </div>
        ) : null}

        {hasSummary ? (
          <>
            <p className="mt-6 text-lg leading-8 text-(--ink)">
              {summaryQuery.data?.summary}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
                  Pending tasks
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-(--ink)">
                  {summaryQuery.data?.pendingTasksCount}
                </p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
                  Request mode
                </p>
                <p className="mt-2 text-base font-semibold text-(--ink)">
                  Manual generation only
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
};

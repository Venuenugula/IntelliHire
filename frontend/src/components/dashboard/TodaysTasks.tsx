import type { TaskItem } from "@/lib/dashboardInsights";
import Link from "next/link";

export function TodaysTasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="rc-surface rc-animate-in">
      <h2 className="rc-title text-base">Today&apos;s Hiring Tasks</h2>
      <ul className="rc-stagger mt-5 space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm ${
                task.tone === "primary"
                  ? "border-[#6d5df6]/20 bg-[#f5f3ff] text-[#6d5df6]"
                  : task.tone === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-[var(--rc-border)] bg-surface-subtle text-[var(--rc-text)]"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  task.tone === "primary" ? "bg-[#6d5df6]" : task.tone === "warning" ? "bg-amber-500" : "bg-slate-300"
                }`}
                aria-hidden
              />
              {task.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

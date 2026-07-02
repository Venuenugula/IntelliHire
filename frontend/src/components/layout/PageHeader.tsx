import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  search?: boolean;
  greeting?: string;
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function PageHeader({ title, subtitle, badge, action, search, greeting }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {greeting && (
          <>
            <p className="text-sm text-gray-500">{timeGreeting()}</p>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
          </>
        )}
        {!greeting && (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle variant="icon" />
        {search && (
          <div className="relative hidden sm:block">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search candidates, roles..."
              className="field w-64 py-2 pl-9 pr-4 text-sm"
            />
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

export function JobTabs({ jobId, active }: { jobId: string; active: "dna" | "candidates" | "rankings" }) {
  const tabs = [
    { key: "dna" as const, label: "Role DNA", href: `/jobs/${jobId}` },
    { key: "candidates" as const, label: "Candidates", href: `/jobs/${jobId}/candidates` },
    { key: "rankings" as const, label: "Rankings", href: `/jobs/${jobId}/rankings` },
  ];

  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`tab ${active === tab.key ? "tab-active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

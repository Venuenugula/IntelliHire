// Shared presentation for evidence sources — icon + display label. Kept in one
// place so every surface that renders a source (brief summary, evidence section,
// candidate cards) stays visually consistent.

export const SOURCE_ICON: Record<string, string> = {
  github: "🐙",
  leetcode: "🧩",
  linkedin: "💼",
  portfolio: "🌐",
  resume: "📄",
};

export const SOURCE_LABEL: Record<string, string> = {
  github: "GitHub",
  leetcode: "LeetCode",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  resume: "Résumé",
};

export function sourceIcon(source: string): string {
  return SOURCE_ICON[source] ?? "•";
}

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

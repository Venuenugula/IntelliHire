// Small shared bullet list with a coloured marker. Consumed by the reasoning
// drawer and the decision card so their reason/reservation lists stay identical.

export function BulletList({ items, tone }: { items: string[]; tone: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-white/80">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

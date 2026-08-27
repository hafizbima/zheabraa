export default function EmptyState({ title, sub, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-carbon/30 bg-paper/70 p-8 text-center dark:border-white/20 dark:bg-slate-900/70">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-carbon bg-sunburst/40 dark:border-white/20 dark:bg-white/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-carbon/60 dark:text-white/70">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-carbon dark:text-white">{title}</p>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
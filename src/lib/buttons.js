export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 select-none'

export const btn = {
  primary:
    btnBase +
    ' min-h-[44px] border-transparent bg-slate-900 px-4 py-2.5 text-white shadow-tactile-sm hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500',
  danger:
    btnBase +
    ' min-h-[44px] border-transparent bg-rose-600 px-4 py-2.5 text-white shadow-tactile-sm hover:bg-rose-700',
  neutral:
    btnBase +
    ' min-h-[44px] border-slate-200/80 bg-white px-4 py-2.5 text-slate-800 shadow-tactile-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:
    btnBase +
    ' border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-tactile-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700',
  subtle:
    btnBase +
    ' border-transparent bg-transparent px-2.5 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50/60 dark:text-teal-400 dark:hover:bg-teal-950/30',
  subtleDanger:
    btnBase +
    ' border-transparent bg-transparent px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/60 dark:text-rose-400 dark:hover:bg-rose-950/30',
  nav:
    btnBase +
    ' border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

export const btnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-400/20 disabled:cursor-not-allowed disabled:opacity-50'

export const btn = {
  primary: btnBase + ' border-transparent bg-slate-900 px-4 py-2 text-white shadow-tactile-sm hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500',
  danger: btnBase + ' border-transparent bg-rose-500 px-4 py-2 text-white shadow-tactile-sm hover:bg-rose-600',
  neutral: btnBase + ' border-slate-200/80 bg-white px-4 py-2 text-slate-800 shadow-tactile-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost: btnBase + ' border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-tactile-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700',
  subtle: btnBase + ' border-transparent bg-transparent px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300',
  subtleDanger: btnBase + ' border-transparent bg-transparent px-2 py-1 text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400',
  nav: btnBase + ' border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
}
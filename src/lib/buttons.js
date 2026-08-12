export const btnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

export const btn = {
  primary: btnBase + ' bg-brand-600 px-4 py-2 text-sm text-white shadow-sm shadow-brand-600/40 hover:bg-brand-700 hover:shadow-md',
  danger: btnBase + ' bg-red-500 px-4 py-2 text-sm text-white shadow-sm shadow-red-500/30 hover:bg-red-600 hover:shadow-md',
  ghost: btnBase + ' border border-brand-200 bg-white px-3 py-1.5 text-xs text-brand-700 hover:border-brand-300 hover:bg-brand-50 dark:border-brand-500/40 dark:bg-transparent dark:text-brand-300 dark:hover:bg-brand-500/10',
  neutral: btnBase + ' border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800',
  subtle: btnBase + ' px-2 py-1 text-xs text-brand-600 hover:bg-brand-100 dark:hover:bg-slate-800',
  subtleDanger: btnBase + ' px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10',
  nav: btnBase + ' rounded-full px-3 py-1.5 text-sm text-brand-100 hover:bg-white/10',
}

export const btnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-colors duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50'

export const btn = {
  primary: btnBase + ' border-black bg-carbon px-5 py-2 text-sm text-white hover:bg-[#1a1a1a] dark:border-white/30 dark:bg-white dark:text-carbon dark:hover:bg-white/90',
  danger: btnBase + ' border-black bg-ember px-4 py-2 text-sm text-white hover:bg-[#e64b7e]',
  neutral: btnBase + ' border-black bg-paper px-4 py-2 text-sm text-carbon hover:bg-mist dark:border-white/30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
  ghost: btnBase + ' border-black bg-paper px-3 py-1.5 text-xs text-carbon hover:bg-mist dark:border-white/30 dark:bg-slate-800 dark:text-white',
  subtle: btnBase + ' border-transparent bg-transparent px-2 py-1 text-xs text-carbon underline-offset-2 hover:underline dark:text-white',
  subtleDanger: btnBase + ' border-transparent bg-transparent px-2 py-1 text-xs text-ember underline-offset-2 hover:underline',
  nav: btnBase + ' border-black bg-paper px-3 py-1.5 text-sm text-carbon hover:bg-mist dark:border-white/30 dark:bg-slate-800 dark:text-white',
}
import { useEffect } from 'react'

export default function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="modal-backdrop absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity dark:bg-black/65"
        onClick={onClose}
      />
      <div
        className={`modal-panel relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-slate-200/90 bg-white shadow-tactile-modal transition-[transform,opacity] duration-200 ease-out-expo sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900 ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        {/* Mobile bottom sheet grab handle */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 dark:border-slate-800/80">
          <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label="Tutup"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">{children}</div>
        {footer && (
          <div className="border-t border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 dark:border-slate-800/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-3xl border-2 border-carbon bg-paper sm:rounded-3xl dark:border-white/30 dark:bg-slate-900 ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-carbon px-5 py-4 dark:border-white/20">
          <h2 className="text-lg font-bold text-carbon dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-carbon text-carbon transition hover:bg-mist active:scale-95 dark:border-white/40 dark:text-white dark:hover:bg-slate-800"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t-2 border-carbon px-5 py-4 dark:border-white/20">{footer}</div>
        )}
      </div>
    </div>
  )
}

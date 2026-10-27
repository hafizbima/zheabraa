import { useState, useEffect } from 'react'

const STORAGE_KEY = 'gmm:ios-install-dismissed'

export function isIosDevice() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator?.userAgent || ''
  const isApple = /iPad|iPhone|iPod/.test(ua)
  const isIpadOS = window.navigator?.platform === 'MacIntel' && (window.navigator?.maxTouchPoints ?? 0) > 1
  return Boolean(isApple || isIpadOS)
}

export function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.navigator?.standalone ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
  )
}

export default function IosInstallPrompt({ open, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Jika dipanggil via prop open (manual dari menu gear)
    if (open !== undefined) {
      setVisible(open)
      return
    }

    // Auto-detect untuk perangkat iOS yang belum standalone dan belum pernah tutup banner
    const isIos = isIosDevice()
    const isStandalone = isStandaloneMode()
    const dismissed = localStorage.getItem(STORAGE_KEY) === '1'

    if (isIos && !isStandalone && !dismissed) {
      // Tunda 2 detik agar tidak kaget saat halaman pertama kali termuat
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [open])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch (_) {}
    if (onClose) onClose()
  }

  if (!visible) return null

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-tactile-sm dark:border-slate-700">
              <img src="/logo.png" alt="Zheabraa" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Pasang di Layar Utama (iOS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan seperti aplikasi native tanpa App Store
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup panduan"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              1
            </span>
            <span>
              Ketuk tombol <strong>Bagikan</strong>{' '}
              <span className="inline-flex items-center justify-center rounded bg-slate-200 px-1 py-0.5 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>{' '}
              di bilah menu Safari.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              2
            </span>
            <span>
              Gulir lalu pilih <strong>Tambah ke Layar Utama</strong> (<em>Add to Home Screen</em>).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              3
            </span>
            <span>
              Ketuk <strong>Tambah</strong> di pojok kanan atas. Selesai!
            </span>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={dismiss}
            className="w-full rounded-xl bg-slate-900 py-2 text-center text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}


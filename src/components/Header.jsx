import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useTheme } from '../theme.js'
import { btn } from '../lib/buttons.js'
import { addMonths, labelOf } from '../lib/dates.js'
import Confirm from './Confirm.jsx'

export default function Header({ view, onViewChange, onOpenWallets }) {
  const { user, logout, currentMonthId, switchMonth, startNewMonth, months } = useStore()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)

  const monthIds = Object.keys(months).sort().reverse()

  const pill =
    'rounded-full border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.97]'

  const navTab = (key, label) => (
    <button
      onClick={() => onViewChange(key)}
      className={`${pill} border-carbon px-4 py-1.5 text-sm font-semibold dark:border-white/50 ${
        view === key
          ? 'bg-carbon text-white dark:bg-white dark:text-carbon'
          : 'bg-paper text-carbon hover:bg-mist dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-30 border-b-2 border-carbon bg-paper dark:border-white/30 dark:bg-slate-950">
      <div className="bg-carbon text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:bg-black">
        Zheabraa • Pocket Budgeting • Catat Uangmu
      </div>
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-carbon bg-paper dark:border-white/50">
              <img src="/logo.png" alt="" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-carbon dark:text-white">Zheabraa</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => switchMonth(addMonths(currentMonthId, -1))}
              className={`${pill} flex h-8 w-8 items-center justify-center border-carbon bg-paper text-carbon hover:bg-mist dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
              aria-label="Bulan sebelumnya"
            >
              ‹
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
              className={`${pill} flex items-center gap-1 border-carbon bg-paper px-3 py-1.5 text-sm font-semibold text-carbon hover:bg-mist dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
            >
              {labelOf(currentMonthId)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => switchMonth(addMonths(currentMonthId, 1))}
              className={`${pill} flex h-8 w-8 items-center justify-center border-carbon bg-paper text-carbon hover:bg-mist dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
              aria-label="Bulan berikutnya"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          <div className="flex items-center gap-2">
            {navTab('dashboard', 'Dashboard')}
            {navTab('history', 'Riwayat')}
            {navTab('stats', 'Statistik')}
          </div>
          <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`${pill} flex h-8 items-center gap-1.5 border-carbon bg-paper px-3 py-1.5 text-sm font-medium text-carbon hover:bg-mist dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
            aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </button>
          <button onClick={onOpenWallets} className="rounded-full border border-carbon bg-paper px-3 py-1.5 text-sm font-semibold text-carbon transition hover:bg-mist active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
            Dompet
          </button>
          <button onClick={logout} className={btn.nav} title={`Keluar (${user?.displayName || user?.email})`}>
            Keluar
          </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-3 top-16 z-50 w-64 overflow-hidden rounded-2xl border-2 border-carbon bg-paper dark:border-white/30 dark:bg-slate-900">
            <p className="border-b-2 border-carbon px-4 py-2 text-xs font-bold uppercase tracking-wide text-carbon dark:border-white/20 dark:text-white">
              Pilih bulan
            </p>
            <div className="max-h-64 overflow-y-auto">
              {monthIds.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Belum ada bulan tersimpan.</p>
              )}
              {monthIds.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    switchMonth(m)
                    setMenuOpen(false)
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-mist dark:hover:bg-slate-800 ${
                    m === currentMonthId ? 'font-semibold text-carbon dark:text-white' : 'text-carbon/70 dark:text-white/70'
                  }`}
                >
                  {labelOf(m)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setMenuOpen(false)
                setConfirmNew(true)
              }}
              className="block w-full border-t-2 border-carbon px-4 py-3 text-left text-sm font-medium text-carbon hover:bg-mist dark:border-white/20 dark:text-white dark:hover:bg-slate-800"
            >
              ➕ Mulai Bulan Baru
            </button>
          </div>
        </>
      )}

      {confirmNew && (
        <Confirm
          title="Mulai Bulan Baru"
          message={`Buat ${labelOf(addMonths(currentMonthId, 1))} dengan carry-over otomatis dari sisa bulan ini? Kategori akan disalin dengan budget 0.`}
          confirmText="Buat"
          danger={false}
          onCancel={() => setConfirmNew(false)}
          onConfirm={() => {
            startNewMonth()
            setConfirmNew(false)
          }}
        />
      )}
    </header>
  )
}
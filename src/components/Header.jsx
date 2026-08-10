import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { addMonths, labelOf } from '../lib/dates.js'
import Confirm from './Confirm.jsx'

export default function Header({ view, onViewChange, onOpenWallets }) {
  const { user, logout, currentMonthId, switchMonth, startNewMonth, months } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)

  const monthIds = Object.keys(months).sort().reverse()

  const navTab = (key, label) => (
    <button
      onClick={() => onViewChange(key)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        view === key ? 'bg-white text-brand-700' : 'text-brand-100 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-30 bg-brand-700 text-white shadow-lg">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <span className="font-bold tracking-tight">Zheabraa</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => switchMonth(addMonths(currentMonthId, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-brand-100 hover:bg-white/10"
              aria-label="Bulan sebelumnya"
            >
              ‹
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
            >
              {labelOf(currentMonthId)}
              <span className="text-xs">▾</span>
            </button>
            <button
              onClick={() => switchMonth(addMonths(currentMonthId, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-brand-100 hover:bg-white/10"
              aria-label="Bulan berikutnya"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-2">
          {navTab('dashboard', 'Dashboard')}
          {navTab('history', 'Riwayat')}
          <div className="flex-1" />
          <button
            onClick={onOpenWallets}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-100 hover:bg-white/10"
          >
            Dompet
          </button>
          <button
            onClick={logout}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-100 hover:bg-white/10"
            title={`Keluar (${user?.displayName || user?.email})`}
          >
            Keluar
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-3 top-14 z-50 w-64 overflow-hidden rounded-xl bg-white shadow-xl">
            <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pilih bulan
            </p>
            <div className="max-h-64 overflow-y-auto">
              {monthIds.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-500">Belum ada bulan tersimpan.</p>
              )}
              {monthIds.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    switchMonth(m)
                    setMenuOpen(false)
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 ${
                    m === currentMonthId ? 'font-semibold text-brand-700' : 'text-slate-700'
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
              className="block w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-brand-700 hover:bg-brand-50"
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

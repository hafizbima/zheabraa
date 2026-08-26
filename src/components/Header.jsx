import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useStore } from '../store/StoreContext.jsx'
import { useTheme } from '../theme.js'
import { addMonths, labelOf } from '../lib/dates.js'
import Confirm from './Confirm.jsx'

export default function Header({ view, onViewChange, onOpenWallets }) {
  const { logout, currentMonthId, switchMonth, startNewMonth, months } = useStore()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const monthIds = Object.keys(months).sort().reverse()

  // auto-hide on scroll down, show on scroll up
  useEffect(() => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y <= 10) setHidden(false)
        else if (y > lastY.current + 8) setHidden(true)
        else if (y < lastY.current - 8) setHidden(false)
        lastY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen || gearOpen) setHidden(false)
  }, [menuOpen, gearOpen])

  const onToggleTheme = (e) => {
    if (
      !document.startViewTransition ||
      (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      toggleTheme()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(() => flushSync(toggleTheme)).ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 400, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        )
      })
      .catch(() => {})
  }

  const isDark = theme === 'dark'
  const gridBtn = (key, label, icon) => {
    const active = view === key
    return (
      <button
        key={key}
        onClick={() => onViewChange(key)}
        className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d9a441]/40 ${
          active
            ? isDark
              ? 'bg-[#f5f2e8] text-[#0f1b3d]'
              : 'bg-carbon text-white'
            : isDark
              ? 'bg-[#16234a] text-[#8f9ac2] hover:bg-[#1e2f5a] hover:text-[#f5f2e8]'
              : 'bg-mist text-carbon hover:bg-white hover:text-carbon border border-carbon/20'
        }`}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <header
      className={`sticky top-0 z-30 border-b will-change-transform transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${isDark ? 'border-[#24305a] bg-[#0f1b3d]' : 'border-carbon bg-paper'}`}
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* Header row — logo kiri, toggle + gear kanan (30x30 transparan) */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
              <img src="/logo.png" alt="" className="h-full w-full object-cover" />
            </div>
            <span className={`font-display text-lg font-bold tracking-tight ${isDark ? 'text-[#f5f2e8]' : 'text-carbon'}`}>Zheabraa</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-full bg-transparent transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 ${isDark ? 'text-[#f5f2e8] hover:bg-white/10' : 'text-carbon hover:bg-black/5'}`}
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
            </button>
            <div className="relative">
              <button
                onClick={() => setGearOpen((v) => !v)}
                aria-label="Pengaturan"
                aria-expanded={gearOpen}
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-full bg-transparent transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 ${isDark ? 'text-[#f5f2e8] hover:bg-white/10' : 'text-carbon hover:bg-black/5'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
                </svg>
              </button>
              {gearOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGearOpen(false)} />
                  <div className={`absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border shadow-lg ${isDark ? 'border-[#24305a] bg-[#16234a]' : 'border-carbon bg-paper'}`}>
                    <button
                      onClick={() => {
                        setGearOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 bg-[#dc2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] active:scale-[0.98]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Month selector — baris terpisah, rata tengah */}
        <div className={`flex items-center justify-center gap-2 border-y py-2 ${isDark ? 'border-[#24305a]' : 'border-carbon/20'}`}>
          <button
            onClick={() => switchMonth(addMonths(currentMonthId, -1))}
            aria-label="Bulan sebelumnya"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-95 ${isDark ? 'text-[#8f9ac2] hover:bg-white/10 hover:text-[#f5f2e8]' : 'text-carbon/60 hover:bg-black/5 hover:text-carbon'}`}
          >
            ‹
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 ${isDark ? 'text-[#f5f2e8] hover:text-[#d9a441]' : 'text-carbon hover:text-carbon/70'}`}
          >
            {labelOf(currentMonthId)}
          </button>
          <button
            onClick={() => switchMonth(addMonths(currentMonthId, 1))}
            aria-label="Bulan berikutnya"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-95 ${isDark ? 'text-[#8f9ac2] hover:bg-white/10 hover:text-[#f5f2e8]' : 'text-carbon/60 hover:bg-black/5 hover:text-carbon'}`}
          >
            ›
          </button>
        </div>

        {/* Grid navigasi 2x2 — 4 tombol seragam */}
        <div className="grid grid-cols-2 gap-2 py-3">
          {gridBtn(
            'dashboard',
            'Dashboard',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
          {gridBtn(
            'history',
            'Riwayat',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          )}
          {gridBtn(
            'stats',
            'Statistik',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          )}
          <button
            onClick={onOpenWallets}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 ${isDark ? 'bg-[#16234a] text-[#8f9ac2] hover:bg-[#1e2f5a] hover:text-[#f5f2e8]' : 'bg-mist text-carbon hover:bg-white border border-carbon/20'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M3 7l2-3h14l2 3" />
              <path d="M16 12h2" />
            </svg>
            Dompet
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className={`absolute left-1/2 top-[108px] z-50 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border shadow-lg ${isDark ? 'border-[#24305a] bg-[#16234a]' : 'border-carbon bg-paper'}`}>
            <p className={`border-b px-4 py-2 text-xs font-bold uppercase tracking-wide ${isDark ? 'border-[#24305a] text-[#8f9ac2]' : 'border-carbon text-carbon/60'}`}>Pilih bulan</p>
            <div className="max-h-64 overflow-y-auto">
              {monthIds.length === 0 && <p className={`px-4 py-3 text-sm ${isDark ? 'text-[#8f9ac2]' : 'text-slate-500'}`}>Belum ada bulan tersimpan.</p>}
              {monthIds.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    switchMonth(m)
                    setMenuOpen(false)
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} ${m === currentMonthId ? `font-semibold ${isDark ? 'text-[#f5f2e8]' : 'text-carbon'}` : isDark ? 'text-[#8f9ac2]' : 'text-carbon/70'}`}
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
              className={`block w-full border-t px-4 py-3 text-left text-sm font-medium ${isDark ? 'border-[#24305a] text-[#f5f2e8] hover:bg-white/5' : 'border-carbon text-carbon hover:bg-black/5'}`}
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

import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useStore } from '../store/StoreContext.jsx'
import { useTheme } from '../theme.js'
import { addMonths, labelOf } from '../lib/dates.js'
import { exportBackup, importBackup } from '../lib/backup.js'
import { disableNotifications, notificationsEnabled, notificationsSupported, requestNotifications } from '../lib/notifications.js'
import Confirm from './Confirm.jsx'

export default function Header({ view, onViewChange, onOpenWallets }) {
  const { user, logout, currentMonthId, switchMonth, startNewMonth, months, wallets, templates, budgetTemplates, notify } = useStore()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [busy, setBusy] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [notificationEnabled, setNotificationEnabled] = useState(() => notificationsEnabled(user?.uid))
  const restoreRef = useRef(null)
  const monthIds = Object.keys(months).sort().reverse()

  useEffect(() => {
    setNotificationEnabled(notificationsEnabled(user?.uid))
  }, [user?.uid])

  const toggleNotifications = async () => {
    if (notificationEnabled) {
      disableNotifications(user?.uid)
      setNotificationEnabled(false)
      notify('Notifikasi dimatikan')
      window.dispatchEvent(new Event('gmm-notifications-changed'))
      return
    }
    const result = await requestNotifications(user?.uid)
    if (result.granted) {
      setNotificationEnabled(true)
      notify('Notifikasi diaktifkan')
      window.dispatchEvent(new Event('gmm-notifications-changed'))
    } else if (result.reason === 'denied') {
      notify('Izin notifikasi ditolak. Aktifkan dari pengaturan browser.')
    } else if (result.reason === 'unsupported') {
      notify('Browser ini belum mendukung notifikasi.')
    } else {
      notify('Notifikasi belum diizinkan')
    }
  }

  // auto-hide: hilang saat scroll ke bawah, muncul saat scroll ke atas
  useEffect(() => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const dy = y - lastY
      lastY = y
      if (y <= 64) {
        setHidden(false)
        return
      }
      if (dy > 4) setHidden(true)
      else if (dy < -4) setHidden(false)
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
        className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
          active
            ? isDark
              ? 'bg-teal-600 text-white font-semibold shadow-tactile-sm'
              : 'bg-slate-900 text-white font-semibold shadow-tactile-sm'
            : isDark
              ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80 shadow-tactile-sm'
        }`}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <header
      className={`no-print sticky top-0 z-30 border-b transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${isDark ? 'border-slate-800 bg-[#0D1117]/90 backdrop-blur-md' : 'border-slate-200/80 bg-white/90 backdrop-blur-md'}`}
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* Header row — logo kiri, toggle + gear kanan */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-tactile-sm dark:border-slate-700">
              <img src="/logo.png" alt="" className="h-full w-full object-cover" />
            </div>
            <span className={`font-sans text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Zheabraa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-tactile-sm'}`}
            >
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setGearOpen((v) => !v)}
                aria-label="Pengaturan"
                aria-expanded={gearOpen}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-tactile-sm'}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
                </svg>
              </button>
              {gearOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGearOpen(false)} />
                  <div className={`absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border shadow-tactile-md ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                    <button
                      onClick={() => {
                        setGearOpen(false)
                         exportBackup({ wallets, months, templates, budgetTemplates })
                      }}
                      disabled={busy}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v12M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
                      </svg>
                      Unduh Backup
                    </button>
                    {notificationsSupported() && (
                      <button
                        onClick={() => {
                          setGearOpen(false)
                          toggleNotifications()
                        }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <span className="text-sm">{notificationEnabled ? '🔔' : '🔕'}</span>
                        {notificationEnabled ? 'Matikan Notifikasi' : 'Aktifkan Notifikasi'}
                      </button>
                    )}
                    <button
                      onClick={() => restoreRef.current?.click()}
                      disabled={busy}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21V9M7 14l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                      </svg>
                      {busy ? 'Memulihkan…' : 'Pulihkan Backup'}
                    </button>
                    <input
                      ref={restoreRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        e.target.value = ''
                        if (!f) return
                        setGearOpen(false)
                        setBusy(true)
                        try {
                          await importBackup(f, user?.uid)
                          notify('Backup dipulihkan. Muat ulang halaman untuk melihat data baru.')
                          setTimeout(() => window.location.reload(), 1200)
                        } catch (err) {
                          notify(err?.message || 'Gagal memulihkan backup')
                          setBusy(false)
                        }
                      }}
                    />
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

        {/* Month selector: baris terpisah, rata tengah */}
        <div className={`flex items-center justify-center gap-2 border-y py-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
          <button
            onClick={() => switchMonth(addMonths(currentMonthId, -1))}
            aria-label="Bulan sebelumnya"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className={`rounded-xl px-4 py-1 font-sans text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'text-white hover:text-teal-400' : 'text-slate-900 hover:text-teal-600'}`}
          >
            {labelOf(currentMonthId)}
          </button>
          <button
            onClick={() => switchMonth(addMonths(currentMonthId, 1))}
            aria-label="Bulan berikutnya"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Grid navigasi 2x3: 6 tombol seragam */}
        <div className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-3">
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
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60' : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80 shadow-tactile-sm'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M3 7l2-3h14l2 3" />
              <path d="M16 12h2" />
            </svg>
            Dompet
          </button>
          {gridBtn(
            'report',
            'Laporan',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          )}
          <button
            onClick={() => window.print()}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500/20 no-print ${isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60' : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80 shadow-tactile-sm'}`}
            aria-label="Cetak laporan"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            Cetak
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className={`absolute left-1/2 top-[108px] z-50 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border shadow-tactile-md ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
            <p className={`border-b px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>Pilih bulan</p>
            <div className="max-h-64 overflow-y-auto">
              {monthIds.length === 0 && <p className={`px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Belum ada bulan tersimpan.</p>}
              {monthIds.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    switchMonth(m)
                    setMenuOpen(false)
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} ${m === currentMonthId ? `font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'}` : isDark ? 'text-slate-400' : 'text-slate-700'}`}
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
              className={`flex w-full items-center gap-2 border-t px-4 py-3 text-left text-sm font-medium ${isDark ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Mulai Bulan Baru
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

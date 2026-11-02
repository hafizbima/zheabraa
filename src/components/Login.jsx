import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useRouter, Link } from '../lib/router.jsx'

export default function Login() {
  const { login, signup, resetPassword, backendMode, user } = useStore()
  const { pathname, navigate } = useRouter()

  // Sinkronkan mode form dengan rute URL
  const getModeFromPath = (path) => {
    if (path === '/register') return 'signup'
    if (path === '/forgot-password') return 'reset'
    return 'login'
  }

  const [mode, setMode] = useState(() => getModeFromPath(pathname))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Ketika rute berubah (misal tombol kembali browser dipencet), perbarui mode
  useEffect(() => {
    const nextMode = getModeFromPath(pathname)
    setMode(nextMode)
    setError('')
  }, [pathname])

  // Jika user sudah login, redirect ke /dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const switchMode = (targetPath) => {
    setError('')
    navigate(targetPath)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Validasi form sisi klien
    if (!cleanEmail) {
      setError('Email wajib diisi')
      return
    }
    if (!emailRegex.test(cleanEmail)) {
      setError('Format email tidak valid')
      return
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Nama wajib diisi')
        return
      }
      if (!password) {
        setError('Password wajib diisi')
        return
      }
      if (password.length < 6) {
        setError('Password minimal 6 karakter')
        return
      }
      if (!agreed) {
        setError('Anda harus menyetujui Kebijakan Privasi dan Syarat Layanan')
        return
      }
    } else if (mode === 'login') {
      if (!password) {
        setError('Password wajib diisi')
        return
      }
      if (password.length < 6) {
        setError('Password minimal 6 karakter')
        return
      }
    }

    setBusy(true)
    let res
    try {
      if (mode === 'reset') {
        res = await resetPassword(cleanEmail)
        if (res && res.ok) setSent(true)
      } else if (mode === 'login') {
        res = await login(cleanEmail, password)
        if (res && res.ok) {
          navigate('/dashboard', { replace: true })
        }
      } else {
        res = await signup(cleanEmail, password, displayName.trim())
        if (res && res.ok) {
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan saat memproses permintaan')
    } finally {
      setBusy(false)
    }

    if (res && res.error) {
      setError(res.error)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-[#0f1b3d] focus:ring-2 focus:ring-[#0f1b3d]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-400'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 dark:bg-[#0D1117]">
      {/* Tombol Navigasi Kembali ke Beranda */}
      <div className="mb-4 w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-slate-900 dark:text-white">
          <Link href="/" className="inline-block" aria-label="Beranda Zheabraa">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
              <img src="/logo.png" alt="Logo Zheabraa" className="h-full w-full rounded-xl object-cover" />
            </div>
          </Link>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight">Zheabraa</h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Sistem pocket budgeting untuk keuangan pribadimu
          </p>
          {backendMode === 'local' && (
            <span className="mt-2 inline-block rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Mode lokal
            </span>
          )}
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-tactile dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="mb-4 font-sans text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'reset' ? 'Lupa Password' : mode === 'login' ? 'Masuk' : 'Buat akun'}
          </h2>

          {sent ? (
            <div className="rounded-xl border border-teal-300 bg-teal-50/70 p-4 text-sm text-teal-950 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-200">
              <p className="font-semibold text-teal-900 dark:text-teal-100">Link reset dikirim!</p>
              <p className="mt-1 text-xs text-teal-800 dark:text-teal-300">
                Cek email <strong>{email}</strong> dan klik tautan untuk mengatur kata sandi baru.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false)
                  switchMode('/login')
                }}
                className="mt-3 text-xs font-semibold text-teal-900 underline underline-offset-2 dark:text-teal-200"
              >
                Kembali ke login
              </button>
            </div>
          ) : mode === 'reset' && backendMode === 'local' ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-sm text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="text-xs">
                Mode lokal tidak mendukung reset password. Data hanya tersimpan di perangkat ini.
              </p>
              <button
                type="button"
                onClick={() => switchMode('/login')}
                className="mt-3 text-xs font-semibold text-amber-900 underline underline-offset-2 dark:text-amber-200"
              >
                Kembali ke login
              </button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div className="mb-3">
                  <label
                    htmlFor="field-name"
                    className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nama <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="field-name"
                    className={inputClass}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama kamu"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label
                  htmlFor="field-email"
                  className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email <span className="text-rose-600">*</span>
                </label>
                <input
                  id="field-email"
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              {mode !== 'reset' && (
                <div className="mb-4">
                  <label
                    htmlFor="field-password"
                    className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="field-password"
                      className={inputClass + ' pr-11'}
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                      className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:text-slate-400 dark:hover:text-white"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPw ? (
                          <>
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </>
                        ) : (
                          <>
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                    Minimal 6 karakter.
                  </p>
                </div>
              )}

              {/* Checkbox Persetujuan di Mode Buat Akun */}
              {mode === 'signup' && (
                <div className="mb-4">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="agree-checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f1b3d] focus:ring-[#0f1b3d] dark:border-slate-700 dark:bg-slate-800"
                      required
                    />
                    <span className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      Saya menyetujui{' '}
                      <Link
                        href="/privasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-950 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        Kebijakan Privasi
                      </Link>{' '}
                      dan{' '}
                      <Link
                        href="/syarat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-950 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        Syarat Layanan
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#0f1b3d] py-3 font-sans text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-[#1a2e66] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                {busy ? 'Memproses…' : mode === 'reset' ? 'Kirim Link Reset' : mode === 'login' ? 'Masuk' : 'Daftar'}
              </button>

              {mode === 'reset' ? (
                <p className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => switchMode('/login')}
                    className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700 dark:text-white"
                  >
                    Kembali ke login
                  </button>
                </p>
              ) : (
                <>
                  <p className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
                    {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? '/register' : '/login')}
                      className="font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      {mode === 'login' ? 'Buat akun' : 'Masuk'}
                    </button>
                  </p>
                  {mode === 'login' && (
                    <p className="mt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => switchMode('/forgot-password')}
                        className="font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Lupa password?
                      </button>
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </form>

        <p className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
          {backendMode === 'local'
            ? 'Data tersimpan di perangkat ini (mode lokal).'
            : 'Data tersinkron ke Supabase, bisa diakses dari HP/laptop mana saja.'}
        </p>
      </div>
    </div>
  )
}

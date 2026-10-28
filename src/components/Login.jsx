import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'

export default function Login() {
  const { login, signup, resetPassword, backendMode } = useStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    let res
    if (mode === 'reset') {
      res = await resetPassword(email)
      if (res && res.ok) setSent(true)
    } else if (mode === 'login') {
      res = await login(email, password)
    } else {
      res = await signup(email, password, displayName)
    }
    setBusy(false)
    if (res && res.error) setError(res.error)
  }

  const input =
    'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4 dark:bg-[#0D1117]">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-slate-900 dark:text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
            <img src="/logo.png" alt="Gimme Money" className="h-full w-full rounded-xl object-cover" />
          </div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight">Zheabraa</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sistem pocket budgeting untuk keuangan pribadimu</p>
          {backendMode === 'local' && (
            <span className="mt-2 inline-block rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Mode lokal
            </span>
          )}
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-sans text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'reset' ? 'Lupa Password' : mode === 'login' ? 'Masuk' : 'Buat akun'}
          </h2>
          {sent ? (
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-4 text-sm text-teal-900 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-200">
              <p className="font-semibold">Link reset dikirim!</p>
              <p className="mt-1 text-xs text-teal-700 dark:text-teal-300">Cek email <strong>{email}</strong> dan klik link untuk set password baru.</p>
              <button
                type="button"
                onClick={() => { setSent(false); setMode('login'); setError('') }}
                className="mt-3 text-xs font-semibold text-teal-800 underline underline-offset-2 dark:text-teal-200"
              >
                Kembali ke login
              </button>
            </div>
          ) : mode === 'reset' && backendMode === 'local' ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="text-xs">Mode lokal tidak mendukung reset password. Data hanya tersimpan di perangkat ini.</p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="mt-3 text-xs font-semibold text-amber-800 underline underline-offset-2 dark:text-amber-200"
              >
                Kembali ke login
              </button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nama</label>
                  <input
                    className={input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama kamu"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Email</label>
                <input
                  className={input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  required
                />
              </div>
              {mode !== 'reset' && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
                  <div className="relative">
                    <input
                      className={input + ' pr-11'}
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                      className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:text-slate-700 dark:hover:text-white dark:focus-visible:text-white"
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
                </div>
              )}

              {error && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-slate-900 py-3 font-sans text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                {busy ? '…' : mode === 'reset' ? 'Kirim Link Reset' : mode === 'login' ? 'Masuk' : 'Daftar'}
              </button>

              {mode === 'reset' ? (
                <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError('') }}
                    className="font-semibold text-slate-900 underline underline-offset-2 dark:text-white"
                  >
                    Kembali ke login
                  </button>
                </p>
              ) : (
                <>
                  <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login')
                        setError('')
                      }}
                      className="font-semibold text-teal-600 underline underline-offset-2 dark:text-teal-400"
                    >
                      {mode === 'login' ? 'Buat akun' : 'Masuk'}
                    </button>
                  </p>
                  {mode === 'login' && (
                    <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError('') }}
                        className="font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
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

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          {backendMode === 'local'
            ? 'Data tersimpan di perangkat ini (mode lokal).'
            : 'Data tersinkron ke Supabase, bisa diakses dari HP/laptop mana saja.'}
        </p>
      </div>
    </div>
  )
}

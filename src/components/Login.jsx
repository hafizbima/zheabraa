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
    'w-full rounded-xl border border-carbon bg-paper px-3 py-2.5 text-carbon outline-none focus:ring-2 focus:ring-black/20 dark:border-white/30 dark:bg-slate-800 dark:text-white'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky via-sky to-[#cfe6ff] px-4 dark:from-[#0f1b3d] dark:via-[#0f1b3d] dark:to-[#0a1128]">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-carbon dark:text-white">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-carbon bg-paper shadow-carbon dark:border-white/50">
            <img src="/logo.png" alt="Gimme Money" className="h-full w-full rounded-full object-cover" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Zheabraa</h1>
          <p className="mt-1 text-sm opacity-70">Sistem pocket budgeting untuk keuangan pribadimu</p>
          {backendMode === 'local' && (
            <span className="mt-2 inline-block rounded-full border border-carbon/30 bg-paper/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-300">
              Mode lokal
            </span>
          )}
        </div>

        <form onSubmit={submit} className="rounded-3xl border-2 border-carbon bg-paper p-6 shadow-carbon dark:border-white/30 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold text-carbon dark:text-white">
            {mode === 'reset' ? 'Lupa Password' : mode === 'login' ? 'Masuk' : 'Buat akun'}
          </h2>
          {sent ? (
            <div className="rounded-xl border border-mint bg-mint/20 p-4 text-sm text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
              <p className="font-medium">Link reset dikirim!</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Cek email <strong>{email}</strong> dan klik link untuk set password baru.</p>
              <button
                type="button"
                onClick={() => { setSent(false); setMode('login'); setError('') }}
                className="mt-3 font-medium text-carbon underline underline-offset-2 dark:text-white"
              >
                Kembali ke login
              </button>
            </div>
          ) : mode === 'reset' && backendMode === 'local' ? (
            <div className="rounded-xl border border-sunburst bg-sunburst/20 p-4 text-sm text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
              <p>Mode lokal tidak mendukung reset password. Data hanya tersimpan di perangkat ini.</p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="mt-3 font-medium text-carbon underline underline-offset-2 dark:text-white"
              >
                Kembali ke login
              </button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nama</label>
                  <input
                    className={input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama kamu"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
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
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Password</label>
                  <div className="relative">
                    <input
                      className={input + ' pr-10'}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-carbon dark:hover:text-white"
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
                <div className="mb-3 rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">{error}</div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full border border-carbon bg-carbon py-2.5 font-semibold text-white transition hover:bg-[#1a1a1a] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? '…' : mode === 'reset' ? 'Kirim Link Reset' : mode === 'login' ? 'Masuk' : 'Daftar'}
              </button>

              {mode === 'reset' ? (
                <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError('') }}
                    className="font-medium text-carbon underline underline-offset-2 dark:text-white"
                  >
                    Kembali ke login
                  </button>
                </p>
              ) : (
                <>
                  <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login')
                        setError('')
                      }}
                      className="font-medium text-carbon underline underline-offset-2 dark:text-white"
                    >
                      {mode === 'login' ? 'Buat akun' : 'Masuk'}
                    </button>
                  </p>
                  {mode === 'login' && (
                    <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError('') }}
                        className="font-medium text-carbon underline underline-offset-2 dark:text-white"
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

        <p className="mt-4 text-center text-xs text-carbon/60 dark:text-white/60">
          {backendMode === 'local'
            ? 'Data tersimpan di perangkat ini (mode lokal).'
            : 'Data tersinkron ke Supabase — bisa diakses dari HP/laptop mana saja.'}
        </p>
      </div>
    </div>
  )
}

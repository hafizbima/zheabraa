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
    <div className="flex min-h-screen items-center justify-center bg-sky px-4 dark:bg-[#131a33]">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-carbon dark:text-white">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-carbon bg-paper dark:border-white/50">
            <img src="/logo.png" alt="Gimme Money" className="h-full w-full rounded-full object-cover" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Zheabraa</h1>
          <p className="mt-1 text-sm opacity-70">Sistem pocket budgeting untuk keuangan pribadimu</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border-2 border-carbon bg-paper p-6 dark:border-white/30 dark:bg-slate-900">
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
                className="mt-3 font-medium text-carbon underline underline-offset-2"
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
                className="mt-3 font-medium text-carbon underline underline-offset-2"
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
                  <input
                    className={input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
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
                    className="font-medium text-carbon underline underline-offset-2"
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
                      className="font-medium text-carbon underline underline-offset-2"
                    >
                      {mode === 'login' ? 'Buat akun' : 'Masuk'}
                    </button>
                  </p>
                  {mode === 'login' && (
                    <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError('') }}
                        className="font-medium text-carbon underline underline-offset-2"
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

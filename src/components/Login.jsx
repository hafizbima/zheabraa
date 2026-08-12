import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'

export default function Login() {
  const { login, signup, backendMode } = useStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res =
      mode === 'login'
        ? await login(email, password)
        : await signup(email, password, displayName)
    setBusy(false)
    if (res && res.error) setError(res.error)
  }

  const input =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-500/30'

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-700 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <img
            src="/logo.png"
            alt="Gimme Money"
            className="mx-auto mb-3 h-20 w-20 rounded-2xl object-cover"
          />
          <h1 className="text-2xl font-bold">Zheabraa</h1>
          <p className="mt-1 text-sm text-brand-200">Sistem pocket budgeting untuk keuangan pribadimu</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
            {mode === 'login' ? 'Masuk' : 'Buat akun'}
          </h2>
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

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/40 transition hover:from-brand-500 hover:to-brand-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? '…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              {mode === 'login' ? 'Buat akun' : 'Masuk'}
            </button>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-brand-200">
          {backendMode === 'local'
            ? 'Data tersimpan di perangkat ini (mode lokal).'
            : 'Data tersinkron ke Supabase — bisa diakses dari HP/laptop mana saja.'}
        </p>
      </div>
    </div>
  )
}

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import backend from './backend.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [wallets, setWallets] = useState([])
  const [walletsReceived, setWalletsReceived] = useState(false)
  const [months, setMonths] = useState({})
  const [templates, setTemplates] = useState([])
  const [budgetTemplates, setBudgetTemplates] = useState([])
  const [notice, setNotice] = useState(null)

  const notify = useCallback((msg) => {
    setNotice(msg)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setNotice(null), 4000)
  }, [])

  const report = useCallback(
    (e, fallback) => {
      console.error(e)
      notify(fallback)
    },
    [notify],
  )

  // load semua data sekali (tanpa realtime); panggil ulang setelah tiap mutasi
  const refresh = useCallback(async () => {
    if (!user) return
    try {
      // timeout 15 detik biar loading tidak menggantung
      const d = await Promise.race([
        backend.loadAll(user.uid),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Waktu habis')), 15000)),
      ])
      setWallets(d.wallets || [])
      setMonths(d.months || {})
      setTemplates(d.templates || [])
      setBudgetTemplates(d.budgetTemplates || [])
    } catch (e) {
      const msg = String(e?.message || e?.code || '')
      if (msg.includes('PGRST303') || msg.includes('JWT issued at future')) {
        report(e, 'Konfigurasi tidak valid (JWT). Setel ulang anon key di Supabase Dashboard > Settings > API > Reset anon key, lalu update .env & Vercel env.')
      } else if (msg.includes('Waktu habis')) {
        report(e, 'Memuat data terlalu lama. Periksa koneksi internet atau setel ulang kunci Supabase.')
      } else {
        report(e, 'Gagal memuat data')
      }
    } finally {
      setWalletsReceived(true)
    }
  }, [user, report])

  // helper tunggal: jalankan mutasi backend → refresh data → toast kalau gagal
  const mutate = useCallback(
    (promise, errMsg) => {
      if (!user) return Promise.resolve()
      return promise.then(() => refresh()).catch((e) => report(e, errMsg))
    },
    [user, refresh, report],
  )

  useEffect(() => {
    if (!user) {
      setWallets([])
      setMonths({})
      setTemplates([])
      setBudgetTemplates([])
      setWalletsReceived(false)
      return
    }
    refresh()
  }, [user, refresh])

  const value = useMemo(
    () => ({
      wallets,
      walletsReceived,
      months,
      templates,
      budgetTemplates,
      notice,
      notify,
      refresh,
      mutate,
    }),
    [wallets, walletsReceived, months, templates, budgetTemplates, notice, notify, refresh, mutate],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

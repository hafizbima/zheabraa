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

  const notify = useCallback((msg, type = null) => {
    if (!msg) {
      setNotice(null)
      return
    }
    let resolvedType = type
    if (!resolvedType) {
      const lower = String(msg).toLowerCase()
      if (
        lower.includes('gagal') ||
        lower.includes('error') ||
        lower.includes('salah') ||
        lower.includes('tidak valid') ||
        lower.includes('ditolak') ||
        lower.includes('melebihi')
      ) {
        resolvedType = 'error'
      } else {
        resolvedType = 'success'
      }
    }
    setNotice({ text: String(msg), type: resolvedType })
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setNotice(null), 4000)
  }, [])

  const report = useCallback(
    (e, fallback) => {
      console.error(e)
      notify(fallback, 'error')
    },
    [notify],
  )

  // load semua data sekali (dengan offline cache fallback); panggil ulang setelah tiap mutasi
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
      try {
        localStorage.setItem('gmm_cache_' + user.uid, JSON.stringify(d))
      } catch {}
    } catch (e) {
      // Jika jaringan gagal / offline, gunakan cache lokal bila ada
      try {
        const raw = localStorage.getItem('gmm_cache_' + user.uid)
        if (raw) {
          const cached = JSON.parse(raw)
          if (cached && typeof cached === 'object') {
            setWallets(cached.wallets || [])
            setMonths(cached.months || {})
            setTemplates(cached.templates || [])
            setBudgetTemplates(cached.budgetTemplates || [])
            notify('Menampilkan data offline dari penyimpanan lokal')
            return
          }
        }
      } catch {}

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
  }, [user, report, notify])

  // helper tunggal: jalankan mutasi backend → refresh data → toast kalau gagal
  const resetAllData = useCallback(async () => {
    if (!user) return
    if (backend.resetAll) {
      await backend.resetAll(user.uid)
    }
    try {
      localStorage.removeItem('gmm_cache_' + user.uid)
    } catch {}
    await refresh()
  }, [user, refresh])

  const mutate = useCallback(
    (promise, errMsg, rollbackFn) => {
      if (!user) return Promise.resolve()
      return promise.then(() => refresh()).catch((e) => {
        if (typeof rollbackFn === 'function') rollbackFn()
        report(e, errMsg)
      })
    },
    [user, refresh, report],
  )

  // Saat user terdeteksi, langsung baca dari cache lokal (0ms render), lalu sinkron data terbaru
  useEffect(() => {
    if (!user) {
      setWallets([])
      setMonths({})
      setTemplates([])
      setBudgetTemplates([])
      setWalletsReceived(false)
      return
    }
    try {
      const raw = localStorage.getItem('gmm_cache_' + user.uid)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached && typeof cached === 'object') {
          if (cached.wallets) setWallets(cached.wallets)
          if (cached.months) setMonths(cached.months)
          if (cached.templates) setTemplates(cached.templates)
          if (cached.budgetTemplates) setBudgetTemplates(cached.budgetTemplates)
          setWalletsReceived(true)
        }
      }
    } catch {}
    refresh()
  }, [user, refresh])

  const value = useMemo(
    () => ({
      wallets,
      setWallets,
      walletsReceived,
      months,
      setMonths,
      templates,
      setTemplates,
      budgetTemplates,
      setBudgetTemplates,
      notice,
      notify,
      refresh,
      mutate,
      resetAllData,
    }),
    [wallets, walletsReceived, months, templates, budgetTemplates, notice, notify, refresh, mutate, resetAllData],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

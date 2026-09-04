import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import backend from './backend.js'
import { monthIdOf, addMonths, labelOf, todayISO } from '../lib/dates.js'
import { uid, slugify } from '../lib/id.js'
import { monthLeftTotal, categoryUsed, carryOverAmount } from '../lib/calc.js'
import { friendlyAuthError } from '../lib/auth.js'

const StoreContext = createContext(null)

// identitas kategori stabil antar bulan: key (slug) bila ada, fallback nama
const catKey = (c) => (c && (c.key || c.name)) || ''

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [wallets, setWallets] = useState([])
  const [walletsReceived, setWalletsReceived] = useState(false)
  const [months, setMonths] = useState({})
  const [templates, setTemplates] = useState([])
  const [currentMonthId, setCurrentMonthId] = useState(() => monthIdOf(new Date()))
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

  useEffect(() => {
    const unsub = backend.onAuthChange((u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

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
      setWalletsReceived(true)
    } catch (e) {
      const msg = String(e?.message || e?.code || '')
      if (msg.includes('PGRST303') || msg.includes('JWT issued at future')) {
        report(e, 'Konfigurasi tidak valid (JWT). Setel ulang anon key di Supabase Dashboard > Settings > API > Reset anon key, lalu update .env & Vercel env.')
      } else if (msg.includes('Waktu habis')) {
        report(e, 'Memuat data terlalu lama. Periksa koneksi internet atau setel ulang kunci Supabase.')
      } else {
        report(e, 'Gagal memuat data')
      }
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
      setWalletsReceived(false)
      return
    }
    refresh()
  }, [user, refresh])

  const currentMonth = months[currentMonthId]
  const ready =
    authReady &&
    (!user || (walletsReceived && !!currentMonth?.categories && !!currentMonth?.transactions))

  // --- auth actions ---
  const login = useCallback(async (email, password) => {
    try {
      await backend.signIn(email, password)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  const signup = useCallback(async (email, password, displayName) => {
    try {
      await backend.signUp(email, password, displayName)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  const logout = useCallback(() => {
    backend.signOut().catch(console.error)
  }, [])

  const resetPassword = useCallback(async (email) => {
    try {
      await backend.resetPassword(email)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  // --- month meta helper ---
  const monthMeta = useCallback(
    (mId) => {
      const m = months[mId]
      return {
        id: mId,
        label: m?.label || labelOf(mId),
        carryOver: m?.carryOver || 0,
        incomes: m?.incomes || [],
        note: m?.note || '',
        createdAt: m?.createdAt || Date.now(),
      }
    },
    [months],
  )

  const switchMonth = useCallback(
    (mId) => {
      if (!user) return
      setCurrentMonthId(mId)
      mutate(backend.ensureMonth(user.uid, mId), 'Gagal menyiapkan bulan')
    },
    [user, mutate],
  )

  const startNewMonth = useCallback(() => {
    if (!user) return
    const cur = months[currentMonthId]
    const nextId = addMonths(currentMonthId, 1)
    const carry = cur ? carryOverAmount(cur) : 0
    const txs = cur?.transactions || []
    const cats = (cur?.categories || []).map((c) => {
      const sisa = Math.max(0, (c.budgetAmount || 0) - Math.max(0, categoryUsed(c.id, txs)))
      return {
        ...c,
        budgetAmount: 0,
        savedAmount: (c.goalAmount > 0 ? (c.savedAmount || 0) + sisa : c.savedAmount || 0),
      }
    })
    mutate(backend.createNextMonth(user.uid, nextId, carry, cats), 'Gagal membuat bulan baru')
    setCurrentMonthId(nextId)
  }, [user, months, currentMonthId, mutate])

  // --- incomes (sekarang transaksi type='income' — satu sumber kebenaran, masuk Riwayat) ---
  const addIncome = useCallback(
    (mId, data) => {
      if (!user) return
      const tx = {
        id: uid(),
        createdAt: Date.now(),
        date: `${mId}-01`,
        type: 'income',
        amount: data.amount || 0,
        categoryId: null,
        walletId: wallets[0]?.id || null,
        toWalletId: null,
        description: data.label || 'Pemasukan',
      }
      mutate(backend.setTransaction(user.uid, mId, tx), 'Gagal menyimpan pemasukan')
    },
    [user, wallets, mutate],
  )

  const updateIncome = useCallback(
    (mId, incomeId, patch) => {
      if (!user) return
      mutate(
        backend.updateTransaction(user.uid, mId, incomeId, { description: patch.label, amount: patch.amount }),
        'Gagal mengubah pemasukan',
      )
    },
    [user, mutate],
  )

  const removeIncome = useCallback(
    (mId, incomeId) => {
      if (!user) return
      mutate(backend.removeTransaction(user.uid, mId, incomeId), 'Gagal menghapus pemasukan')
    },
    [user, mutate],
  )

  const setCarryOver = useCallback(
    (mId, value) => {
      if (!user) return
      mutate(backend.setMonth(user.uid, { ...monthMeta(mId), carryOver: value }), 'Gagal menyimpan carry-over')
    },
    [user, monthMeta, mutate],
  )

  const setMonthNote = useCallback(
    (mId, note) => {
      if (!user) return
      mutate(backend.setMonth(user.uid, { ...monthMeta(mId), note: note || '' }), 'Gagal menyimpan catatan')
    },
    [user, monthMeta, mutate],
  )

  // --- wallets ---
  const addWallet = useCallback(
    (data) => {
      if (!user) return
      const w = {
        id: uid(),
        name: data.name || 'Dompet',
        color: data.color,
        openingBalance: data.openingBalance || 0,
        order: wallets.length,
      }
      mutate(backend.setWallet(user.uid, w), 'Gagal menambah dompet')
    },
    [user, wallets, mutate],
  )

  const updateWallet = useCallback(
    (id, patch) => {
      if (!user) return
      mutate(backend.updateWallet(user.uid, id, patch), 'Gagal mengubah dompet')
    },
    [user, mutate],
  )

  const deleteWallet = useCallback(
    (id) => {
      if (!user) return
      mutate(backend.removeWallet(user.uid, id), 'Gagal menghapus dompet')
    },
    [user, mutate],
  )

  // --- categories ---
  const addCategory = useCallback(
    (mId, data) => {
      if (!user) return
      const cats = months[mId]?.categories || []
      const cat = {
        id: uid(),
        name: data.name,
        key: slugify(data.name),
        budgetAmount: data.budgetAmount || 0,
        goalAmount: data.goalAmount || 0,
        savedAmount: data.savedAmount || 0,
        color: data.color,
        order: cats.length,
      }
      mutate(backend.setCategory(user.uid, mId, cat), 'Gagal menambah kategori')
    },
    [user, months, mutate],
  )

  const updateCategory = useCallback(
    (mId, categoryId, patch) => {
      if (!user) return Promise.resolve()
      return mutate(backend.updateCategory(user.uid, mId, categoryId, patch), 'Gagal mengubah kategori')
    },
    [user, mutate],
  )

  const removeCategory = useCallback(
    (mId, categoryId) => {
      if (!user) return
      mutate(backend.removeCategory(user.uid, mId, categoryId), 'Gagal menghapus kategori')
    },
    [user, mutate],
  )

  // --- transactions ---
  const addTransaction = useCallback(
    (mId, data) => {
      if (!user) return
      const targetId = data.date ? data.date.slice(0, 7) : mId
      let resolvedCatId = data.categoryId
      if (resolvedCatId && targetId !== mId) {
        const sourceCat = Object.values(months)
          .flatMap((mm) => mm.categories || [])
          .find((c) => c.id === resolvedCatId)
        if (sourceCat) {
          const targetCats = months[targetId]?.categories || []
          const match = targetCats.find((c) => catKey(c) === catKey(sourceCat))
          resolvedCatId = match ? match.id : null
        }
      }
      const tx = { id: uid(), createdAt: Date.now(), ...data, categoryId: resolvedCatId }
      if (targetId !== mId) backend.ensureMonth(user.uid, targetId).catch(console.error)
      mutate(backend.setTransaction(user.uid, targetId, tx), 'Gagal menyimpan transaksi')
    },
    [user, months, mutate],
  )

  const updateTransaction = useCallback(
    (mId, txId, patch) => {
      if (!user) return
      const targetId = patch.date ? patch.date.slice(0, 7) : mId
      if (targetId !== mId) {
        const oldTx = months[mId]?.transactions?.find((t) => t.id === txId)
        if (oldTx) {
          let resolvedCatId = patch.categoryId !== undefined ? patch.categoryId : oldTx.categoryId
          if (resolvedCatId) {
            const sourceCat = Object.values(months)
              .flatMap((mm) => mm.categories || [])
              .find((c) => c.id === resolvedCatId)
            const targetCats = months[targetId]?.categories || []
            const match = sourceCat ? targetCats.find((c) => catKey(c) === catKey(sourceCat)) : null
            if (sourceCat && !match) resolvedCatId = null
            else if (match) resolvedCatId = match.id
          }
          const newTx = { ...oldTx, ...patch, categoryId: resolvedCatId }
          // ponytail: pindah bulan = remove + set (2 call), tanpa atomicity — cukup untuk app personal
          backend.removeTransaction(user.uid, mId, txId).catch(console.error)
          backend.ensureMonth(user.uid, targetId).catch(console.error)
          mutate(backend.setTransaction(user.uid, targetId, newTx), 'Gagal menyimpan transaksi')
          return
        }
      }
      mutate(backend.updateTransaction(user.uid, mId, txId, patch), 'Gagal menyimpan transaksi')
    },
    [user, months, mutate],
  )

  const removeTransaction = useCallback(
    (mId, txId) => {
      if (!user) return
      mutate(backend.removeTransaction(user.uid, mId, txId), 'Gagal menghapus transaksi')
    },
    [user, mutate],
  )

  // tabungan manual: keluarkan dari uang bebas (expense) lalu tambah ke savedAmount
  const saveToGoal = useCallback(
    (mId, categoryId, amount) => {
      if (!user || amount <= 0) return
      const cat = (months[mId]?.categories || []).find((c) => c.id === categoryId)
      if (!cat) return
      addTransaction(mId, {
        date: todayISO(),
        type: 'expense',
        amount,
        categoryId: null,
        walletId: wallets[0]?.id || null,
        description: `Menabung ke ${cat.name}`,
      })
      updateCategory(mId, categoryId, { savedAmount: (cat.savedAmount || 0) + amount })
    },
    [user, months, wallets, addTransaction, updateCategory],
  )

  // --- recurring templates ---
  const addTemplate = useCallback(
    (data) => {
      if (!user) return
      const t = {
        id: uid(),
        dayOfMonth: data.dayOfMonth || 1,
        type: data.type === 'income' || data.type === 'bill' || data.type === 'transfer' ? data.type : 'expense',
        amount: data.amount || 0,
        categoryId: data.categoryId || null,
        walletId: data.walletId || null,
        toWalletId: data.toWalletId || null,
        description: data.description || '',
        active: data.active !== false,
        createdAt: Date.now(),
      }
      mutate(
        backend.addTemplate(user.uid, t).then(() => backend.applyRecurring(user.uid, currentMonthId)),
        'Gagal menyimpan template',
      )
    },
    [user, currentMonthId, mutate],
  )

  const updateTemplate = useCallback(
    (id, patch) => {
      if (!user) return
      mutate(
        backend.updateTemplate(user.uid, id, patch).then(() => backend.applyRecurring(user.uid, currentMonthId)),
        'Gagal menyimpan template',
      )
    },
    [user, currentMonthId, mutate],
  )

  const removeTemplate = useCallback(
    (id) => {
      if (!user) return
      mutate(backend.removeTemplate(user.uid, id), 'Gagal menghapus template')
    },
    [user, mutate],
  )

const value = useMemo(
    () => ({
      backendMode: backend.mode,
      user,
      authReady,
      ready,
      wallets,
      months,
      currentMonthId,
      currentMonth,
      notice,
      notify,
login,
        signup,
        logout,
        resetPassword,
        switchMonth,
      startNewMonth,
      addWallet,
      updateWallet,
      deleteWallet,
      addIncome,
      updateIncome,
      removeIncome,
      setCarryOver,
      setMonthNote,
      addCategory,
      updateCategory,
      removeCategory,
      addTransaction,
      updateTransaction,
      removeTransaction,
      saveToGoal,
      templates,
      addTemplate,
      updateTemplate,
      removeTemplate,
    }),
    [
      user, authReady, ready, wallets, months, currentMonthId, currentMonth, notice,
      login, signup, logout, resetPassword, switchMonth, startNewMonth, notify,
      addWallet, updateWallet, deleteWallet,
      addIncome, updateIncome, removeIncome, setCarryOver, setMonthNote,
      addCategory, updateCategory, removeCategory,
      addTransaction, updateTransaction, removeTransaction, saveToGoal,
      templates, addTemplate, updateTemplate, removeTemplate,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

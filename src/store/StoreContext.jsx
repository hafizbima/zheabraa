import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
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

  // ponytail: auto-repair sekali per sesi, hanya bulan berjalan & 1 bulan sebelumnya (data lama yang tak aktif tidak disentuh)
  const repairedRef = useRef(new Set())
  useEffect(() => {
    if (!user) return
    if (!Object.keys(months).length) return
    const scope = new Set([currentMonthId, addMonths(currentMonthId, -1)])
    for (const mId of scope) {
      const cats = months[mId]?.categories || []
      const catIds = new Set(cats.map((c) => c.id))
      for (const t of months[mId]?.transactions || []) {
        if (repairedRef.current.has(t.id)) continue
        if (!t.date) continue
        const target = t.date.slice(0, 7)
        // 1) bulan di tanggal != bulan penyimpanan → pindahkan + map pocket by nama
        if (target !== mId) {
          const sourceCat = t.categoryId
            ? Object.values(months)
                .flatMap((mm) => mm.categories || [])
                .find((c) => c.id === t.categoryId)
            : null
          let resolvedCatId = t.categoryId
          if (sourceCat) {
            const targetCats = months[target]?.categories || []
            const match = targetCats.find((c) => catKey(c) === catKey(sourceCat))
            resolvedCatId = match ? match.id : null
          }
          repairedRef.current.add(t.id)
          backend.removeTransaction(user.uid, mId, t.id).catch(console.error)
          backend.ensureMonth(user.uid, target).catch(() => {})
          backend.setTransaction(user.uid, target, { ...t, categoryId: resolvedCatId }).catch(console.error)
          continue
        }
        // 2) categoryId ada tapi tidak di bulan ini → map by nama (Skincare tiap bulan id beda)
        if (t.categoryId && !catIds.has(t.categoryId)) {
          const sourceCat = Object.values(months)
            .flatMap((mm) => mm.categories || [])
            .find((c) => c.id === t.categoryId)
          if (sourceCat) {
            const match = cats.find((c) => catKey(c) === catKey(sourceCat))
            if (match) {
              repairedRef.current.add(t.id)
              backend.updateTransaction(user.uid, mId, t.id, { categoryId: match.id }).catch(console.error)
            }
          }
        }
      }
    }
  }, [user, months, currentMonthId])

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
      backend.ensureMonth(user.uid, mId).then(() => refresh()).catch(console.error)
    },
    [user, refresh],
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
    backend.createNextMonth(user.uid, nextId, carry, cats).then(() => refresh()).catch(console.error)
    setCurrentMonthId(nextId)
  }, [user, months, currentMonthId, refresh])

  // --- incomes ---
  const addIncome = useCallback(
    (mId, data) => {
      if (!user) return
      const meta = monthMeta(mId)
      const inc = { id: uid(), label: data.label || 'Pemasukan', amount: data.amount || 0 }
      backend
        .setMonth(user.uid, { ...meta, incomes: [...meta.incomes, inc] })
        .then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan pemasukan'))
    },
    [user, monthMeta, report],
  )

  const updateIncome = useCallback(
    (mId, incomeId, patch) => {
      if (!user) return
      const meta = monthMeta(mId)
      const incomes = meta.incomes.map((i) => (i.id === incomeId ? { ...i, ...patch } : i))
      backend
        .setMonth(user.uid, { ...meta, incomes })
        .then(() => refresh()).catch((e) => report(e, 'Gagal mengubah pemasukan'))
    },
    [user, monthMeta, report],
  )

  const removeIncome = useCallback(
    (mId, incomeId) => {
      if (!user) return
      const meta = monthMeta(mId)
      backend
        .setMonth(user.uid, { ...meta, incomes: meta.incomes.filter((i) => i.id !== incomeId) })
        .then(() => refresh()).catch((e) => report(e, 'Gagal menghapus pemasukan'))
    },
    [user, monthMeta, report],
  )

  const setCarryOver = useCallback(
    (mId, value) => {
      if (!user) return
      backend
        .setMonth(user.uid, { ...monthMeta(mId), carryOver: value })
        .then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan carry-over'))
    },
    [user, monthMeta, report],
  )

  const setMonthNote = useCallback(
    (mId, note) => {
      if (!user) return
      backend
        .setMonth(user.uid, { ...monthMeta(mId), note: note || '' })
        .then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan catatan'))
    },
    [user, monthMeta, report],
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
      backend.setWallet(user.uid, w).then(() => refresh()).catch((e) => report(e, 'Gagal menambah dompet'))
    },
    [user, wallets, report],
  )

  const updateWallet = useCallback(
    (id, patch) => {
      if (!user) return
      backend.updateWallet(user.uid, id, patch).then(() => refresh()).catch((e) => report(e, 'Gagal mengubah dompet'))
    },
    [user, report],
  )

  const deleteWallet = useCallback(
    (id) => {
      if (!user) return
      backend.removeWallet(user.uid, id).then(() => refresh()).catch((e) => report(e, 'Gagal menghapus dompet'))
    },
    [user, report],
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
        color: data.color,
        order: cats.length,
      }
      backend.setCategory(user.uid, mId, cat).then(() => refresh()).catch((e) => report(e, 'Gagal menambah kategori'))
    },
    [user, months, report],
  )

  const updateCategory = useCallback(
    (mId, categoryId, patch) => {
      if (!user) return Promise.resolve()
      return backend.updateCategory(user.uid, mId, categoryId, patch).then(() => refresh()).catch((e) => report(e, 'Gagal mengubah kategori'))
    },
    [user, report],
  )

  const removeCategory = useCallback(
    (mId, categoryId) => {
      if (!user) return
      backend.removeCategory(user.uid, mId, categoryId).then(() => refresh()).catch((e) => report(e, 'Gagal menghapus kategori'))
    },
    [user, report],
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
      backend.setTransaction(user.uid, targetId, tx).then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan transaksi'))
    },
    [user, months, report],
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
          backend.removeTransaction(user.uid, mId, txId).catch(console.error)
          backend.ensureMonth(user.uid, targetId).catch(console.error)
          backend.setTransaction(user.uid, targetId, newTx).catch(console.error)
          return
        }
      }
      backend.updateTransaction(user.uid, mId, txId, patch).then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan transaksi'))
    },
    [user, months, report],
  )

  const removeTransaction = useCallback(
    (mId, txId) => {
      if (!user) return
      backend.removeTransaction(user.uid, mId, txId).then(() => refresh()).catch((e) => report(e, 'Gagal menghapus transaksi'))
    },
    [user, report],
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
  const refreshTemplates = useCallback(() => {
    if (!user) return
    backend
      .listTemplates(user.uid)
      .then((list) => setTemplates(list))
      .catch(console.error)
  }, [user])

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
      backend
        .addTemplate(user.uid, t)
        .then(() => backend.applyRecurring(user.uid, currentMonthId))
        .then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan template'))
        .finally(refreshTemplates)
    },
    [user, currentMonthId, refreshTemplates, report],
  )

  const updateTemplate = useCallback(
    (id, patch) => {
      if (!user) return
      backend
        .updateTemplate(user.uid, id, patch)
        .then(() => backend.applyRecurring(user.uid, currentMonthId))
        .then(() => refresh()).catch((e) => report(e, 'Gagal menyimpan template'))
        .finally(refreshTemplates)
    },
    [user, currentMonthId, refreshTemplates, report],
  )

  const removeTemplate = useCallback(
    (id) => {
      if (!user) return
      backend.removeTemplate(user.uid, id).then(refreshTemplates).then(() => refresh()).catch((e) => report(e, 'Gagal menghapus template'))
    },
    [user, refreshTemplates, report],
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

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import backend from './backend.js'
import { monthIdOf, addMonths, labelOf } from '../lib/dates.js'
import { uid } from '../lib/id.js'
import { monthLeftTotal } from '../lib/calc.js'
import { friendlyAuthError } from '../lib/auth.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [wallets, setWallets] = useState([])
  const [walletsReceived, setWalletsReceived] = useState(false)
  const [months, setMonths] = useState({})
  const [templates, setTemplates] = useState([])
  const [currentMonthId, setCurrentMonthId] = useState(() => monthIdOf(new Date()))

  useEffect(() => {
    const unsub = backend.onAuthChange((u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) {
      setWallets([])
      setWalletsReceived(false)
      return
    }
    const unsub = backend.subscribeWallets(user.uid, (list) => {
      setWallets(list)
      setWalletsReceived(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!user) {
      setMonths({})
      return
    }
    const unsub = backend.subscribeMonths(user.uid, (list) => {
      setMonths((prev) => {
        const next = { ...prev }
        for (const m of list) next[m.id] = { ...(next[m.id] || {}), ...m }
        return next
      })
    })
    return unsub
  }, [user])

  const monthIdsKey = useMemo(() => Object.keys(months).sort().join(','), [months])

  useEffect(() => {
    if (!user) {
      setTemplates([])
      return
    }
    let alive = true
    backend
      .listTemplates(user.uid)
      .then((list) => {
        if (alive) setTemplates(list)
      })
      .catch(console.error)
    return () => {
      alive = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubs = Object.keys(months).map((mId) =>
      backend.subscribeMonthDetail(user.uid, mId, ({ categories, transactions }) => {
        setMonths((prev) => ({
          ...prev,
          [mId]: { ...(prev[mId] || { id: mId }), categories, transactions },
        }))
      }),
    )
    return () => unsubs.forEach((u) => u())
  }, [user, monthIdsKey])

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
      backend.ensureMonth(user.uid, mId).catch(console.error)
      setCurrentMonthId(mId)
    },
    [user],
  )

  const startNewMonth = useCallback(() => {
    if (!user) return
    const cur = months[currentMonthId]
    const nextId = addMonths(currentMonthId, 1)
    const carry = cur ? monthLeftTotal(cur) : 0
    const cats = (cur?.categories || []).map((c) => ({ ...c, budgetAmount: 0 }))
    backend.createNextMonth(user.uid, nextId, carry, cats).catch(console.error)
    setCurrentMonthId(nextId)
  }, [user, months, currentMonthId])

  // --- incomes ---
  const addIncome = useCallback(
    (mId, data) => {
      if (!user) return
      const meta = monthMeta(mId)
      const inc = { id: uid(), label: data.label || 'Pemasukan', amount: data.amount || 0 }
      backend.setMonth(user.uid, { ...meta, incomes: [...meta.incomes, inc] }).catch(console.error)
    },
    [user, monthMeta],
  )

  const updateIncome = useCallback(
    (mId, incomeId, patch) => {
      if (!user) return
      const meta = monthMeta(mId)
      const incomes = meta.incomes.map((i) => (i.id === incomeId ? { ...i, ...patch } : i))
      backend.setMonth(user.uid, { ...meta, incomes }).catch(console.error)
    },
    [user, monthMeta],
  )

  const removeIncome = useCallback(
    (mId, incomeId) => {
      if (!user) return
      const meta = monthMeta(mId)
      backend
        .setMonth(user.uid, { ...meta, incomes: meta.incomes.filter((i) => i.id !== incomeId) })
        .catch(console.error)
    },
    [user, monthMeta],
  )

  const setCarryOver = useCallback(
    (mId, value) => {
      if (!user) return
      backend.setMonth(user.uid, { ...monthMeta(mId), carryOver: value }).catch(console.error)
    },
    [user, monthMeta],
  )

  const setMonthNote = useCallback(
    (mId, note) => {
      if (!user) return
      backend.setMonth(user.uid, { ...monthMeta(mId), note: note || '' }).catch(console.error)
    },
    [user, monthMeta],
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
      backend.setWallet(user.uid, w).catch(console.error)
    },
    [user, wallets],
  )

  const updateWallet = useCallback(
    (id, patch) => {
      if (!user) return
      backend.updateWallet(user.uid, id, patch).catch(console.error)
    },
    [user],
  )

  const deleteWallet = useCallback(
    (id) => {
      if (!user) return
      backend.removeWallet(user.uid, id).catch(console.error)
    },
    [user],
  )

  // --- categories ---
  const addCategory = useCallback(
    (mId, data) => {
      if (!user) return
      const cats = months[mId]?.categories || []
      const cat = {
        id: uid(),
        name: data.name,
        budgetAmount: data.budgetAmount || 0,
        goalAmount: data.goalAmount || 0,
        color: data.color,
        order: cats.length,
      }
      backend.setCategory(user.uid, mId, cat).catch(console.error)
    },
    [user, months],
  )

  const updateCategory = useCallback(
    (mId, categoryId, patch) => {
      if (!user) return Promise.resolve()
      return backend.updateCategory(user.uid, mId, categoryId, patch).catch(console.error)
    },
    [user],
  )

  const removeCategory = useCallback(
    (mId, categoryId) => {
      if (!user) return
      backend.removeCategory(user.uid, mId, categoryId).catch(console.error)
    },
    [user],
  )

  // --- transactions ---
  const addTransaction = useCallback(
    (mId, data) => {
      if (!user) return
      const tx = { id: uid(), createdAt: Date.now(), ...data }
      backend.setTransaction(user.uid, mId, tx).catch(console.error)
    },
    [user],
  )

  const updateTransaction = useCallback(
    (mId, txId, patch) => {
      if (!user) return
      backend.updateTransaction(user.uid, mId, txId, patch).catch(console.error)
    },
    [user],
  )

  const removeTransaction = useCallback(
    (mId, txId) => {
      if (!user) return
      backend.removeTransaction(user.uid, mId, txId).catch(console.error)
    },
    [user],
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
        amount: data.amount || 0,
        categoryId: data.categoryId || null,
        walletId: data.walletId || null,
        description: data.description || '',
        active: data.active !== false,
        createdAt: Date.now(),
      }
      backend
        .addTemplate(user.uid, t)
        .then(() => backend.applyRecurring(user.uid, currentMonthId))
        .catch(console.error)
        .finally(refreshTemplates)
    },
    [user, currentMonthId, refreshTemplates],
  )

  const updateTemplate = useCallback(
    (id, patch) => {
      if (!user) return
      backend
        .updateTemplate(user.uid, id, patch)
        .then(() => backend.applyRecurring(user.uid, currentMonthId))
        .catch(console.error)
        .finally(refreshTemplates)
    },
    [user, currentMonthId, refreshTemplates],
  )

  const removeTemplate = useCallback(
    (id) => {
      if (!user) return
      backend.removeTemplate(user.uid, id).then(refreshTemplates).catch(console.error)
    },
    [user, refreshTemplates],
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
      login,
      signup,
      logout,
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
      templates,
      addTemplate,
      updateTemplate,
      removeTemplate,
    }),
    [
      user, authReady, ready, wallets, months, currentMonthId, currentMonth,
      login, signup, logout, switchMonth, startNewMonth,
      addWallet, updateWallet, deleteWallet,
      addIncome, updateIncome, removeIncome, setCarryOver, setMonthNote,
      addCategory, updateCategory, removeCategory,
      addTransaction, updateTransaction, removeTransaction,
      templates, addTemplate, updateTemplate, removeTemplate,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import backend from './backend.js'
import { useAuth } from './AuthContext.jsx'
import { useData } from './DataContext.jsx'
import { monthIdOf, addMonths, labelOf, todayISO } from '../lib/dates.js'
import { uid, slugify } from '../lib/id.js'
import { categoryUsed, carryOverAmount } from '../lib/calc.js'

const MonthContext = createContext(null)

// identitas kategori stabil antar bulan: key (slug) bila ada, fallback nama
const catKey = (c) => (c && (c.key || c.name)) || ''

export function MonthProvider({ children }) {
  const { user, authReady } = useAuth()
  const { wallets, walletsReceived, months, mutate } = useData()
  const [currentMonthId, setCurrentMonthId] = useState(() => monthIdOf(new Date()))

  const monthIds = Object.keys(months)
  // ponytail: fallback ke bulan terbaru bila bulan kalender belum ada di data
  const activeMonthId = months[currentMonthId]
    ? currentMonthId
    : [...monthIds].sort().reverse()[0] || currentMonthId
  const currentMonth = months[activeMonthId]
  const ready =
    authReady &&
    (!user || (walletsReceived && (!monthIds.length || (!!currentMonth?.categories && !!currentMonth?.transactions))))

  useEffect(() => {
    if (!user || !walletsReceived) return
    const ids = Object.keys(months)
    if (ids.length === 0) {
      mutate(backend.ensureMonth(user.uid, currentMonthId), 'Gagal menyiapkan bulan')
    } else if (!months[currentMonthId]) {
      const latest = [...ids].sort().reverse()[0]
      if (latest && latest !== currentMonthId) setCurrentMonthId(latest)
    }
  }, [user, walletsReceived, months])

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

  const startNewMonth = useCallback((budgetTemplate = null) => {
    if (!user) return
    const cur = months[currentMonthId]
    const nextId = addMonths(currentMonthId, 1)
    const carry = cur ? carryOverAmount(cur) : 0
    const txs = cur?.transactions || []
    const cats = budgetTemplate?.categories?.length
      ? budgetTemplate.categories.map((c, order) => ({
          id: uid(),
          key: c.key || slugify(c.name),
          name: c.name,
          budgetAmount: c.budgetAmount || 0,
          goalAmount: c.goalAmount || 0,
          goalDeadline: c.goalDeadline || '',
          savedAmount: 0,
          color: c.color,
          order,
        }))
      : (cur?.categories || []).map((c) => {
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

  const saveBudgetTemplate = useCallback(
    (name) => {
      if (!user || !name?.trim()) return Promise.resolve()
      const categories = (currentMonth?.categories || []).map((c, order) => ({
        key: c.key || slugify(c.name),
        name: c.name,
        budgetAmount: c.budgetAmount || 0,
        goalAmount: c.goalAmount || 0,
        goalDeadline: c.goalDeadline || '',
        color: c.color,
        order,
      }))
      return mutate(
        backend.addBudgetTemplate(user.uid, { id: uid(), name: name.trim(), categories, createdAt: Date.now() }),
        'Gagal menyimpan template budget',
      )
    },
    [user, currentMonth, mutate],
  )

  const removeBudgetTemplate = useCallback(
    (id) => {
      if (!user) return Promise.resolve()
      return mutate(backend.removeBudgetTemplate(user.uid, id), 'Gagal menghapus template budget')
    },
    [user, mutate],
  )

  // --- incomes (transaksi type='income' — satu sumber kebenaran, masuk Riwayat) ---
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
      const save = targetId !== mId
        ? backend.ensureMonth(user.uid, targetId).then(() => backend.setTransaction(user.uid, targetId, tx))
        : backend.setTransaction(user.uid, targetId, tx)
      return mutate(save, 'Gagal menyimpan transaksi')
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
          // ponytail: move 2 langkah diikat dalam satu helper (sequence, bukan txn DB)
          mutate(backend.moveTransaction(user.uid, mId, txId, targetId, newTx), 'Gagal menyimpan transaksi')
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

  // tarik tabungan: uang keluar dari rekening (expense di pocket tabungan) + savedAmount berkurang
  const useGoal = useCallback(
    (mId, categoryId, amount, description) => {
      if (!user || amount <= 0) return
      const cat = (months[mId]?.categories || []).find((c) => c.id === categoryId)
      if (!cat) return
      addTransaction(mId, {
        date: todayISO(),
        type: 'expense',
        amount,
        categoryId,
        walletId: wallets[0]?.id || null,
        description: description || `Pakai tabungan ${cat.name}`,
      })
      updateCategory(mId, categoryId, { savedAmount: Math.max(0, (cat.savedAmount || 0) - amount) })
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
        skipMonths: Array.isArray(data.skipMonths) ? data.skipMonths : [],
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
      ready,
      currentMonthId: activeMonthId,
      currentMonth,
      switchMonth,
      startNewMonth,
      saveBudgetTemplate,
      removeBudgetTemplate,
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
      useGoal,
      addTemplate,
      updateTemplate,
      removeTemplate,
    }),
    [
      ready, activeMonthId, currentMonth,
      switchMonth, startNewMonth, saveBudgetTemplate, removeBudgetTemplate,
      addWallet, updateWallet, deleteWallet,
      addIncome, updateIncome, removeIncome, setCarryOver, setMonthNote,
      addCategory, updateCategory, removeCategory,
      addTransaction, updateTransaction, removeTransaction, saveToGoal, useGoal,
      addTemplate, updateTemplate, removeTemplate,
    ],
  )

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  return useContext(MonthContext)
}

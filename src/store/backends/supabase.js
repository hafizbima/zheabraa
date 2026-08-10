import { supabase } from '../../supabase/init.js'
import { monthIdOf } from '../../lib/dates.js'
import { createBlankMonth, defaultWallets } from '../defaults.js'

function needClient() {
  if (!supabase) throw new Error('Konfigurasi Supabase belum diisi. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env')
}

// --- row <-> shape mapping ---
const WALLET_FIELDS = { name: 'name', color: 'color', openingBalance: 'opening_balance', order: 'sort_order', deleted: 'deleted' }
const MONTH_FIELDS = { label: 'label', carryOver: 'carry_over', incomes: 'incomes', createdAt: 'created_at' }
const CAT_FIELDS = { name: 'name', budgetAmount: 'budget_amount', color: 'color', order: 'sort_order' }
const TX_FIELDS = { date: 'date', amount: 'amount', type: 'type', categoryId: 'category_id', walletId: 'wallet_id', description: 'description', createdAt: 'created_at' }

function mapWallet(r) {
  return { id: r.id, name: r.name, color: r.color, openingBalance: r.opening_balance, order: r.sort_order }
}
function mapMonth(r) {
  return {
    id: r.id,
    label: r.label,
    carryOver: r.carry_over,
    incomes: Array.isArray(r.incomes) ? r.incomes : [],
    createdAt: Number(r.created_at) || Date.now(),
  }
}
function mapCategory(r) {
  return { id: r.id, name: r.name, budgetAmount: r.budget_amount, color: r.color, order: r.sort_order }
}
function mapTransaction(r) {
  return {
    id: r.id,
    date: r.date,
    amount: r.amount,
    type: r.type,
    categoryId: r.category_id,
    walletId: r.wallet_id,
    description: r.description,
    createdAt: Number(r.created_at) || 0,
  }
}

function toSnake(fields) {
  return (row) => {
    const out = {}
    for (const [k, col] of Object.entries(fields)) {
      if (row[k] !== undefined && row[k] !== null) out[col] = row[k]
    }
    return out
  }
}
const walletRow = toSnake(WALLET_FIELDS)
const monthRow = toSnake(MONTH_FIELDS)
const categoryRow = toSnake(CAT_FIELDS)
const txRow = toSnake(TX_FIELDS)

function throwIfError(r) {
  if (r.error) throw r.error
  return r.data
}

// --- auth ---
function mapUser(u) {
  return {
    uid: u.id,
    email: u.email || '',
    displayName: u.user_metadata?.display_name || (u.email || '').split('@')[0] || 'User',
  }
}

export function onAuthChange(cb) {
  needClient()
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user || null
    cb(u ? mapUser(u) : null)
    if (u) ensureSeeded(u.id).catch(console.error)
  })
  return data?.subscription?.unsubscribe
}

export async function signIn(email, password) {
  needClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return mapUser(data.user)
}

export async function signUp(email, password, displayName) {
  needClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || '' } },
  })
  if (error) throw error
  if (!data.session) throw new Error('Akun dibuat. Silakan cek email untuk konfirmasi, lalu masuk.')
  return mapUser(data.user)
}

export async function signOut() {
  needClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function ensureSeeded(uid) {
  needClient()
  const { count, error } = await supabase
    .from('wallets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
  if (error) throw error
  if (count > 0) return

  const mId = monthIdOf(new Date())
  const blank = createBlankMonth(mId)
  const now = Date.now()
  const wallets = defaultWallets().map((w) => ({
    id: w.id,
    user_id: uid,
    name: w.name,
    color: w.color,
    opening_balance: w.openingBalance,
    sort_order: w.order,
    deleted: false,
  }))
  const categories = blank.categories.map((c) => ({
    id: c.id,
    user_id: uid,
    month_id: mId,
    name: c.name,
    budget_amount: c.budgetAmount,
    color: c.color,
    sort_order: c.order,
  }))
  const month = {
    id: blank.id,
    user_id: uid,
    label: blank.label,
    carry_over: 0,
    incomes: blank.incomes,
    created_at: blank.createdAt || now,
  }
  const res = await supabase
    .from('wallets')
    .upsert(wallets)
    .select()
  if (res.error) throw res.error
  const res2 = await supabase.from('months').upsert(month).select()
  if (res2.error) throw res2.error
  const res3 = await supabase.from('categories').upsert(categories).select()
  if (res3.error) throw res3.error
}

// --- subscriptions ---
function onTableChange(uid, table, cb) {
  needClient()
  let alive = true
  const refresh = () => {
    if (alive) cb()
  }
  refresh()
  const channel = supabase
    .channel(`gmm-${table}-${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
    .subscribe()
  return () => {
    alive = false
    supabase.removeChannel(channel)
  }
}

export function subscribeWallets(uid, cb) {
  needClient()
  const emit = async () => {
    const data = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true })
    if (data.error) return console.error(data.error)
    cb((data.data || []).filter((w) => !w.deleted).map(mapWallet))
  }
  const un = onTableChange(uid, 'wallets', emit)
  return un
}

export function subscribeMonths(uid, cb) {
  needClient()
  const emit = async () => {
    const data = await supabase.from('months').select('*').eq('user_id', uid)
    if (data.error) return console.error(data.error)
    cb((data.data || []).map(mapMonth))
  }
  return onTableChange(uid, 'months', emit)
}

export function subscribeMonthDetail(uid, mId, cb) {
  needClient()
  let alive = true
  let cats = []
  let txs = []
  const emit = () => {
    if (alive) cb({ categories: cats, transactions: txs })
  }
  const load = async () => {
    const [c, t] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', uid).eq('month_id', mId).order('sort_order', { ascending: true }),
      supabase.from('transactions').select('*').eq('user_id', uid).eq('month_id', mId).order('created_at', { ascending: false }),
    ])
    if (!alive) return
    if (c.error || t.error) return console.error(c.error || t.error)
    cats = (c.data || []).map(mapCategory)
    txs = (t.data || []).map(mapTransaction)
    emit()
  }
  const unC = onTableChange(uid, 'categories', load)
  const unT = onTableChange(uid, 'transactions', load)
  return () => {
    alive = false
    unC()
    unT()
  }
}

// --- wallets ---
export async function setWallet(uid, w) {
  needClient()
  return throwIfError(
    await supabase.from('wallets').upsert({ id: w.id, user_id: uid, ...walletRow(w) }),
  )
}
export async function updateWallet(uid, id, patch) {
  needClient()
  return throwIfError(
    await supabase.from('wallets').update(walletRow(patch)).eq('id', id).eq('user_id', uid),
  )
}
export async function removeWallet(uid, id) {
  needClient()
  return throwIfError(
    await supabase.from('wallets').update({ deleted: true }).eq('id', id).eq('user_id', uid),
  )
}

// --- months ---
export async function setMonth(uid, month) {
  needClient()
  return throwIfError(
    await supabase.from('months').upsert({ id: month.id, user_id: uid, ...monthRow(month) }),
  )
}
export async function ensureMonth(uid, mId) {
  needClient()
  const existing = await supabase.from('months').select('id').eq('id', mId).eq('user_id', uid)
  if (existing.error) throw existing.error
  if (existing.data && existing.data.length) return
  const blank = createBlankMonth(mId)
  const res = await supabase.from('months').upsert({
    id: blank.id,
    user_id: uid,
    label: blank.label,
    carry_over: 0,
    incomes: blank.incomes,
    created_at: blank.createdAt,
  })
  if (res.error) throw res.error
  const cats = blank.categories.map((c) => ({
    id: c.id,
    user_id: uid,
    month_id: mId,
    name: c.name,
    budget_amount: c.budgetAmount,
    color: c.color,
    sort_order: c.order,
  }))
  const res2 = await supabase.from('categories').upsert(cats)
  if (res2.error) throw res2.error
}
export async function createNextMonth(uid, mId, carryOver, cats) {
  needClient()
  const existing = await supabase.from('months').select('id').eq('id', mId).eq('user_id', uid)
  if (existing.error) throw existing.error
  if (existing.data && existing.data.length) return
  const blank = createBlankMonth(mId)
  const res = await supabase.from('months').upsert({
    id: blank.id,
    user_id: uid,
    label: blank.label,
    carry_over: carryOver || 0,
    incomes: blank.incomes,
    created_at: blank.createdAt,
  })
  if (res.error) throw res.error
  const list = cats && cats.length ? cats : blank.categories
  const rows = list.map((c) => ({
    id: c.id,
    user_id: uid,
    month_id: mId,
    name: c.name,
    budget_amount: c.budgetAmount || 0,
    color: c.color,
    sort_order: c.order || 0,
  }))
  const res2 = await supabase.from('categories').upsert(rows)
  if (res2.error) throw res2.error
}

// --- categories ---
export async function setCategory(uid, mId, cat) {
  needClient()
  return throwIfError(
    await supabase
      .from('categories')
      .upsert({ id: cat.id, user_id: uid, month_id: mId, ...categoryRow(cat) }),
  )
}
export async function updateCategory(uid, mId, id, patch) {
  needClient()
  return throwIfError(
    await supabase
      .from('categories')
      .update(categoryRow(patch))
      .eq('id', id)
      .eq('user_id', uid)
      .eq('month_id', mId),
  )
}
export async function removeCategory(uid, mId, id) {
  needClient()
  const moved = await supabase
    .from('transactions')
    .update({ category_id: null })
    .eq('category_id', id)
    .eq('user_id', uid)
    .eq('month_id', mId)
  if (moved.error) throw moved.error
  return throwIfError(
    await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', uid)
      .eq('month_id', mId),
  )
}

// --- transactions ---
export async function setTransaction(uid, mId, tx) {
  needClient()
  return throwIfError(
    await supabase.from('transactions').upsert({
      id: tx.id,
      user_id: uid,
      month_id: mId,
      created_at: tx.createdAt || Date.now(),
      ...txRow(tx),
    }),
  )
}
export async function updateTransaction(uid, mId, id, patch) {
  needClient()
  return throwIfError(
    await supabase
      .from('transactions')
      .update(txRow(patch))
      .eq('id', id)
      .eq('user_id', uid)
      .eq('month_id', mId),
  )
}
export async function removeTransaction(uid, mId, id) {
  needClient()
  return throwIfError(
    await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', uid)
      .eq('month_id', mId),
  )
}

export default {
  mode: 'supabase',
  onAuthChange,
  signIn,
  signUp,
  signOut,
  ensureSeeded,
  subscribeWallets,
  subscribeMonths,
  subscribeMonthDetail,
  setWallet,
  updateWallet,
  removeWallet,
  setMonth,
  ensureMonth,
  createNextMonth,
  setCategory,
  updateCategory,
  removeCategory,
  setTransaction,
  updateTransaction,
  removeTransaction,
}

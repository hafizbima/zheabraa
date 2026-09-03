import { supabase } from '../../supabase/init.js'
import { monthIdOf } from '../../lib/dates.js'
import { createBlankMonth, defaultWallets } from '../defaults.js'

function needClient() {
  if (!supabase) throw new Error('Konfigurasi Supabase belum diisi. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env')
}

// --- row <-> shape mapping ---
const WALLET_FIELDS = { name: 'name', color: 'color', openingBalance: 'opening_balance', order: 'sort_order', deleted: 'deleted' }
const MONTH_FIELDS = { label: 'label', carryOver: 'carry_over', incomes: 'incomes', note: 'note', createdAt: 'created_at' }
const CAT_FIELDS = { name: 'name', budgetAmount: 'budget_amount', goalAmount: 'goal_amount', savedAmount: 'saved_amount', color: 'color', key: 'key', order: 'sort_order' }
const TX_FIELDS = { date: 'date', amount: 'amount', type: 'type', categoryId: 'category_id', walletId: 'wallet_id', toWalletId: 'to_wallet_id', description: 'description', createdAt: 'created_at' }
const TEMPLATE_FIELDS = { dayOfMonth: 'day_of_month', type: 'type', amount: 'amount', categoryId: 'category_id', walletId: 'wallet_id', toWalletId: 'to_wallet_id', description: 'description', active: 'active', createdAt: 'created_at' }

function mapWallet(r) {
  return { id: r.id, name: r.name, color: r.color, openingBalance: r.opening_balance, order: r.sort_order }
}
function mapMonth(r) {
  return {
    id: r.id,
    label: r.label,
    carryOver: r.carry_over,
    incomes: Array.isArray(r.incomes) ? r.incomes : [],
    note: r.note || '',
    createdAt: Number(r.created_at) || Date.now(),
  }
}
function mapCategory(r) {
  return { id: r.id, name: r.name, budgetAmount: r.budget_amount, goalAmount: Number(r.goal_amount) || 0, savedAmount: Number(r.saved_amount) || 0, color: r.color, key: r.key || null, order: r.sort_order }
}
function mapTransaction(r) {
  return {
    id: r.id,
    date: r.date,
    amount: r.amount,
    type: r.type,
    categoryId: r.category_id,
    walletId: r.wallet_id,
    toWalletId: r.to_wallet_id,
    description: r.description,
    createdAt: Number(r.created_at) || 0,
  }
}

function toSnake(fields) {
  return (row) => {
    const out = {}
    for (const [k, col] of Object.entries(fields)) {
      if (row[k] !== undefined) out[col] = row[k]
    }
    return out
  }
}
const walletRow = toSnake(WALLET_FIELDS)
const monthRow = toSnake(MONTH_FIELDS)
const categoryRow = toSnake(CAT_FIELDS)
const txRow = toSnake(TX_FIELDS)
const templateRow = toSnake(TEMPLATE_FIELDS)

function throwIfError(r) {
  if (r.error) throw r.error
  return r.data
}

function isMissingTable(err) {
  return !!err && (err.code === 'PGRST205' || /Could not find the table/i.test(err.message || ''))
}

function isMissingKeyCol(err) {
  return !!err && err.code === 'PGRST204' && /'key' column of 'categories'/.test(err.message || '')
}

let keyColumnOk = true
function stripKey(r) { if (keyColumnOk) return r; const { key, ...rest } = r; return rest }
async function withKeyFallback(run) {
  if (!keyColumnOk) return run()
  try { return await run() }
  catch (e) {
    if (isMissingKeyCol(e)) { keyColumnOk = false; return run() }
    throw e
  }
}

function mapTemplate(r) {
  return {
    id: r.id,
    dayOfMonth: r.day_of_month,
    type: r.type || 'expense',
    amount: r.amount,
    categoryId: r.category_id,
    walletId: r.wallet_id,
    toWalletId: r.to_wallet_id,
    description: r.description,
    active: r.active !== false,
    createdAt: Number(r.created_at) || 0,
  }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

async function applyRecurringForMonth(uid, mId) {
  const { data, error } = await supabase
    .from('recurring_templates')
    .select('*')
    .eq('user_id', uid)
    .eq('active', true)
  if (error) throw error
  const now = new Date()
  const curMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
  const todayDay = now.getDate()
  const txRows = []
  const incomeRows = []
  for (const t of data || []) {
    const day = Math.min(28, Math.max(1, t.day_of_month))
    if (mId < curMonth) continue
    if (mId === curMonth && day > todayDay) continue
    if (t.type === 'income') {
      incomeRows.push({
        id: `recur-${t.id}-${mId}`,
        label: t.description || 'Pemasukan berulang',
        amount: t.amount || 0,
      })
      continue
    }
    if (t.type === 'transfer') {
      txRows.push({
        id: `recur-${t.id}-${mId}-${pad2(day)}`,
        user_id: uid,
        month_id: mId,
        date: `${mId}-${pad2(day)}`,
        amount: t.amount || 0,
        type: 'transfer',
        category_id: null,
        wallet_id: t.wallet_id || null,
        to_wallet_id: t.to_wallet_id || null,
        description: t.description || 'Transfer berulang',
        created_at: Date.now(),
      })
      continue
    }
    txRows.push({
      id: `recur-${t.id}-${mId}-${pad2(day)}`,
      user_id: uid,
      month_id: mId,
      date: `${mId}-${pad2(day)}`,
      amount: t.amount || 0,
      type: 'expense',
      category_id: t.category_id || null,
      wallet_id: t.wallet_id || null,
      description: t.description || 'Transaksi berulang',
      created_at: Date.now(),
    })
  }
  let generated = false
  if (txRows.length) {
    const res = await supabase.from('transactions').upsert(txRows)
    if (res.error) throw res.error
    generated = true
  }
  if (incomeRows.length) {
    const list = await supabase.from('months').select('*').eq('id', mId).eq('user_id', uid)
    if (list.error) throw list.error
    const existing = Array.isArray(list.data?.[0]?.incomes) ? list.data[0].incomes : []
    const ids = new Set(incomeRows.map((i) => i.id))
    const res = await supabase
      .from('months')
      .update({ incomes: existing.filter((i) => !ids.has(i.id)).concat(incomeRows) })
      .eq('id', mId)
      .eq('user_id', uid)
    if (res.error) throw res.error
    generated = true
  }
  return generated
}

const recurringGenerated = new Set()

async function applyRecurringQuiet(uid, mId) {
  const key = `${uid}|${mId}`
  if (recurringGenerated.has(key)) return false
  recurringGenerated.add(key)
  try {
    return await applyRecurringForMonth(uid, mId)
  } catch (e) {
    recurringGenerated.delete(key)
    if (!isMissingTable(e)) console.error('applyRecurring', e)
    return false
  }
}

export async function applyRecurring(uid, mId) {
  needClient()
  await applyRecurringForMonth(uid, mId)
}

// --- load all (tanpa realtime) ---
export async function loadAll(uid) {
  needClient()
  const [w, m, c, t, tpl] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', uid).order('sort_order', { ascending: true }),
    supabase.from('months').select('*').eq('user_id', uid),
    supabase.from('categories').select('*').eq('user_id', uid),
    supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('recurring_templates').select('*').eq('user_id', uid).order('day_of_month', { ascending: true }),
  ])
  for (const r of [w, m, c, t]) if (r.error) throw r.error
  if (tpl.error && !isMissingTable(tpl.error)) throw tpl.error

  const wallets = (w.data || []).filter((x) => !x.deleted).map(mapWallet)
  const months = {}
  for (const r of m.data || []) {
    const mm = mapMonth(r)
    mm.categories = []
    mm.transactions = []
    months[r.id] = mm
  }
  for (const r of c.data || []) {
    const mm = months[r.month_id]
    if (mm) mm.categories.push(mapCategory(r))
  }
  for (const r of t.data || []) {
    const mm = months[r.month_id]
    if (mm) mm.transactions.push(mapTransaction(r))
  }

  // generate recurring untuk bulan berjalan & mendatang (sekali, via recurringGenerated set)
  const now = new Date()
  const curMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
  let generated = false
  for (const mId of Object.keys(months)) {
    if (mId >= curMonth && (await applyRecurringQuiet(uid, mId))) generated = true
  }
  if (generated) {
    const [m2, t2] = await Promise.all([
      supabase.from('months').select('*').eq('user_id', uid),
      supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ])
    if (!m2.error) for (const r of m2.data || []) {
      const mm = months[r.id]
      if (mm) Object.assign(mm, mapMonth(r), { categories: mm.categories, transactions: mm.transactions })
    }
    if (!t2.error) {
      for (const r of t2.data || []) {
        const mm = months[r.month_id]
        if (!mm) continue
        const tx = mapTransaction(r)
        const i = mm.transactions.findIndex((x) => x.id === tx.id)
        if (i >= 0) mm.transactions[i] = tx
        else mm.transactions.push(tx)
      }
    }
  }

  const templates = (tpl.data || []).map(mapTemplate)
  return { wallets, months, templates }
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

export async function resetPassword(email) {
  needClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function ensureSeeded(uid) {
  needClient()
  const mId = monthIdOf(new Date())
  const blank = createBlankMonth(mId)
  const now = Date.now()

  const { count: walletCount, error: wErr } = await supabase
    .from('wallets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
  if (wErr) throw wErr

  const { count: monthCount, error: mErr } = await supabase
    .from('months')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
  if (mErr) throw mErr

  if (walletCount === 0) {
    const wallets = defaultWallets().map((w) => ({
      id: w.id,
      user_id: uid,
      name: w.name,
      color: w.color,
      opening_balance: w.openingBalance,
      sort_order: w.order,
      deleted: false,
    }))
    const res = await supabase.from('wallets').upsert(wallets).select()
    if (res.error) throw res.error
  }

  if (monthCount === 0) {
    const month = {
      id: blank.id,
      user_id: uid,
      label: blank.label,
      carry_over: 0,
      incomes: blank.incomes,
      created_at: blank.createdAt || now,
    }
    const categories = blank.categories.map((c) => ({
      id: c.id,
      user_id: uid,
      month_id: mId,
      name: c.name,
      key: c.key || null,
      budget_amount: c.budgetAmount,
      saved_amount: c.savedAmount || 0,
      color: c.color,
      sort_order: c.order,
    }))
    const res = await supabase.from('months').upsert(month).select()
    if (res.error) throw res.error
    await withKeyFallback(async () => {
      const res2 = await supabase.from('categories').upsert(categories.map(stripKey))
      if (res2.error) throw res2.error
    })
    await applyRecurringQuiet(uid, mId)
  }
}

// --- subscriptions ---
export function channelName(table, uid, scope = '') {
  return `gmm-${table}-${uid}${scope ? '-' + scope : ''}`
}

function onTableChange(uid, table, cb, scope = '') {
  needClient()
  let alive = true
  const refresh = () => {
    if (alive) cb()
  }
  refresh()
  const channel = supabase
    .channel(channelName(table, uid, scope))
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
    const generated = await applyRecurringQuiet(uid, mId)
    if (generated && alive) {
      const t2 = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .eq('month_id', mId)
        .order('created_at', { ascending: false })
      if (t2.error) return console.error(t2.error)
      txs = (t2.data || []).map(mapTransaction)
      emit()
    }
  }
  const unC = onTableChange(uid, 'categories', load, mId)
  const unT = onTableChange(uid, 'transactions', load, mId)
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
    key: c.key || null,
    budget_amount: c.budgetAmount,
    saved_amount: c.savedAmount || 0,
    color: c.color,
    sort_order: c.order,
  }))
  await withKeyFallback(async () => {
    const res2 = await supabase.from('categories').upsert(cats.map(stripKey))
    if (res2.error) throw res2.error
  })
  await applyRecurringQuiet(uid, mId)
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
    key: c.key || null,
    budget_amount: c.budgetAmount || 0,
    saved_amount: c.savedAmount || 0,
    color: c.color,
    sort_order: c.order || 0,
  }))
  await withKeyFallback(async () => {
    const res2 = await supabase.from('categories').upsert(rows.map(stripKey))
    if (res2.error) throw res2.error
  })
  await applyRecurringQuiet(uid, mId)
}

// --- recurring templates ---
export async function listTemplates(uid) {
  needClient()
  const { data, error } = await supabase
    .from('recurring_templates')
    .select('*')
    .eq('user_id', uid)
    .order('day_of_month', { ascending: true })
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return (data || []).map(mapTemplate)
}
export async function addTemplate(uid, t) {
  needClient()
  const res = await supabase.from('recurring_templates').upsert({ id: t.id, user_id: uid, ...templateRow(t) })
  if (res.error && !isMissingTable(res.error)) throw res.error
  return res.data
}
export async function updateTemplate(uid, id, patch) {
  needClient()
  const res = await supabase
    .from('recurring_templates')
    .update(templateRow(patch))
    .eq('id', id)
    .eq('user_id', uid)
  if (res.error && !isMissingTable(res.error)) throw res.error
  return res.data
}
export async function removeTemplate(uid, id) {
  needClient()
  const res = await supabase.from('recurring_templates').delete().eq('id', id).eq('user_id', uid)
  if (res.error && !isMissingTable(res.error)) throw res.error
  return res.data
}

// --- categories ---
export async function setCategory(uid, mId, cat) {
  needClient()
  return withKeyFallback(async () => {
    const row = stripKey(categoryRow(cat))
    return throwIfError(
      await supabase.from('categories').upsert({ id: cat.id, user_id: uid, month_id: mId, ...row }),
    )
  })
}
export async function updateCategory(uid, mId, id, patch) {
  needClient()
  return withKeyFallback(async () => {
    const row = stripKey(categoryRow(patch))
    return throwIfError(
      await supabase
        .from('categories')
        .update(row)
        .eq('id', id)
        .eq('user_id', uid)
        .eq('month_id', mId),
    )
  })
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
  loadAll,
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
  listTemplates,
  addTemplate,
  updateTemplate,
  removeTemplate,
  applyRecurring,
  resetPassword,
}

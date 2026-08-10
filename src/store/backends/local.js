import { monthIdOf } from '../../lib/dates.js'
import { createBlankMonth, defaultWallets } from '../defaults.js'

const AUTH_KEY = 'gmm:auth'
const PREFIX = 'gmm:v1'

const store = {
  user: null, // { uid, email, displayName }
  wallets: [],
  months: {}, // id -> { id, label, carryOver, incomes, createdAt }
  categories: {}, // id -> []
  transactions: {}, // id -> []
  subs: { auth: [], wallets: [], months: [], detail: {} },
}

function loadJSON(k) {
  try {
    const r = localStorage.getItem(k)
    return r ? JSON.parse(r) : null
  } catch {
    return null
  }
}
function saveJSON(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage unavailable */
  }
}

function migrate(raw) {
  const months = {}
  const categories = {}
  const transactions = {}
  for (const [id, m] of Object.entries(raw.months || {})) {
    months[id] = {
      id: m.id || id,
      label: m.label || id,
      carryOver: m.carryOver || 0,
      incomes: m.incomes || [],
      createdAt: m.createdAt || Date.now(),
    }
    if (Array.isArray(m.categories)) categories[id] = m.categories
    if (Array.isArray(m.transactions)) transactions[id] = m.transactions
  }
  return { wallets: raw.wallets || [], months, categories, transactions }
}

function persist() {
  if (!store.user) return
  saveJSON(`${PREFIX}:${store.user.uid}`, {
    wallets: store.wallets,
    months: store.months,
    categories: store.categories,
    transactions: store.transactions,
  })
}

function seed() {
  store.wallets = defaultWallets()
  const mId = monthIdOf(new Date())
  const blank = createBlankMonth(mId)
  store.months = {
    [mId]: { id: blank.id, label: blank.label, carryOver: 0, incomes: blank.incomes, createdAt: blank.createdAt },
  }
  store.categories = { [mId]: blank.categories }
  store.transactions = { [mId]: [] }
}

function load(uid) {
  const raw = loadJSON(`${PREFIX}:${uid}`)
  if (raw) {
    const migrated = migrate(raw)
    store.wallets = migrated.wallets
    store.months = migrated.months
    store.categories = migrated.categories
    store.transactions = migrated.transactions
  } else {
    seed()
  }
}

function emitAuth() {
  store.subs.auth.forEach((cb) => cb(store.user))
}
function emitWallets() {
  store.subs.wallets.forEach((cb) => cb([...store.wallets]))
}
function emitMonths() {
  store.subs.months.forEach((cb) => cb(Object.values(store.months)))
}
function emitDetail(mId) {
  store.subs.detail[mId]?.forEach((cb) =>
    cb({ categories: store.categories[mId] || [], transactions: store.transactions[mId] || [] }),
  )
}
function emitAll() {
  emitAuth()
  emitWallets()
  emitMonths()
  Object.keys(store.months).forEach(emitDetail)
}

function init() {
  const saved = loadJSON(AUTH_KEY)
  if (saved) {
    store.user = saved
    load(saved.uid)
  }
}

export function reset() {
  store.user = null
  store.wallets = []
  store.months = {}
  store.categories = {}
  store.transactions = {}
  store.subs = { auth: [], wallets: [], months: [], detail: {} }
  saveJSON(AUTH_KEY, null)
}

// --- auth ---
export function onAuthChange(cb) {
  cb(store.user)
  store.subs.auth.push(cb)
  return () => {
    store.subs.auth = store.subs.auth.filter((f) => f !== cb)
  }
}

export async function signIn(email, password, displayName) {
  const e = (email || '').trim().toLowerCase()
  if (!e) throw new Error('Email wajib diisi')
  if (!password || password.length < 6) throw new Error('Password minimal 6 karakter')
  const existing = loadJSON(`${PREFIX}:${e}`)
  const user = { uid: e, email: e, displayName: (displayName || '').trim() || e.split('@')[0] }
  store.user = user
  if (existing) load(e)
  else seed()
  saveJSON(AUTH_KEY, user)
  persist()
  emitAll()
  return user
}

export const signUp = signIn

export async function signOut() {
  store.user = null
  saveJSON(AUTH_KEY, null)
  emitAuth()
}

export async function ensureSeeded() {
  /* local backend seed otomatis saat signIn */
}

// --- subscriptions ---
export function subscribeWallets(uid, cb) {
  cb([...store.wallets])
  store.subs.wallets.push(cb)
  return () => {
    store.subs.wallets = store.subs.wallets.filter((f) => f !== cb)
  }
}

export function subscribeMonths(uid, cb) {
  cb(Object.values(store.months))
  store.subs.months.push(cb)
  return () => {
    store.subs.months = store.subs.months.filter((f) => f !== cb)
  }
}

export function subscribeMonthDetail(uid, mId, cb) {
  store.subs.detail[mId] = store.subs.detail[mId] || []
  store.subs.detail[mId].push(cb)
  emitDetail(mId)
  return () => {
    store.subs.detail[mId] = store.subs.detail[mId].filter((f) => f !== cb)
  }
}

// --- wallets ---
export function setWallet(uid, w) {
  const i = store.wallets.findIndex((x) => x.id === w.id)
  if (i >= 0) store.wallets[i] = { ...store.wallets[i], ...w }
  else store.wallets.push(w)
  persist()
  emitWallets()
  return Promise.resolve()
}
export function updateWallet(uid, id, patch) {
  const i = store.wallets.findIndex((x) => x.id === id)
  if (i >= 0) {
    store.wallets[i] = { ...store.wallets[i], ...patch }
    persist()
    emitWallets()
  }
  return Promise.resolve()
}
export function removeWallet(uid, id) {
  store.wallets = store.wallets.filter((x) => x.id !== id)
  persist()
  emitWallets()
  return Promise.resolve()
}

// --- months ---
export function setMonth(uid, month) {
  store.months[month.id] = { ...(store.months[month.id] || {}), ...month }
  persist()
  emitMonths()
  return Promise.resolve()
}
export function ensureMonth(uid, mId) {
  if (store.months[mId]) return Promise.resolve()
  const blank = createBlankMonth(mId)
  store.months[mId] = {
    id: blank.id,
    label: blank.label,
    carryOver: 0,
    incomes: blank.incomes,
    createdAt: blank.createdAt,
  }
  store.categories[mId] = blank.categories
  store.transactions[mId] = []
  persist()
  emitMonths()
  emitDetail(mId)
  return Promise.resolve()
}
export function createNextMonth(uid, mId, carryOver, cats) {
  if (store.months[mId]) return Promise.resolve()
  const blank = createBlankMonth(mId)
  store.months[mId] = {
    id: blank.id,
    label: blank.label,
    carryOver: carryOver || 0,
    incomes: blank.incomes,
    createdAt: blank.createdAt,
  }
  store.categories[mId] = cats && cats.length ? cats.map((c) => ({ ...c })) : blank.categories
  store.transactions[mId] = []
  persist()
  emitMonths()
  emitDetail(mId)
  return Promise.resolve()
}

// --- categories ---
export function setCategory(uid, mId, cat) {
  store.categories[mId] = store.categories[mId] || []
  const i = store.categories[mId].findIndex((c) => c.id === cat.id)
  if (i >= 0) store.categories[mId][i] = { ...store.categories[mId][i], ...cat }
  else store.categories[mId].push(cat)
  persist()
  emitDetail(mId)
  return Promise.resolve()
}
export function updateCategory(uid, mId, id, patch) {
  const list = store.categories[mId] || []
  const i = list.findIndex((c) => c.id === id)
  if (i >= 0) {
    list[i] = { ...list[i], ...patch }
    persist()
    emitDetail(mId)
  }
  return Promise.resolve()
}
export function removeCategory(uid, mId, id) {
  store.categories[mId] = (store.categories[mId] || []).filter((c) => c.id !== id)
  store.transactions[mId] = (store.transactions[mId] || []).map((t) =>
    t.categoryId === id ? { ...t, categoryId: null } : t,
  )
  persist()
  emitDetail(mId)
  return Promise.resolve()
}

// --- transactions ---
export function setTransaction(uid, mId, tx) {
  store.transactions[mId] = store.transactions[mId] || []
  const i = store.transactions[mId].findIndex((t) => t.id === tx.id)
  if (i >= 0) store.transactions[mId][i] = { ...store.transactions[mId][i], ...tx }
  else store.transactions[mId].unshift(tx)
  persist()
  emitDetail(mId)
  return Promise.resolve()
}
export function updateTransaction(uid, mId, id, patch) {
  const list = store.transactions[mId] || []
  const i = list.findIndex((t) => t.id === id)
  if (i >= 0) {
    list[i] = { ...list[i], ...patch }
    persist()
    emitDetail(mId)
  }
  return Promise.resolve()
}
export function removeTransaction(uid, mId, id) {
  store.transactions[mId] = (store.transactions[mId] || []).filter((t) => t.id !== id)
  persist()
  emitDetail(mId)
  return Promise.resolve()
}

init()

export default {
  mode: 'local',
  reset,
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

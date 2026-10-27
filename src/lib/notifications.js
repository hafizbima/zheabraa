import { categoryStatus, isRecurringBillPaid, safeDailySpend } from './calc.js'
import { formatRupiah } from './money.js'

const PREF_PREFIX = 'gmm:notifications:'
const SENT_PREFIX = 'gmm:notification-sent:'

function storageGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
}

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationsEnabled(uid) {
  return !!uid && notificationsSupported() && Notification.permission === 'granted' && storageGet(`${PREF_PREFIX}${uid}`) === '1'
}

export async function requestNotifications(uid) {
  if (!notificationsSupported()) return { granted: false, reason: 'unsupported' }
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      storageSet(`${PREF_PREFIX}${uid}`, '1')
      return { granted: true }
    }
    return { granted: false, reason: permission }
  } catch {
    return { granted: false, reason: 'error' }
  }
}

export function disableNotifications(uid) {
  if (uid) storageSet(`${PREF_PREFIX}${uid}`, '0')
}

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function notificationCandidates({ month, templates = [], referenceDate = new Date() }) {
  if (!month?.id) return []
  const currentMonthId = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`
  if (month.id !== currentMonthId) return []

  const candidates = []
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  for (const template of templates) {
    if (template.type !== 'bill' || template.active === false || (template.skipMonths || []).includes(month.id)) continue
    if (isRecurringBillPaid(month, template)) continue
    const day = Math.min(28, Math.max(1, template.dayOfMonth || 1))
    const due = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day)
    const daysUntil = Math.round((due - today) / 86400000)
    if (daysUntil > 3) continue
    const when = daysUntil < 0 ? 'sudah jatuh tempo' : daysUntil === 0 ? 'jatuh tempo hari ini' : `jatuh tempo ${daysUntil === 1 ? 'besok' : `dalam ${daysUntil} hari`}`
    candidates.push({
      id: `bill-${month.id}-${template.id}`,
      title: 'Tagihan perlu diperiksa',
      body: `${template.description || 'Tagihan'} ${when}.`,
    })
  }

  for (const category of month.categories || []) {
    const status = categoryStatus(category, month.transactions || [])
    if (status.budget <= 0 || status.pct < 90) continue
    candidates.push({
      id: `budget-${month.id}-${category.id}`,
      title: status.status === 'over' ? 'Budget terlampaui' : 'Budget hampir habis',
      body: `${category.name} sudah terpakai ${status.pct}% (${formatRupiah(status.used)} dari ${formatRupiah(status.budget)}).`,
    })
  }

  const daily = safeDailySpend(month, templates, referenceDate)
  if (daily.daysRemaining > 0 && daily.amount === 0 && daily.discretionaryLeft <= 0) {
    candidates.push({
      id: `daily-${month.id}`,
      title: 'Uang bebas habis',
      body: 'Batas aman pengeluaran harianmu sudah mencapai Rp 0.',
    })
  }
  return candidates
}

export async function sendNotificationOnce(uid, candidate, referenceDate = new Date()) {
  if (!notificationsEnabled(uid)) return false
  const key = `${SENT_PREFIX}${uid}:${isoDate(referenceDate)}:${candidate.id}`
  if (storageGet(key)) return false
  storageSet(key, '1')

  try {
    if (navigator.serviceWorker?.ready) {
      const registration = await navigator.serviceWorker.ready
      if (registration?.showNotification) {
        await registration.showNotification(candidate.title, { body: candidate.body, icon: '/pwa-icon-192.png', tag: candidate.id })
        return true
      }
    }
    new Notification(candidate.title, { body: candidate.body, icon: '/pwa-icon-192.png', tag: candidate.id })
    return true
  } catch {
    return false
  }
}

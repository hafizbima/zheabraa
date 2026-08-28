import backend from '../store/backend.js'

export function exportBackup({ wallets, months, templates }) {
  const data = { version: 1, exportedAt: Date.now(), wallets, months, templates }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zheabraa-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file, uid) {
  let data
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('File backup tidak valid')
  }
  if (!data.wallets || !data.months) throw new Error('File backup tidak valid')

  if (backend.mode === 'local') {
    await backend.restoreAll(uid, data)
    return
  }
  // ponytail: supabase di-push per record — lambat untuk data besar, cukup untuk backup pribadi
  for (const w of data.wallets) await backend.setWallet(uid, w)
  for (const mId of Object.keys(data.months)) {
    const m = data.months[mId]
    await backend.setMonth(uid, {
      id: mId,
      label: m.label || mId,
      carryOver: m.carryOver || 0,
      incomes: m.incomes || [],
      note: m.note || '',
      createdAt: m.createdAt || Date.now(),
    })
    for (const c of m.categories || []) await backend.setCategory(uid, mId, c)
    for (const t of m.transactions || []) await backend.setTransaction(uid, mId, t)
  }
  for (const t of data.templates || []) await backend.addTemplate(uid, t)
}

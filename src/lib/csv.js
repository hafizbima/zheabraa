function cleanHeader(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

export function parseCSV(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  const source = String(text || '').replace(/^\uFEFF/, '')

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        value += '"'
        i += 1
      } else if (ch === '"') {
        quoted = false
      } else {
        value += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(value)
      value = ''
    } else if (ch === '\n') {
      row.push(value)
      if (row.some((cell) => String(cell).trim() !== '')) rows.push(row)
      row = []
      value = ''
    } else if (ch !== '\r') {
      value += ch
    }
  }
  row.push(value)
  if (row.some((cell) => String(cell).trim() !== '')) rows.push(row)
  return rows
}

function columnIndex(headers, aliases) {
  const names = aliases.map(cleanHeader)
  return headers.findIndex((header) => names.includes(header))
}

function cell(row, index) {
  return index >= 0 ? String(row[index] || '').trim() : ''
}

function parseAmount(value) {
  const raw = String(value || '').trim()
  const negative = /^-/.test(raw)
  const digits = raw.replace(/[^0-9]/g, '')
  const amount = Number(digits || 0)
  return { amount, negative }
}

function parseDate(value) {
  const raw = String(value || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (match) return `${match[3]}-${String(match[2]).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`
  return ''
}

function normalizeType(value, amount) {
  const type = String(value || '').trim().toLowerCase()
  if (type.includes('income') || type.includes('pemasukan') || type.includes('credit') || type.includes('kredit')) return 'income'
  if (type.includes('refund') || type.includes('koreksi') || type.includes('refund')) return 'refund'
  if (type.includes('transfer')) return 'transfer'
  return amount.negative ? 'expense' : 'expense'
}

export function parseTransactionCSV(text) {
  const rows = parseCSV(text)
  if (rows.length < 2) throw new Error('CSV tidak memiliki data transaksi')

  const headers = rows[0].map(cleanHeader)
  const dateCol = columnIndex(headers, ['tanggal', 'date', 'transactiondate', 'transdate'])
  const typeCol = columnIndex(headers, ['tipe', 'type', 'transactiontype', 'kind'])
  const categoryCol = columnIndex(headers, ['kategori', 'category', 'pocket'])
  const walletCol = columnIndex(headers, ['dompet', 'wallet', 'account', 'rekening'])
  const descriptionCol = columnIndex(headers, ['keterangan', 'description', 'deskripsi', 'merchant', 'name', 'detail'])
  const amountCol = columnIndex(headers, ['nominal', 'amount', 'jumlah', 'value', 'total'])
  const debitCol = columnIndex(headers, ['debit', 'keluar', 'withdrawal'])
  const creditCol = columnIndex(headers, ['credit', 'kredit', 'masuk', 'deposit'])

  if (dateCol < 0) throw new Error('Kolom tanggal tidak ditemukan')
  if (amountCol < 0 && debitCol < 0 && creditCol < 0) throw new Error('Kolom nominal tidak ditemukan')

  const valid = []
  const errors = []
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i]
    const date = parseDate(cell(row, dateCol))
    const rawAmount = amountCol >= 0 ? cell(row, amountCol) : ''
    const debit = debitCol >= 0 ? parseAmount(cell(row, debitCol)) : { amount: 0, negative: false }
    const credit = creditCol >= 0 ? parseAmount(cell(row, creditCol)) : { amount: 0, negative: false }
    const parsedAmount = amountCol >= 0 ? parseAmount(rawAmount) : debit.amount > 0 ? debit : credit
    const type = amountCol >= 0 ? normalizeType(cell(row, typeCol), parsedAmount) : credit.amount > 0 ? 'income' : 'expense'
    const amount = parsedAmount.amount
    if (!date || amount <= 0) {
      errors.push(`Baris ${i + 1}: tanggal atau nominal tidak valid`)
      continue
    }

    let categoryName = cell(row, categoryCol)
    if (/^(uang bebas|free money|free)$/i.test(categoryName)) categoryName = ''
    const walletValue = cell(row, walletCol)
    const [walletName, toWalletName] = walletValue.split(/\s*(?:→|->)\s*/)
    valid.push({
      date,
      type,
      amount,
      categoryName,
      walletName: walletName || '',
      toWalletName: toWalletName || '',
      description: cell(row, descriptionCol) || categoryName || 'Import CSV',
    })
  }

  return { rows: valid, errors }
}

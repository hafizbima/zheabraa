import { describe, expect, it } from 'vitest'
import { parseCSV, parseTransactionCSV } from '../src/lib/csv.js'

describe('CSV transaction import', () => {
  it('parses quoted commas and escaped quotes', () => {
    expect(parseCSV('Tanggal,Keterangan,Nominal\n2026-10-01,"Kopi, susu",25000\n2026-10-02,"Dia bilang ""ok""",10000')).toEqual([
      ['Tanggal', 'Keterangan', 'Nominal'],
      ['2026-10-01', 'Kopi, susu', '25000'],
      ['2026-10-02', 'Dia bilang "ok"', '10000'],
    ])
  })

  it('maps the app export format and skips malformed rows', () => {
    const result = parseTransactionCSV([
      'Tanggal,Tipe,Kategori,Dompet,Keterangan,Nominal',
      '01/10/2026,Pengeluaran,Transport,Rekening Utama,Bensin,50.000',
      '2026-10-02,Pemasukan,,Rekening Utama,"Gaji, Oktober",5000000',
      'invalid,Pengeluaran,Uang Bebas,,Tidak valid,10.000',
    ].join('\n'))

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toMatchObject({ date: '2026-10-01', type: 'expense', categoryName: 'Transport', amount: 50000 })
    expect(result.rows[1]).toMatchObject({ type: 'income', description: 'Gaji, Oktober', amount: 5000000 })
    expect(result.errors).toHaveLength(1)
  })
})

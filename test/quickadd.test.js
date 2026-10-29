import { describe, it, expect } from 'vitest'
import { parseQuick } from '../src/components/QuickAdd.jsx'

describe('parseQuick unit tests', () => {
  const categories = [
    { id: 'cat-1', name: 'Makan' },
    { id: 'cat-2', name: 'Transport' },
    { id: 'cat-3', name: 'Skincare' },
  ]

  it('parses "makan 35k" correctly', () => {
    const res = parseQuick('makan 35k', categories)
    expect(res).toEqual({
      description: 'makan',
      amount: 35000,
      categoryId: undefined,
      type: 'expense',
    })
  })

  it('parses placeholder example "makan 35k skincare" without "ke"', () => {
    const res = parseQuick('makan 35k skincare', categories)
    expect(res).toEqual({
      description: 'makan',
      amount: 35000,
      categoryId: 'cat-3',
      type: 'expense',
    })
  })

  it('parses "makan 35k ke skincare" with "ke"', () => {
    const res = parseQuick('makan 35k ke skincare', categories)
    expect(res).toEqual({
      description: 'makan',
      amount: 35000,
      categoryId: 'cat-3',
      type: 'expense',
    })
  })

  it('parses placeholder example "gaji 5jt" as income', () => {
    const res = parseQuick('gaji 5jt', categories)
    expect(res).toEqual({
      description: 'gaji',
      amount: 5000000,
      categoryId: undefined,
      type: 'income',
    })
  })

  it('parses decimal suffix "bonus 1.5jt" without 10x bug', () => {
    const res = parseQuick('bonus 1.5jt', categories)
    expect(res).toEqual({
      description: 'bonus',
      amount: 1500000,
      categoryId: undefined,
      type: 'income',
    })
  })

  it('parses decimal suffix with comma "bonus 1,5jt"', () => {
    const res = parseQuick('bonus 1,5jt', categories)
    expect(res).toEqual({
      description: 'bonus',
      amount: 1500000,
      categoryId: undefined,
      type: 'income',
    })
  })

  it('parses thousands format "bensin 50.000 transport"', () => {
    const res = parseQuick('bensin 50.000 transport', categories)
    expect(res).toEqual({
      description: 'bensin',
      amount: 50000,
      categoryId: 'cat-2',
      type: 'expense',
    })
  })

  it('fallback when typing text without amount: keeps description rather than vanishing', () => {
    const res = parseQuick('makan siang di kantor', categories)
    expect(res).toEqual({
      description: 'makan siang di kantor',
      amount: '',
      categoryId: undefined,
      type: 'expense',
    })
  })

  it('returns null for empty string or whitespace', () => {
    expect(parseQuick('', categories)).toBeNull()
    expect(parseQuick('   ', categories)).toBeNull()
    expect(parseQuick(null, categories)).toBeNull()
  })
})


import { uid } from '../lib/id.js'
import { labelOf } from '../lib/dates.js'
import { CATEGORY_COLORS, WALLET_COLORS } from '../lib/palette.js'

export const DEFAULT_CATEGORY_NAMES = [
  'Transport',
  'Gym',
  'Date',
  'Giving',
  'Saving',
  'Skincare',
]

export function defaultCategories() {
  return DEFAULT_CATEGORY_NAMES.map((name, i) => ({
    id: uid(),
    name,
    budgetAmount: 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    order: i,
  }))
}

export function defaultWallets() {
  return [
    { id: uid(), name: 'Cash', color: WALLET_COLORS[0], openingBalance: 0, order: 0 },
    { id: uid(), name: 'Bank', color: WALLET_COLORS[1], openingBalance: 0, order: 1 },
    { id: uid(), name: 'E-Wallet', color: WALLET_COLORS[2], openingBalance: 0, order: 2 },
  ]
}

export function createBlankMonth(mId) {
  return {
    id: mId,
    label: labelOf(mId),
    carryOver: 0,
    incomes: [{ id: uid(), label: 'Gaji', amount: 0 }],
    categories: defaultCategories(),
    transactions: [],
    createdAt: Date.now(),
  }
}

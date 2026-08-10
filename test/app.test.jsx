import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import localBackend from '../src/store/backends/local.js'

import '@testing-library/jest-dom/vitest'

vi.mock('../src/store/backend.js', async () => {
  const local = await import('../src/store/backends/local.js')
  return { default: local.default }
})

const { default: App } = await import('../src/App.jsx')

beforeEach(() => {
  localStorage.clear()
  localBackend.reset()
  cleanup()
})

describe('Gimme Money smoke', () => {
  it('login -> dashboard -> add transaction -> history -> wallets', async () => {
    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, getAllByText, findByText } = render(<App />)

    // Login screen
    expect(getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Minimal 6 karakter'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Default category seeded
    expect(getByText('Transport')).toBeInTheDocument()
    expect(getAllByText('Dompet').length).toBeGreaterThan(0)

    // Open transaction form from category card
    await user.click(getByText('Transport'))
    await findByText('Tambah Transaksi')

    // Fill & save
    const amount = getByPlaceholderText('0')
    await user.type(amount, '50000')
    await user.click(getByRole('button', { name: 'Simpan' }))
    await findByText('Rp 50.000')

    // History view
    await user.click(getByRole('button', { name: 'Riwayat' }))
    expect(getByPlaceholderText('Cari keterangan…')).toBeInTheDocument()

    // Wallet manager
    await user.click(getByRole('button', { name: 'Dompet' }))
    await findByText('Kelola Dompet')
    expect(getAllByText('Cash').length).toBeGreaterThan(0)
  })
})

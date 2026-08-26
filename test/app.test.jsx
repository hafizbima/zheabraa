import React from 'react'
import { render, cleanup, waitFor } from '@testing-library/react'
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
  document.documentElement.classList.remove('dark')
  cleanup()
})

describe('Gimme Money smoke', () => {
  it('login -> dashboard -> add transaction -> history -> wallets', async () => {    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, getAllByText, findByText, findAllByText } = render(<App />)

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

    // Wallet manager (single Rekening Utama)
    await user.click(getByRole('button', { name: 'Dompet' }))
    expect((await findAllByText('Rekening Utama')).length).toBeGreaterThan(0)
  })

  it('history filter "Uang Bebas" shows free-money transactions', async () => {
    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, getAllByRole, findByText, queryByText } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Minimal 6 karakter'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Add a free-money transaction via FAB
    await user.click(getByRole('button', { name: 'Tambah transaksi' }))
    await findByText('Tambah Transaksi')
    await user.type(getByPlaceholderText('0'), '25000')
    await user.type(getByPlaceholderText('Wajib diisi untuk uang bebas'), 'jajan pasar')
    await user.click(getByRole('button', { name: 'Simpan' }))

    // Wait for modal to close (transaksi memicu re-render — jangan klik sebelum settle)
    await waitFor(() => expect(queryByText('Tambah Transaksi')).not.toBeInTheDocument())

    // History view
    await user.click(getByRole('button', { name: 'Riwayat' }))
    expect(getByPlaceholderText('Cari keterangan…')).toBeInTheDocument()

    // Filter by Uang Bebas -> free-money tx must appear (regression: was empty)
    const catSelect = getAllByRole('combobox').find((s) => [...s.options].some((o) => o.value === 'free'))
    await user.selectOptions(catSelect, 'free')
    expect(await findByText(/jajan pasar/)).toBeInTheDocument()
  })

  it('single Rekening Utama balance drops when an expense is recorded', async () => {
    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, findAllByText, findByText } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Minimal 6 karakter'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Expense 50k on Transport pocket
    await user.click(getByText('Transport'))
    await findByText('Tambah Transaksi')
    await user.type(getByPlaceholderText('0'), '50000')
    await user.click(getByRole('button', { name: 'Simpan' }))
    await findByText('Rp 50.000')

    // Single wallet balance (opening 0) is now -50k
    await user.click(getByRole('button', { name: 'Dompet' }))
    expect((await findAllByText('Rp -50.000')).length).toBeGreaterThan(0)
    expect((await findAllByText('Rekening Utama')).length).toBeGreaterThan(0)
  })

  it('dark mode toggle adds "dark" class to the document root', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, findByText } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Minimal 6 karakter'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await user.click(getByRole('button', { name: 'Mode gelap' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(getByRole('button', { name: 'Mode terang' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

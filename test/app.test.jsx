import React from 'react'
import { render, cleanup, waitFor, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import localBackend from '../src/store/backends/local.js'

import '@testing-library/jest-dom/vitest'

vi.mock('../src/store/backend.js', async () => {
  const local = await import('../src/store/backends/local.js')
  return { default: local.default }
})

const { default: App } = await import('../src/App.jsx')

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock
window.ResizeObserver = ResizeObserverMock
window.scrollTo = vi.fn()

beforeEach(() => {
  localStorage.clear()
  localBackend.reset()
  document.documentElement.classList.remove('dark')
  window.history.replaceState({}, '', '/login')
  cleanup()
})

describe('Gimme Money smoke', () => {
  it('login -> dashboard -> add transaction -> history -> wallets', async () => {    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, getAllByText, findByText, findByRole, findAllByText } = render(<App />)

    // Login screen
    expect(getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')
    expect(getByText('Aman Dibelanjakan / Hari')).toBeInTheDocument()

    // Default category seeded
    expect(getByText('Transport')).toBeInTheDocument()
    expect(getAllByText('Dompet').length).toBeGreaterThan(0)

    const tplBtn = await findByRole('button', { name: 'Template Budget' })
    await user.click(tplBtn)
    expect(await findByRole('dialog', { name: 'Template Budget Bulanan' })).toBeInTheDocument()
    await user.click(getByRole('button', { name: 'Tutup' }))

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
  }, 30000)

  it('history filter "Uang Bebas" shows free-money transactions', async () => {
    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, getAllByRole, findByText, queryByText } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
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

  it('user can delete a transaction from history (Riwayat)', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, findByText, queryByText } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Add transaction via FAB
    await user.click(getByRole('button', { name: 'Tambah transaksi' }))
    await findByText('Tambah Transaksi')
    await user.type(getByPlaceholderText('0'), '75000')
    await user.type(getByPlaceholderText('Wajib diisi untuk uang bebas'), 'beli kopi spesial')
    await user.click(getByRole('button', { name: 'Simpan' }))

    // Wait for modal to close
    await waitFor(() => expect(queryByText('Tambah Transaksi')).not.toBeInTheDocument())

    // Go to Riwayat
    await user.click(getByRole('button', { name: 'Riwayat' }))
    expect(await findByText(/beli kopi spesial/)).toBeInTheDocument()

    // Click Hapus on the transaction
    const deleteBtn = getByRole('button', { name: 'Hapus transaksi beli kopi spesial' })
    await user.click(deleteBtn)

    // Confirmation dialog
    expect(await findByText('Transaksi ini akan dihapus permanen. Lanjutkan?')).toBeInTheDocument()
    const confirmBtn = getByRole('button', { name: 'Hapus' })
    await user.click(confirmBtn)

    // Verify deleted
    expect(await findByText('Transaksi berhasil dihapus')).toBeInTheDocument()
    await waitFor(() => expect(queryByText(/beli kopi spesial/)).not.toBeInTheDocument())
  })

  it('single Rekening Utama balance drops when an expense is recorded', async () => {
    const user = userEvent.setup()
    const { getByText, getByPlaceholderText, getByRole, findAllByText, findByText } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
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
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await user.click(getByRole('button', { name: 'Mode gelap' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(getByRole('button', { name: 'Mode terang' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('reset data requires double validation before wiping data', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, findByText, findByRole } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Open settings menu
    await user.click(getByRole('button', { name: 'Pengaturan' }))
    await user.click(await findByRole('button', { name: /Reset Semua Data/ }))

    // Stage 1 validation modal appears
    expect(await findByRole('heading', { name: /Reset Semua Data \(Tahap 1\/2\)/ })).toBeInTheDocument()
    await user.click(getByRole('button', { name: 'Lanjutkan' }))

    // Stage 2 validation modal appears
    expect(await findByRole('heading', { name: /Konfirmasi Terakhir \(Tahap 2\/2\)/ })).toBeInTheDocument()
    const confirmBtn = getByRole('button', { name: 'Hapus Semua Data' })
    expect(confirmBtn).toBeDisabled()

    // Typing wrong text keeps button disabled
    const resetInput = getByPlaceholderText('RESET')
    await user.type(resetInput, 'SALAH')
    expect(confirmBtn).toBeDisabled()

    // Typing 'RESET' enables the button
    await user.clear(resetInput)
    await user.type(resetInput, 'RESET')
    expect(confirmBtn).toBeEnabled()

    // Clicking it triggers reset
    await user.click(confirmBtn)
    expect(await findByText('Semua data berhasil direset ke kondisi awal')).toBeInTheDocument()
  })

  it('input income via Add Transaction modal increases Total Pemasukan', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, findByText, queryByText, findAllByText } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Open transaction modal via FAB
    await user.click(getByRole('button', { name: 'Tambah transaksi' }))
    expect(await findByText('Pengeluaran')).toBeInTheDocument()

    // Select Pemasukan
    await user.click(getByRole('button', { name: 'Pemasukan' }))
    await user.type(getByPlaceholderText('0'), '5000000')
    await user.type(getByPlaceholderText('Contoh: Gaji, Bonus, Freelance'), 'Gaji Bulanan')
    await user.click(getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(queryByText('Tambah Pemasukan')).not.toBeInTheDocument())
    expect((await findAllByText('Rp 5.000.000')).length).toBeGreaterThan(0)
    expect(await findByText('Gaji Bulanan')).toBeInTheDocument()
  })

  it('user can add a new pocket and delete an unneeded pocket', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, findByText, queryByText, findByRole, findAllByText } = render(<App />)

    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Click "+ Tambah Pocket" in Pocket section
    await user.click(getByRole('button', { name: /Tambah Pocket/ }))
    expect(await findByRole('dialog', { name: 'Tambah Pocket Baru' })).toBeInTheDocument()

    // Fill form
    await user.type(getByPlaceholderText('mis. Belanja Bulanan, Hiburan, Tabungan'), 'Hiburan Weekend')
    await user.type(getByPlaceholderText('Nominal alokasi bulanan (opsional)'), '300000')
    await user.click(getByRole('button', { name: '+ Simpan Pocket' }))

    // Verify pocket appears on dashboard
    expect((await findAllByText('Hiburan Weekend')).length).toBeGreaterThan(0)

    // Delete pocket directly using delete button on PocketCard
    const deleteBtn = getByRole('button', { name: 'Hapus pocket Hiburan Weekend' })
    await user.click(deleteBtn)

    // Confirm deletion modal
    expect(await findByRole('dialog', { name: /Hapus Pocket "Hiburan Weekend"\?/ })).toBeInTheDocument()
    await user.click(getByRole('button', { name: 'Hapus Pocket' }))

    // Verify pocket is removed
    await waitFor(() => expect(queryByText('Hiburan Weekend')).not.toBeInTheDocument())
  })

  it('renders landing page at "/" without requiring login', async () => {
    window.history.replaceState({}, '', '/')
    const { getByRole, getByText, getAllByText } = render(<App />)

    expect(
      getByRole('heading', { name: /Gaji masuk, langsung terbagi/i })
    ).toBeInTheDocument()
    expect(getAllByText(/Sistem pocket budgeting untuk keuangan pribadimu/i).length).toBeGreaterThan(0)
    expect(getAllByText('Contoh ilustrasi, nominal bisa diubah.').length).toBe(2)
    expect(getByText('Apakah Zheabraa gratis?')).toBeInTheDocument()
  })

  it('renders register mode at "/register" with required Name and terms checkbox', async () => {
    window.history.replaceState({}, '', '/register')
    const user = userEvent.setup()
    const { getByRole, getByPlaceholderText, findByText } = render(<App />)

    expect(getByRole('heading', { name: 'Buat akun' })).toBeInTheDocument()
    expect(getByPlaceholderText('Nama kamu')).toBeInTheDocument()

    // Test validation: empty name
    await user.type(getByPlaceholderText('kamu@email.com'), 'user@test.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), '123456')
    await user.click(getByRole('button', { name: 'Daftar' }))
    expect(await findByText('Nama wajib diisi')).toBeInTheDocument()

    // Test validation: password < 6 chars
    await user.type(getByPlaceholderText('Nama kamu'), 'Budi')
    await user.clear(getByPlaceholderText('Masukkan kata sandi'))
    await user.type(getByPlaceholderText('Masukkan kata sandi'), '123')
    await user.click(getByRole('button', { name: 'Daftar' }))
    expect(await findByText('Password minimal 6 karakter')).toBeInTheDocument()

    // Test validation: terms unchecked
    await user.clear(getByPlaceholderText('Masukkan kata sandi'))
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'password123')
    await user.click(getByRole('button', { name: 'Daftar' }))
    expect(await findByText('Anda harus menyetujui Kebijakan Privasi dan Syarat Layanan')).toBeInTheDocument()
  })

  it('renders forgot-password mode at "/forgot-password"', async () => {
    window.history.replaceState({}, '', '/forgot-password')
    const { getByRole, getByText } = render(<App />)

    expect(getByRole('heading', { name: 'Lupa Password' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Kembali ke login' })).toBeInTheDocument()
    expect(getByText(/Mode lokal tidak mendukung reset password/i)).toBeInTheDocument()
  })

  it('redirects unauthenticated user accessing "/dashboard" to "/login"', async () => {
    window.history.replaceState({}, '', '/dashboard')
    const { getByRole } = render(<App />)

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
      expect(window.location.pathname).toBe('/login')
    })
  })

  it('renders 404 page for unknown routes instead of login form', async () => {
    window.history.replaceState({}, '', '/halaman-ngawur-tidak-dikenal')
    const { getByRole, getByText } = render(<App />)

    expect(getByRole('heading', { name: 'Halaman Tidak Ditemukan' })).toBeInTheDocument()
    expect(getByText('Kode 404')).toBeInTheDocument()
    expect(getByRole('link', { name: 'Kembali ke Beranda' })).toBeInTheDocument()
  })

  it('renders legal pages for "/privasi" and "/syarat"', async () => {
    window.history.replaceState({}, '', '/privasi')
    const { getByRole, getByText, getAllByText } = render(<App />)

    expect(getByRole('heading', { name: 'Kebijakan Privasi Zheabraa' })).toBeInTheDocument()
    expect(getAllByText(/Hafiz Bima/i).length).toBeGreaterThan(0)
    expect(getByText(/hafizbimaaa@gmail.com/i)).toBeInTheDocument()
    expect(getByText(/Kudus, Republik Indonesia/i)).toBeInTheDocument()
  })
  it('requires wallet when multiple wallets exist', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, getByLabelText, findByText, findByRole, queryByRole } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Add second wallet via Wallet Manager
    await user.click(getByRole('button', { name: 'Dompet' }))
    const walletDialog = await findByRole('dialog', { name: 'Rekening Utama' })
    await user.type(getByPlaceholderText('Nama (mis. GoPay)'), 'GoPay')
    const addWalletBtn = walletDialog.querySelector('button[type="submit"]')
    await user.click(addWalletBtn)
    await waitFor(() => expect(within(walletDialog).getByDisplayValue('GoPay')).toBeInTheDocument())
    const closeBtn = walletDialog.querySelector('button[aria-label="Tutup"]')
    await user.click(closeBtn)
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())
    // Heading Rekening / Dompet on dashboard changes from 'Rekening Utama' to 'Dompet'
    await findByRole('heading', { name: 'Dompet' })

    // Open transaction modal via FAB
    await user.click(getByRole('button', { name: 'Tambah transaksi' }))
    await findByText('Tambah Transaksi')

    // Fill amount and free description, but do NOT select wallet
    await user.type(getByPlaceholderText('0'), '35000')
    await user.type(getByPlaceholderText('Wajib diisi untuk uang bebas'), 'beli cemilan')
    await user.click(getByRole('button', { name: 'Simpan' }))

    // Validation error must appear
    expect(await findByText('Pilih dompet')).toBeInTheDocument()

    // Select GoPay wallet
    const walletSelect = getByLabelText('Dompet')
    const gopayOpt = [...walletSelect.options].find((o) => o.text.includes('GoPay'))
    await user.selectOptions(walletSelect, gopayOpt.value)

    // Save now succeeds
    await user.click(getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())

    // Check transaction in Riwayat
    await user.click(getByRole('button', { name: 'Riwayat' }))
    expect(await findByText(/beli cemilan/)).toBeInTheDocument()
  }, 15000)
  it('requires wallet for carry over when multiple wallets exist', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, getByLabelText, getByText, findByText, findByRole, queryByRole, queryByText } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Single wallet mode: shows "Dompet: Rekening Utama"
    expect(getByText(/Dompet:/i)).toHaveTextContent('Rekening Utama')

    // Add second wallet
    await user.click(getByRole('button', { name: 'Dompet' }))
    const walletDialog = await findByRole('dialog', { name: 'Rekening Utama' })
    await user.type(getByPlaceholderText('Nama (mis. GoPay)'), 'GoPay')
    const addWalletBtn = walletDialog.querySelector('button[type="submit"]')
    await user.click(addWalletBtn)
    await waitFor(() => expect(within(walletDialog).getByDisplayValue('GoPay')).toBeInTheDocument())
    const closeBtn = walletDialog.querySelector('button[aria-label="Tutup"]')
    await user.click(closeBtn)
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())

    // Multiple wallets: Carry-over has wallet select
    const carryWalletSelect = getByLabelText('Dompet Carry-over')
    expect(carryWalletSelect).toBeInTheDocument()

    // Type carry draft amount with no wallet selected
    const carryInput = getByLabelText('Carry-over')
    await user.clear(carryInput)
    await user.type(carryInput, '150000')
    await user.selectOptions(carryWalletSelect, '')

    // Warning appears
    expect(await findByText('Carry-over memerlukan dompet. Silakan pilih dompet.')).toBeInTheDocument()

    // Select GoPay wallet
    const gopayOpt = [...carryWalletSelect.options].find((o) => o.text.includes('GoPay'))
    await user.selectOptions(carryWalletSelect, gopayOpt.value)

    // Warning disappears
    expect(queryByText('Carry-over memerlukan dompet. Silakan pilih dompet.')).not.toBeInTheDocument()
  }, 15000)

  it('supports multi-source carry over across different wallets', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, getByRole, getByLabelText, getByText, findByText, findByRole, queryByRole } = render(<App />)

    // Login
    await user.type(getByPlaceholderText('kamu@email.com'), 'test@user.com')
    await user.type(getByPlaceholderText('Masukkan kata sandi'), 'abcdef')
    await user.click(getByRole('button', { name: 'Masuk' }))
    await findByText('Total Pemasukan')

    // Add second wallet: "Uang Cash"
    await user.click(getByRole('button', { name: 'Dompet' }))
    const walletDialog = await findByRole('dialog', { name: 'Rekening Utama' })
    await user.type(getByPlaceholderText('Nama (mis. GoPay)'), 'Uang Cash')
    const addWalletBtn = walletDialog.querySelector('button[type="submit"]')
    await user.click(addWalletBtn)
    await waitFor(() => expect(within(walletDialog).getByDisplayValue('Uang Cash')).toBeInTheDocument())
    const closeBtn = walletDialog.querySelector('button[aria-label="Tutup"]')
    await user.click(closeBtn)
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())

    // First carry-over source: select Rekening Utama and type 100000
    const carryWalletSelect1 = getByLabelText('Dompet Carry-over')
    const mainOpt = [...carryWalletSelect1.options].find((o) => o.text.includes('Rekening Utama'))
    await user.selectOptions(carryWalletSelect1, mainOpt.value)
    const carryInput1 = getByLabelText('Carry-over')
    await user.clear(carryInput1)
    await user.type(carryInput1, '100000')

    // Click "+ Tambah Sumber Dompet"
    const addSourceBtn = getByRole('button', { name: /\+ Tambah Sumber Dompet/i })
    await user.click(addSourceBtn)

    // Second source row should appear
    const carryWalletSelect2 = getByLabelText('Dompet Carry-over 2')
    const cashOpt = [...carryWalletSelect2.options].find((o) => o.text.includes('Uang Cash'))
    await user.selectOptions(carryWalletSelect2, cashOpt.value)
    const carryInput2 = getByLabelText('Carry-over 2')
    await user.type(carryInput2, '50000')

    // Verify Total Carry-Over summary is shown with Rp 150.000
    expect(await findByText('Total Carry-Over (2 sumber):')).toBeInTheDocument()
    expect(getByText('Rp 150.000')).toBeInTheDocument()
  }, 15000)
})

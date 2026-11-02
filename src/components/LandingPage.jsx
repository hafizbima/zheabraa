import { useState } from 'react'
import { Link } from '../lib/router.jsx'
import { Icon, IconBadge } from './ui/Icon.jsx'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased dark:bg-[#0D1117] dark:text-slate-100">
      {/* Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-[#0f1b3d] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-tactile-lg"
      >
        Menuju ke konten utama
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0D1117]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
              <img src="/logo.png" alt="Logo Zheabraa" className="h-full w-full rounded-lg object-cover" />
            </div>
            <span className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Zheabraa
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('fitur')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
            >
              Fitur
            </button>
            <button
              onClick={() => scrollToSection('cara-kerja')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => scrollToSection('contoh-pocket')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
            >
              Contoh Pocket
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#0f1b3d] px-4 py-2.5 text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-[#1a2e66] active:scale-[0.98] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
            >
              Buat Akun Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Masuk
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection('fitur')}
                className="text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Fitur
              </button>
              <button
                onClick={() => scrollToSection('cara-kerja')}
                className="text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Cara Kerja
              </button>
              <button
                onClick={() => scrollToSection('contoh-pocket')}
                className="text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Contoh Pocket
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                FAQ
              </button>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  href="/register"
                  className="w-full text-center rounded-xl bg-[#0f1b3d] py-2.5 text-sm font-semibold text-white dark:bg-teal-500 dark:text-slate-950"
                >
                  Buat Akun Gratis
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Landmark */}
      <main id="main-content">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Hero Left / Text */}
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Pil 1 dari 2 */}
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1 text-xs font-semibold text-[#0f1b3d] shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900 dark:text-teal-300">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  Sistem pocket budgeting
                </div>

                <h1 className="mt-5 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
                  Gaji masuk, langsung terbagi.{' '}
                  <span className="text-[#0f1b3d] dark:text-teal-400">Tidak lagi numpang lewat.</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  Sistem pocket budgeting untuk keuangan pribadimu. Buat pocket untuk makan, transport, tagihan, dan tabungan, lalu pantau sisanya secara real-time. Data tersinkron ke Supabase, bisa diakses dari HP maupun laptop.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#0f1b3d] px-6 py-3.5 text-base font-semibold text-white shadow-tactile transition hover:bg-[#1a2e66] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                  >
                    Buat Akun Gratis
                  </Link>
                  <button
                    onClick={() => scrollToSection('cara-kerja')}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-tactile-sm transition hover:bg-slate-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Lihat Cara Kerja
                  </button>
                </div>

                <p className="mt-3.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Gratis. Bisa diakses dari HP/laptop mana saja.
                </p>
              </div>

              {/* Hero Right / Mockup Dashboard */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-tactile-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#dceeff] flex items-center justify-center text-[#0f1b3d] text-xs font-bold dark:bg-teal-950 dark:text-teal-300">
                        Z
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Alokasi Bulan Ini</span>
                    </div>
                    {/* Pil 2 dari 2 */}
                    <span className="rounded-full bg-[#dceeff] px-2.5 py-0.5 text-[10px] font-bold text-[#0f1b3d] dark:bg-teal-950/80 dark:text-teal-300">
                      Contoh ilustrasi, nominal bisa diubah.
                    </span>
                  </div>

                  {/* 3 Mockup Pockets (Skenario Tunggal) */}
                  <div className="space-y-3.5">
                    {/* Pocket 1: Makan & Minum */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconBadge name="utensils" containerClassName="!h-7 !w-7 !rounded-lg" className="!h-3.5 !w-3.5" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Makan &amp; Minum</span>
                        </div>
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-400">Sisa Rp650.000</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: '56.67%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai Rp850.000</span>
                        <span>Alokasi Rp1.500.000</span>
                      </div>
                    </div>

                    {/* Pocket 2: Transportasi */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconBadge name="car" containerClassName="!h-7 !w-7 !rounded-lg" className="!h-3.5 !w-3.5" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Transportasi</span>
                        </div>
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-400">Sisa Rp280.000</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-sky-600" style={{ width: '44%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai Rp220.000</span>
                        <span>Alokasi Rp500.000</span>
                      </div>
                    </div>

                    {/* Pocket 3: Tagihan & Utilitas */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconBadge name="file-invoice-dollar" containerClassName="!h-7 !w-7 !rounded-lg" className="!h-3.5 !w-3.5" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Tagihan &amp; Utilitas</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Sisa Rp0</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-amber-600" style={{ width: '100%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai Rp750.000</span>
                        <span>Alokasi Rp750.000</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <span>Total Alokasi: Rp2.750.000</span>
                    <span className="text-teal-800 dark:text-teal-400">Total Sisa: Rp930.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN MASALAH (Daftar dengan garis vertikal kiri, tanpa pil) */}
        <section className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Tantangan Mengatur Gaji Bulanan
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Tanpa pos yang jelas sejak awal, pemasukan sering kali habis sebelum kebutuhan utama selesai terpenuhi.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Masalah 1 */}
              <div className="border-l-2 border-slate-300 pl-5 dark:border-slate-700">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Gaji habis tanpa sadar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Baru hitungan hari setelah gajian, saldo di rekening sudah menipis tanpa kamu ingat ke mana saja uang tersebut berpindah.
                </p>
              </div>

              {/* Masalah 2 */}
              <div className="border-l-2 border-slate-300 pl-5 dark:border-slate-700">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Pengeluaran kecil yang menumpuk
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Kopi harian, jajan sore, dan biaya kirim terasa kecil satu per satu, tetapi diam-diam menggerus anggaran bulananmu.
                </p>
              </div>

              {/* Masalah 3 */}
              <div className="border-l-2 border-slate-300 pl-5 dark:border-slate-700">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Tabungan yang selalu kalah
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Berniat menabung dari sisa uang di akhir bulan hampir selalu gagal karena dana sudah terlanjur terpakai untuk pos lain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN FITUR (2 Kolom dengan Ikon SVG Garis Konsisten, tanpa pil) */}
        <section id="fitur" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-slate-900/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Empat Fitur untuk Kendali Penuh
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Fungsi terarah untuk mengelola anggaran mandiri tanpa kerumitan yang tidak diperlukan.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Fitur 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <IconBadge name="wallet" />
                </div>
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Buat pocket sesuai tujuan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Kelompokkan anggaranmu ke dalam pos-pos kebutuhan yang jelas seperti makan harian, bensin atau ojek, tagihan rumah tangga, hingga tabungan.
                </p>
              </div>

              {/* Fitur 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <IconBadge name="receipt" />
                </div>
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Catat pengeluaran ke pocket yang benar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Catat setiap transaksi belanja langsung ke posnya dalam hitungan detik agar setiap rupiah tercatat tepat sasaran.
                </p>
              </div>

              {/* Fitur 3 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <IconBadge name="coins" />
                </div>
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Lihat sisa pocket secara real-time
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Saldo sisa langsung berkurang seketika setelah transaksi dicatat, memberi batas belanja yang jelas sebelum uang habis.
                </p>
              </div>

              {/* Fitur 4 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <IconBadge name="rotate" />
                </div>
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Tersinkron di HP dan laptop
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Data tersinkron ke Supabase dan bisa diakses dari HP maupun laptop kapan saja Anda perlu memeriksa atau mencatat pengeluaran.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN CARA KERJA (Alur horizontal dengan garis penghubung, aksi konkret, tanpa pil) */}
        <section id="cara-kerja" className="border-t border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Cara Kerja Zheabraa
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Tiga langkah sederhana untuk mulai menertibkan anggaran bulananmu.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 relative">
              {/* Langkah 1 */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <IconBadge name="user-plus" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Langkah 1</span>
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Buat akun gratis
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Daftar dalam hitungan detik tanpa biaya untuk mulai mengatur alokasi dana Anda.
                </p>
              </div>

              {/* Langkah 2 */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <IconBadge name="wallet" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Langkah 2</span>
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Buat pocket
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Tentukan pos kebutuhan dan nominal alokasi bulanan sesuai prioritas pengeluaran Anda.
                </p>
              </div>

              {/* Langkah 3 */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <IconBadge name="coins" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Langkah 3</span>
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Catat dan pantau sisa
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Masukkan setiap pengeluaran dan lihat sisa dana di tiap pocket berkurang seketika.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN SATU BULAN DENGAN POCKET (Cerita Skenario Nyata, Pengganti Strawman, tanpa pil) */}
        <section className="border-t border-slate-200/80 bg-[#f8fafc] py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Satu bulan dengan pocket
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Berikut alur perjalanan anggaran ketika gaji mulai dikelola per pos kebutuhan.
            </p>

            <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <IconBadge name="wallet" containerClassName="!h-8 !w-8 !rounded-lg" className="!h-4 !w-4" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Awal Bulan</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Gaji masuk sebesar Rp2.750.000 langsung dibagi ke 3 pocket: Makan &amp; Minum (Rp1.500.000), Transportasi (Rp500.000), dan Tagihan &amp; Utilitas (Rp750.000). Batas belanja tiap pos langsung terpasang sebelum uang mulai dibelanjakan.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <IconBadge name="receipt" containerClassName="!h-8 !w-8 !rounded-lg" className="!h-4 !w-4" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Pertengahan Bulan</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Pengeluaran harian seperti kopi harian, jajan sore, biaya kirim belanja, serta bensin dan tarif ojek dicatat ke pocket masing-masing. Di saat yang sama, tagihan listrik dan air terbayar pas Rp750.000, sehingga sisa pocket tagihan menjadi Rp0 dan tidak mengganggu pos lainnya.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <IconBadge name="coins" containerClassName="!h-8 !w-8 !rounded-lg" className="!h-4 !w-4" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Menjelang Akhir Bulan</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Pocket Makan menyisakan Rp650.000 dari alokasi Rp1.500.000 (terpakai Rp850.000) dan pocket Transportasi menyisakan Rp280.000 dari alokasi Rp500.000 (terpakai Rp220.000). Total terpakai tercatat Rp1.820.000 dengan total sisa anggaran Rp930.000. Anda tahu persis berapa yang masih aman dibelanjakan tanpa perlu menghitung ulang saldo tabungan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN CONTOH POCKET (Tabel / Rincian Skenario Tunggal, tanpa pil) */}
        <section id="contoh-pocket" className="border-t border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Contoh Rincian Pocket
                </h2>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  Skenario alokasi 3 pocket yang mencerminkan pembagian kebutuhan harian.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Contoh ilustrasi, nominal bisa diubah.
              </span>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Baris 1: Makan & Minum */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBadge name="utensils" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Makan &amp; Minum</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Konsumsi sehari-hari, kopi harian, dan jajan sore</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs sm:text-sm pl-12 sm:pl-0">
                    <span className="text-slate-600 dark:text-slate-400">Alokasi: <strong className="text-slate-900 dark:text-white">Rp1.500.000</strong></span>
                    <span className="text-slate-600 dark:text-slate-400">Terpakai: <strong className="text-slate-900 dark:text-white">Rp850.000</strong></span>
                    <span className="text-teal-800 font-bold dark:text-teal-400">Sisa: Rp650.000</span>
                  </div>
                </div>

                {/* Baris 2: Transportasi */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBadge name="car" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transportasi</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Bensin kendaraan, tarif ojek, dan biaya tol</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs sm:text-sm pl-12 sm:pl-0">
                    <span className="text-slate-600 dark:text-slate-400">Alokasi: <strong className="text-slate-900 dark:text-white">Rp500.000</strong></span>
                    <span className="text-slate-600 dark:text-slate-400">Terpakai: <strong className="text-slate-900 dark:text-white">Rp220.000</strong></span>
                    <span className="text-teal-800 font-bold dark:text-teal-400">Sisa: Rp280.000</span>
                  </div>
                </div>

                {/* Baris 3: Tagihan & Utilitas */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBadge name="file-invoice-dollar" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tagihan &amp; Utilitas</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Listrik, internet rumah, dan iuran air</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs sm:text-sm pl-12 sm:pl-0">
                    <span className="text-slate-600 dark:text-slate-400">Alokasi: <strong className="text-slate-900 dark:text-white">Rp750.000</strong></span>
                    <span className="text-slate-600 dark:text-slate-400">Terpakai: <strong className="text-slate-900 dark:text-white">Rp750.000</strong></span>
                    <span className="text-slate-600 font-bold dark:text-slate-400">Sisa: Rp0</span>
                  </div>
                </div>

                {/* Baris Total */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBadge name="coins" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Total Keseluruhan</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs sm:text-sm pl-12 sm:pl-0">
                    <span className="text-slate-700 dark:text-slate-300">Total Alokasi: <strong className="text-slate-900 dark:text-white">Rp2.750.000</strong></span>
                    <span className="text-slate-700 dark:text-slate-300">Total Terpakai: <strong className="text-slate-900 dark:text-white">Rp1.820.000</strong></span>
                    <span className="text-teal-800 font-extrabold dark:text-teal-400">Total Sisa: Rp930.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN FAQ (tanpa pil) */}
        <section id="faq" className="border-t border-slate-200/80 bg-[#f8fafc] py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Informasi seputar penggunaan, sinkronisasi, dan keamanan aplikasi Zheabraa.
            </p>

            <div className="mt-10 space-y-4">
              {/* FAQ 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <IconBadge name="circle-question" />
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Apakah Zheabraa gratis?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      Ya, gratis digunakan.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <IconBadge name="rotate" />
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Apakah bisa dipakai di HP?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      Ya, bisa diakses dari HP maupun laptop, data tersinkron ke Supabase.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 3 (Dilunakkan sesuai Tugas 5) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <IconBadge name="lock" />
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Bagaimana sistem keamanan datanya?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      Data disimpan di Supabase dan dilindungi Row Level Security (RLS) yang memastikan setiap akun hanya dapat membaca dan menulis datanya sendiri. Kata sandi dikelola melalui Supabase Auth dan tidak disimpan sebagai teks biasa di dalam aplikasi Zheabraa, serta seluruh komunikasi data menggunakan enkripsi HTTPS.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <IconBadge name="coins" />
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Bagaimana sisa pocket dihitung?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      Sisa dihitung dari pocket dikurangi pengeluaran yang sudah dicatat, dan diperbarui secara real-time.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 5 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <IconBadge name="user-plus" />
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Bagaimana jika saya lupa password?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      Gunakan link &quot;Lupa password?&quot; pada layar masuk untuk menerima link reset melalui email pendaftaran Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA PENUTUP */}
        <section className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Mulai bagi gajimu ke pocket hari ini.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
              Daftar tanpa biaya dan ketahui batasan belanja setiap kebutuhan Anda.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#0f1b3d] px-8 py-3.5 text-base font-semibold text-white shadow-tactile transition hover:bg-[#1a2e66] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                Buat Akun Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-12 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <img src="/logo.png" alt="Logo Zheabraa" className="h-full w-full rounded-lg object-cover" />
              </div>
              <span className="font-sans text-base font-bold text-slate-900 dark:text-white">Zheabraa</span>
            </div>

            <nav aria-label="Navigasi Footer" className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-semibold">
              <button
                onClick={() => scrollToSection('fitur')}
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Fitur
              </button>
              <button
                onClick={() => scrollToSection('cara-kerja')}
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Cara Kerja
              </button>
              <button
                onClick={() => scrollToSection('contoh-pocket')}
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Contoh Pocket
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                FAQ
              </button>
              <Link
                href="/privasi"
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="/syarat"
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Syarat Layanan
              </Link>
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-900 transition dark:text-slate-300 dark:hover:text-white"
              >
                Masuk
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-slate-200/60 pt-6 text-center text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <p>© 2026 Zheabraa. Sistem pocket budgeting untuk keuangan pribadimu. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

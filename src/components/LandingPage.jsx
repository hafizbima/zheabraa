import { useState } from 'react'
import { Link } from '../lib/router.jsx'

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
            <div className="leading-none">
              <span className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Zheabraa
              </span>
            </div>
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
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1 text-xs font-semibold text-[#0f1b3d] shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900 dark:text-teal-300">
                  <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  Sistem Pocket Budgeting Pribadi
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
                    <span className="rounded-full bg-[#dceeff] px-2.5 py-0.5 text-[10px] font-bold text-[#0f1b3d] dark:bg-teal-950/80 dark:text-teal-300">
                      Contoh ilustrasi
                    </span>
                  </div>

                  {/* 3 Mockup Pockets with Progress Bars */}
                  <div className="space-y-4">
                    {/* Pocket 1: Makan & Minum */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">🍜 Makan &amp; Minum</span>
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Sisa Rp650.000</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: '57%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai: Rp850.000</span>
                        <span>Alokasi: Rp1.500.000</span>
                      </div>
                    </div>

                    {/* Pocket 2: Transportasi */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">🚗 Transportasi</span>
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Sisa Rp280.000</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: '44%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai: Rp220.000</span>
                        <span>Alokasi: Rp500.000</span>
                      </div>
                    </div>

                    {/* Pocket 3: Tagihan & Utilitas */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">💡 Tagihan &amp; Utilitas</span>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Sisa Rp0</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-rose-500" style={{ width: '100%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Terpakai: Rp750.000</span>
                        <span>Alokasi: Rp750.000</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
                    Sisa anggaran terhitung otomatis dan real-time setelah setiap pengeluaran dicatat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN MASALAH */}
        <section className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                Tantangan Nyata
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Sering Mengalami Masalah Ini Setiap Bulan?
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Bukan karena penghasilan kurang, sering kali masalahnya adalah tidak adanya pemisahan anggaran sejak awal.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Masalah 1 */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Gaji habis tanpa sadar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Baru hitungan hari setelah gajian saldo di rekening sudah terkuras habis tanpa kamu ingat ke mana saja uang tersebut berpindah.
                </p>
              </div>

              {/* Masalah 2 */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Pengeluaran kecil yang menumpuk
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Kopi harian, jajan sore, biaya kirim, dan langganan kecil terasa sepele satu per satu, tetapi diam-diam menggembosi anggaran bulananmu.
                </p>
              </div>

              {/* Masalah 3 */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Tabungan yang selalu kalah
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Berniat menabung dari uang yang tersisa di akhir bulan hampir selalu gagal, karena uang selalu terpakai habis untuk kebutuhan lain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN FITUR */}
        <section id="fitur" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-[#dceeff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0f1b3d] dark:bg-teal-950/80 dark:text-teal-300">
                Fitur Utama
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Pencatatan Fokus, Sederhana, dan Nyata
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Semua yang kamu perlukan untuk mengendalikan pengeluaran harian tanpa fitur rumit yang tidak terpakai.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Fitur 1 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1b3d] text-white dark:bg-teal-500 dark:text-slate-950">
                  <span className="text-sm font-extrabold">1</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Buat pocket sesuai tujuan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Kelompokkan anggaranmu ke dalam pos-pos kebutuhan yang jelas seperti makan, transportasi, tagihan, dan tabungan sesuai prioritasmu.
                </p>
              </div>

              {/* Fitur 2 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1b3d] text-white dark:bg-teal-500 dark:text-slate-950">
                  <span className="text-sm font-extrabold">2</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Catat pengeluaran ke pocket yang benar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Catat setiap transaksi belanja langsung ke pocket yang sesuai dengan cepat, sehingga setiap rupiah memiliki peruntukan yang pasti.
                </p>
              </div>

              {/* Fitur 3 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1b3d] text-white dark:bg-teal-500 dark:text-slate-950">
                  <span className="text-sm font-extrabold">3</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Lihat sisa pocket secara real-time
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Pantau berapa sisa dana yang masih aman untuk dibelanjakan setiap saat tanpa perlu menghitung ulang atau menunggu akhir bulan.
                </p>
              </div>

              {/* Fitur 4 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1b3d] text-white dark:bg-teal-500 dark:text-slate-950">
                  <span className="text-sm font-extrabold">4</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Data tersinkron ke Supabase, bisa diakses dari HP maupun laptop
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Data anggaranmu tersimpan aman di Supabase dan dapat diakses dengan mulus dari peramban ponsel pintar maupun laptop kerjamu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN CARA KERJA */}
        <section id="cara-kerja" className="border-t border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                Langkah Cepat
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Cara Kerja Zheabraa
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Hanya butuh tiga langkah ringkas untuk mulai menertibkan anggaran pribadimu.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Langkah 1 */}
              <div className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f1b3d] text-lg font-black text-white dark:bg-teal-500 dark:text-slate-950">
                  1
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Langkah Pertama
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Buat akun gratis.
                </p>
              </div>

              {/* Langkah 2 */}
              <div className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f1b3d] text-lg font-black text-white dark:bg-teal-500 dark:text-slate-950">
                  2
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Langkah Kedua
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Buat pocket sesuai tujuan.
                </p>
              </div>

              {/* Langkah 3 */}
              <div className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f1b3d] text-lg font-black text-white dark:bg-teal-500 dark:text-slate-950">
                  3
                </div>
                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Langkah Ketiga
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Catat pengeluaran dan pantau sisanya secara real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN CONTOH POCKET */}
        <section id="contoh-pocket" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-[#dceeff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0f1b3d] dark:bg-teal-950/80 dark:text-teal-300">
                Ilustrasi, nominal bisa diubah
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Contoh Pembagian Pocket
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Setiap orang memiliki kebutuhan yang unik. Kamu bebas menentukan nama pocket dan besaran nominal sesuai gajimu.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Contoh 1 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl">🍜</span>
                <h3 className="mt-3 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Makan
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Kebutuhan makan harian</p>
                <p className="mt-4 text-xl font-extrabold text-[#0f1b3d] dark:text-teal-400">
                  Rp1.500.000
                </p>
              </div>

              {/* Contoh 2 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl">🚗</span>
                <h3 className="mt-3 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Transport
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Bensin, tarif ojek &amp; tol</p>
                <p className="mt-4 text-xl font-extrabold text-[#0f1b3d] dark:text-teal-400">
                  Rp500.000
                </p>
              </div>

              {/* Contoh 3 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl">💰</span>
                <h3 className="mt-3 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Tabungan
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Simpanan masa depan</p>
                <p className="mt-4 text-xl font-extrabold text-[#0f1b3d] dark:text-teal-400">
                  Rp1.000.000
                </p>
              </div>

              {/* Contoh 4 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-2xl">🍿</span>
                <h3 className="mt-3 font-sans text-base font-bold text-slate-900 dark:text-white">
                  Hiburan
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Nonton film &amp; rekreasi</p>
                <p className="mt-4 text-xl font-extrabold text-[#0f1b3d] dark:text-teal-400">
                  Rp300.000
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN KENAPA POCKET BUDGETING */}
        <section className="border-t border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-[#0D1117]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Perbandingan Pendekatan
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Kenapa Memilih Pocket Budgeting?
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Bandingkan cara Zheabraa dengan metode pencatatan konvensional yang sering kali merepotkan.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Catatan Biasa */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Metode 1
                </div>
                <h3 className="mt-2 font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Catatan Pengeluaran Biasa
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Hanya memberi tahu total uang yang keluar setelah uangnya terlanjur habis. Tidak ada pembatas yang mengingatkanmu sebelum belanja.
                </p>
              </div>

              {/* Spreadsheet */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Metode 2
                </div>
                <h3 className="mt-2 font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Spreadsheet Manual
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Harus diingat dan dihitung manual. Cenderung merepotkan dibuka di ponsel saat sedang berbelanja di luar rumah.
                </p>
              </div>

              {/* Zheabraa Pocket Budgeting */}
              <div className="rounded-3xl border-2 border-[#0f1b3d] bg-white p-6 sm:p-7 shadow-tactile-md dark:border-teal-500 dark:bg-slate-900">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0f1b3d] dark:text-teal-400">
                  Rekomendasi Kami
                </div>
                <h3 className="mt-2 font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Pocket Budgeting Zheabraa
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Gaji dibagi sejak awal ke dalam kantong-kantong jelas. Sisa anggaran terpantau langsung secara real-time setiap kali pengeluaran dicatat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN FAQ */}
        <section id="faq" className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-[#dceeff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0f1b3d] dark:bg-teal-950/80 dark:text-teal-300">
                Pertanyaan Umum
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Tanya Jawab Seputar Zheabraa
              </h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Jawaban jelas untuk hal-hal yang sering ditanyakan pengguna baru.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {/* FAQ 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Apakah Zheabraa gratis?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Ya, gratis digunakan.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Apakah bisa dipakai di HP?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Ya, bisa diakses dari HP maupun laptop, data tersinkron ke Supabase.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Apakah dataku aman?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Data disimpan di Supabase, dilindungi Supabase Auth dan Row Level Security (RLS) yang sudah aktif, sehingga setiap pengguna hanya dapat mengakses datanya sendiri, dan situs memakai HTTPS.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Bagaimana kalau lupa password?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Gunakan link &quot;Lupa password?&quot; untuk menerima link reset melalui email.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Bagaimana sisa pocket dihitung?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Sisa dihitung dari pocket dikurangi pengeluaran yang sudah dicatat, dan diperbarui secara real-time.
                </p>
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
              Daftar gratis tanpa ribet dan rasakan ketenangan mengetahui ke mana uangmu dialokasikan.
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
            <p>© {new Date().getFullYear()} Zheabraa. Sistem pocket budgeting untuk keuangan pribadimu. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

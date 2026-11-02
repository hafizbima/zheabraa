import { Link } from '../lib/router.jsx'

export default function LegalPage({ type = 'privasi' }) {
  const isPrivasi = type === 'privasi'

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#0D1117] dark:text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0D1117]/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
              <img src="/logo.png" alt="Logo Zheabraa" className="h-full w-full rounded-lg object-cover" />
            </div>
            <div>
              <span className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Zheabraa
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400">
                Pocket Budgeting
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Beranda
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-[#0f1b3d] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-[#1a2e66] active:scale-[0.98] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Breadcrumb & Navigation Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {isPrivasi ? 'Kebijakan Privasi' : 'Syarat Layanan'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/privasi"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isPrivasi
                  ? 'bg-[#dceeff] text-[#0f1b3d] dark:bg-teal-950 dark:text-teal-300'
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/syarat"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                !isPrivasi
                  ? 'bg-[#dceeff] text-[#0f1b3d] dark:bg-teal-950 dark:text-teal-300'
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Syarat Layanan
            </Link>
          </div>
        </div>

        {/* Content Card */}
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          {/* Review Notice Banner */}
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Catatan Tinjauan Pemilik Aplikasi:
            </p>
            <p className="mt-1 leading-relaxed">
              Dokumen ini memuat struktur kebijakan standar sesuai fitur dan arsitektur teknis Zheabraa saat ini. Bagian bertanda <span className="font-semibold text-rose-700 dark:text-rose-400">[Perlu ditinjau pemilik app]</span> wajib diperiksa dan dilengkapi dengan data resmi Anda sebelum publikasi final.
            </p>
          </div>

          {isPrivasi ? (
            /* Kebijakan Privasi */
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
                Kebijakan Privasi Zheabraa
              </h1>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Terakhir diperbarui: {new Date().getFullYear()} • Berlaku untuk layanan Zheabraa
              </p>

              <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Pendahuluan
                  </h2>
                  <p className="mt-2">
                    Selamat datang di Zheabraa (&quot;kami&quot;). Kami menghargai privasi Anda dan berkomitmen melindungi data pribadi pengguna layanan kami. Dokumen Kebijakan Privasi ini menjelaskan jenis data yang kami kumpulkan, bagaimana data tersebut disimpan dan digunakan, serta hak-hak yang Anda miliki saat menggunakan aplikasi Zheabraa Pocket Budgeting.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Data yang Dikumpulkan
                  </h2>
                  <p className="mt-2">
                    Kami hanya mengumpulkan data yang Anda berikan secara langsung saat mendaftar dan menggunakan aplikasi:
                  </p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>
                      <strong>Informasi Akun:</strong> Nama tampilan dan alamat email yang Anda masukkan saat membuat akun melalui form pendaftaran.
                    </li>
                    <li>
                      <strong>Data Keuangan &amp; Pocket:</strong> Nama pocket (kategori anggaran), nominal alokasi bulanan, catatan nominal transaksi pengeluaran/pemasukan, dan tanggal transaksi yang Anda catat sendiri.
                    </li>
                    <li>
                      <strong>Data Teknis Perangkat:</strong> Preferensi tema tampilan (terang/gelap) yang disimpan secara lokal di browser Anda.
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
                    * Catatan: Zheabraa adalah sistem pencatatan mandiri. Kami TIDAK PERNAH meminta, menghubungkan, atau menyimpan nomor rekening bank, kartu kredit/debit, PIN transaksi, atau kredensial perbankan lainnya.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Tujuan Penggunaan Data
                  </h2>
                  <p className="mt-2">Data Anda digunakan semata-mata untuk keperluan operasional aplikasi:</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Menyediakan layanan pocket budgeting dan menghitung sisa anggaran secara real-time.</li>
                    <li>Melakukan autentikasi akun dan mengizinkan Anda masuk dari perangkat berbeda (HP maupun laptop).</li>
                    <li>Menyinkronkan data anggaran Anda secara langsung ke basis data terproteksi.</li>
                    <li>Mengirimkan email tautan pengaturan ulang kata sandi saat Anda meminta reset password.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Penyimpanan dan Keamanan Data
                  </h2>
                  <p className="mt-2">
                    Keamanan data keuangan Anda adalah prioritas utama kami:
                  </p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>
                      <strong>Penyimpanan Supabase:</strong> Data tersimpan di Supabase dengan perlindungan Supabase Auth dan sistem <em>Row Level Security</em> (RLS) yang sudah aktif. Dengan RLS, basis data menjamin bahwa setiap pengguna hanya dapat membaca dan menulis datanya sendiri.
                    </li>
                    <li>
                      <strong>Enkripsi HTTPS:</strong> Seluruh komunikasi data antara peramban (browser) Anda dan server kami dienkripsi menggunakan protokol HTTPS standar industri.
                    </li>
                    <li>
                      <strong>Kerahasiaan Kata Sandi:</strong> Kata sandi Anda dienkripsi secara aman oleh Supabase Auth dan tidak dapat dilihat oleh pengelola Zheabraa.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Hak dan Kendali Pengguna atas Data
                  </h2>
                  <p className="mt-2">
                    Sebagai pengguna, Anda memegang kendali penuh atas data Anda:
                  </p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li><strong>Melihat &amp; Mengubah:</strong> Anda dapat mengubah data pocket, kategori, atau transaksi kapan saja.</li>
                    <li><strong>Unduh Cadangan:</strong> Anda dapat mengekspor seluruh data Anda dalam format JSON melalui menu pengaturan aplikasi.</li>
                    <li><strong>Reset &amp; Hapus Data:</strong> Aplikasi menyediakan mekanisme dua tahap untuk menghapus seluruh data pencatatan Anda jika Anda ingin memulai ulang.</li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    6. Kontak dan Informasi Pengelola
                  </h2>
                  <p className="mt-2 text-rose-700 dark:text-rose-400 font-medium">
                    [Perlu ditinjau pemilik app: Cantumkan alamat email resmi kontak dukungan/privasi, nama penanggung jawab atau entitas pengelola Zheabraa, serta domisili hukum jika diperlukan sebelum dipublikasikan ke publik.]
                  </p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Contoh format pengisian: Email: support@zheabraa.app | Dikelola oleh: Tim Zheabraa, Indonesia.
                  </p>
                </section>
              </div>
            </div>
          ) : (
            /* Syarat Layanan */
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
                Syarat Layanan Zheabraa
              </h1>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Terakhir diperbarui: {new Date().getFullYear()} • Berlaku untuk semua pengguna Zheabraa
              </p>

              <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Penerimaan Ketentuan
                  </h2>
                  <p className="mt-2">
                    Dengan membuat akun atau mengakses aplikasi Zheabraa (&quot;Layanan&quot;), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Deskripsi Layanan
                  </h2>
                  <p className="mt-2">
                    Zheabraa adalah aplikasi web pocket budgeting gratis yang dirancang untuk membantu Anda membagi anggaran ke dalam kantong-kantong (pocket), mencatat pengeluaran, dan memantau sisa anggaran secara real-time.
                  </p>
                  <p className="mt-2">
                    <strong>Bukan Penasihat Keuangan:</strong> Zheabraa merupakan alat bantu pencatatan teknis semata. Zheabraa bukan lembaga keuangan, bank, penyedia jasa pembayaran, ataupun penasihat finansial resmi. Segala keputusan alokasi dana dan transaksi keuangan sepenuhnya adalah tanggung jawab Anda sendiri.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Akun dan Keamanan Kata Sandi
                  </h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Anda wajib memberikan nama dan alamat email yang valid saat mendaftar.</li>
                    <li>Kata sandi wajib memiliki panjang minimal 6 karakter.</li>
                    <li>Anda bertanggung jawab menjaga kerahasiaan informasi login dan seluruh aktivitas yang terjadi di bawah akun Anda.</li>
                    <li>Jika Anda mencurigai adanya penyalahgunaan akun, gunakan fitur lupa password untuk mengatur ulang akses Anda.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Hak Milik dan Konten Pengguna
                  </h2>
                  <p className="mt-2">
                    Data nominal, pocket, dan catatan yang Anda masukkan ke dalam Zheabraa adalah milik Anda sepenuhnya. Kami tidak mengklaim kepemilikan atas data Anda dan tidak menjual data tersebut kepada pihak ketiga. Antarmuka, logo, desain, dan kode sumber aplikasi dilindungi hak cipta Zheabraa.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Ketersediaan Layanan &amp; Batasan Tanggung Jawab
                  </h2>
                  <p className="mt-2">
                    Layanan ini disediakan secara gratis &quot;sebagaimana adanya&quot; (<em>as is</em>) dan &quot;sebagaimana tersedia&quot; (<em>as available</em>). Kami berupaya menjaga agar layanan berjalan lancar, namun kami tidak memberikan jaminan tanpa cela atas gangguan jaringan pihak ketiga atau kehilangan data yang diakibatkan oleh kelalaian pengguna. Pengguna disarankan secara berkala memanfaatkan fitur unduh cadangan (backup).
                  </p>
                </section>

                <section className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    6. Hukum yang Berlaku &amp; Kontak
                  </h2>
                  <p className="mt-2 text-rose-700 dark:text-rose-400 font-medium">
                    [Perlu ditinjau pemilik app: Tentukan wilayah hukum penyelesaian sengketa (misalnya hukum Republik Indonesia) serta alamat email kontak resmi pemilik app untuk pertanyaan terkait Syarat Layanan sebelum dipublikasikan ke publik.]
                  </p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Contoh format: Syarat Layanan ini diatur berdasarkan hukum Republik Indonesia. Pertanyaan dapat diajukan ke: legal@zheabraa.app.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* Action Back */}
          <div className="mt-10 border-t border-slate-200/80 pt-6 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#0f1b3d] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-[#1a2e66] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
            >
              Buat Akun Gratis
            </Link>
          </div>
        </article>
      </main>

      {/* Simple Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-[#0D1117] dark:text-slate-400">
        <p>© {new Date().getFullYear()} Zheabraa. Sistem pocket budgeting untuk keuangan pribadimu.</p>
      </footer>
    </div>
  )
}

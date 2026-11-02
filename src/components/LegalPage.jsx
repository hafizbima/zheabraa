import { Link } from '../lib/router.jsx'

export default function LegalPage({ type = 'privasi' }) {
  const isPrivasi = type === 'privasi'

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#0D1117] dark:text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0D1117]/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
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
          {isPrivasi ? (
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
                Kebijakan Privasi Zheabraa
              </h1>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Terakhir diperbarui: 2 November 2026 • Pengelola: Hafiz Bima
              </p>

              <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Pendahuluan
                  </h2>
                  <p className="mt-2">
                    Kebijakan Privasi ini menjelaskan bagaimana Zheabraa mengumpulkan, menggunakan, dan melindungi informasi yang Anda masukkan ke dalam aplikasi pocket budgeting ini saat diakses melalui peramban web pada ponsel maupun laptop.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Data yang Dikumpulkan
                  </h2>
                  <p className="mt-2">
                    Aplikasi ini hanya mencatat data yang Anda masukkan secara langsung:
                  </p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>
                      <strong>Akun:</strong> Nama tampilan dan alamat email yang digunakan saat mendaftar.
                    </li>
                    <li>
                      <strong>Anggaran &amp; Pengeluaran:</strong> Nama pocket yang Anda buat, nominal alokasi bulanan, dan nominal pengeluaran yang Anda catat ke dalam pocket.
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Zheabraa tidak meminta, tidak mengintegrasikan, dan tidak menyimpan nomor rekening bank, kartu pembayaran, maupun kredensial keuangan eksternal apa pun.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Tujuan Penggunaan Data
                  </h2>
                  <p className="mt-2">Data yang Anda masukkan digunakan khusus untuk:</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Menjalankan fungsi pocket budgeting dan menghitung sisa pocket secara langsung.</li>
                    <li>Menyinkronkan data pocket dan pengeluaran Anda ke Supabase agar dapat diakses dari perangkat berbeda.</li>
                    <li>Mengautentikasi sesi masuk dan mengirim tautan reset kata sandi jika diminta.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Penyimpanan dan Keamanan Data
                  </h2>
                  <p className="mt-2">
                    Data disimpan pada infrastruktur Supabase dengan arsitektur keamanan berikut:
                  </p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>
                      <strong>Row Level Security (RLS):</strong> Aturan RLS aktif di tingkat basis data, memastikan setiap pengguna hanya dapat membaca dan menulis datanya sendiri berdasarkan identitas autentikasi Supabase Auth.
                    </li>
                    <li>
                      <strong>Kata Sandi:</strong> Kata sandi dikelola langsung lewat Supabase Auth dan tidak disimpan sebagai teks biasa di dalam aplikasi.
                    </li>
                    <li>
                      <strong>Enkripsi Transport:</strong> Semua pertukaran data antara peramban dan server menggunakan protokol HTTPS terenkripsi.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Hak Pengguna dan Permintaan Penghapusan Data
                  </h2>
                  <p className="mt-2">
                    Anda berhak melihat, memperbarui, atau menghapus pocket dan catatan pengeluaran Anda kapan saja di dalam antarmuka aplikasi.
                  </p>
                  <p className="mt-2">
                    Untuk permintaan penutupan akun dan penghapusan seluruh data akun secara permanen dari server, Anda dapat mengirimkan permohonan ke email kontak resmi pengelola yang tercantum di bawah ini. Permintaan akan diproses selambat-lambatnya 7 hari kerja setelah konfirmasi kepemilikan akun.
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    6. Kontak Pengelola
                  </h2>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <p><strong>Pengelola:</strong> Hafiz Bima</p>
                    <p><strong>Domisili:</strong> Kudus, Republik Indonesia</p>
                    <p><strong>Email Kontak Resmi:</strong> <a href="mailto:hafizbimaaa@gmail.com" className="text-teal-800 underline font-medium dark:text-teal-400">hafizbimaaa@gmail.com</a></p>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
                Syarat Layanan Zheabraa
              </h1>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Terakhir diperbarui: 2 November 2026 • Pengelola: Hafiz Bima
              </p>

              <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Penerimaan Ketentuan
                  </h2>
                  <p className="mt-2">
                    Dengan membuat akun atau menggunakan situs web Zheabraa, Anda menyetujui Syarat Layanan ini. Jika Anda tidak menyetujui salah satu ketentuan, Anda dipersilakan untuk tidak menggunakan aplikasi ini.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Deskripsi Layanan
                  </h2>
                  <p className="mt-2">
                    Zheabraa menyediakan alat bantu pocket budgeting gratis untuk keuangan pribadi yang memungkinkan pengguna membuat pocket alokasi, mencatat pengeluaran harian, dan melihat sisa saldo pocket secara real-time.
                  </p>
                  <p className="mt-2">
                    Zheabraa bukan penasihat keuangan berlisensi, bukan perbankan, dan bukan penyedia jasa pembayaran. Aplikasi ini semata-mata merupakan sarana pencatatan mandiri. Seluruh keputusan keuangan dan ketepatan data yang dimasukkan merupakan tanggung jawab pengguna.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Akun dan Keamanan Kata Sandi
                  </h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Pendaftaran memerlukan nama tampilan, alamat email yang valid, dan kata sandi minimal 6 karakter.</li>
                    <li>Pengguna bertanggung jawab menjaga kerahasiaan kata sandi dan keamanan perangkat yang digunakan untuk mengakses akun.</li>
                    <li>Fitur reset kata sandi tersedia melalui email pendaftaran jika Anda kehilangan akses ke akun Anda.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Kepemilikan Data Pengguna
                  </h2>
                  <p className="mt-2">
                    Seluruh data nama pocket, nominal anggaran, dan catatan transaksi yang Anda masukkan tetap menjadi hak milik Anda sepenuhnya. Zheabraa tidak memperjualbelikan data keuangan pribadi Anda kepada pihak mana pun.
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Batasan Tanggung Jawab
                  </h2>
                  <p className="mt-2">
                    Layanan Zheabraa disediakan secara gratis untuk membantu pencatatan keuangan pribadi. Pengelola berupaya menjaga keandalan sistem, namun tidak bertanggung jawab atas kerugian finansial tidak langsung yang timbul akibat kesalahan penginputan angka oleh pengguna atau gangguan konektivitas internet pada perangkat pengguna.
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    6. Hukum yang Berlaku dan Kontak
                  </h2>
                  <p className="mt-2">
                    Syarat Layanan ini tunduk pada hukum Negara Republik Indonesia. Untuk pertanyaan, masukan, atau korespondensi terkait ketentuan layanan ini, Anda dapat menghubungi pengelola secara langsung:
                  </p>
                  <div className="mt-3 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <p><strong>Pengelola:</strong> Hafiz Bima</p>
                    <p><strong>Domisili:</strong> Kudus, Republik Indonesia</p>
                    <p><strong>Email Kontak Resmi:</strong> <a href="mailto:hafizbimaaa@gmail.com" className="text-teal-800 underline font-medium dark:text-teal-400">hafizbimaaa@gmail.com</a></p>
                  </div>
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

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-[#0D1117] dark:text-slate-400">
        <p>© 2026 Zheabraa. Sistem pocket budgeting untuk keuangan pribadimu. Hak cipta dilindungi.</p>
      </footer>
    </div>
  )
}

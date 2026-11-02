import { Link } from '../lib/router.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-12 text-slate-900 dark:bg-[#0D1117] dark:text-slate-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <img src="/logo.png" alt="Logo Zheabraa" className="h-full w-full rounded-xl object-cover" />
        </div>
        
        <span className="inline-block rounded-full bg-[#dceeff] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0f1b3d] dark:bg-teal-950/60 dark:text-teal-300">
          Kode 404
        </span>

        <h1 className="mt-4 font-sans text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
          Halaman Tidak Ditemukan
        </h1>
        
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Halaman yang kamu cari tidak tersedia, sudah dipindahkan, atau alamat URL yang dimasukkan kurang tepat.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#0f1b3d] px-5 py-3 text-sm font-semibold text-white shadow-tactile-sm transition hover:bg-[#1a2e66] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-tactile-sm transition hover:bg-slate-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1b3d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  )
}

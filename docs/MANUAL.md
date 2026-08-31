# Zheabraa Pocket Budgeting — Buku Manual

> Versi 0.1 · Aplikasi pengelolaan keuangan pribadi dengan sistem pocket (amplop) berbasis satu rekening.
> Bahasa antarmuka: Bahasa Indonesia. Tema: terang & gelap, responsif untuk HP dan desktop.

---

## 1. Tentang Aplikasi

Zheabraa membantu kamu membagi satu sumber dana menjadi beberapa **pocket** (kantong virtual),
agar pengeluaran lebih terkontrol — mirip metode amplop tapi digital.

Konsep utamanya:

- **1 Rekening Utama** — sumber dana fisik kamu (mis. rekening bank).
- **N Pocket** — sekat virtual di dalam rekening itu (mis. Transport, Makan, Tabungan, Skincare).
- **Uang Bebas** — sisa pemasukan yang belum dialokasikan ke pocket mana pun.

Kamu bisa mencatat pemasukan, membagi ke pocket, mencatat pengeluaran per pocket, melihat saldo
rekening, dan membaca laporan statistik.

---

## 2. Memulai

### 2.1. Mode Penyimpanan Data

Aplikasi berjalan di dua mode, dipilih lewat file `.env` (diatur pengembang):

| Mode | Simpanan | Kelebihan | Kekurangan |
|---|---|---|---|
| **Supabase** (default) | Cloud (server) | Akses dari HP & laptop, tersinkron | Perlu koneksi internet |
| **Lokal** | Perangkat ini (localStorage) | Instan, tanpa internet | Tidak tersinkron antar perangkat |

Indikator **"Mode lokal"** muncul di halaman masuk jika pakai mode lokal.

### 2.2. Membuat Akun

1. Buka aplikasi, klik **Buat akun**.
2. Isi **Nama**, **Email**, dan **Password** (minimal 6 karakter).
3. Klik **Daftar**. Setelah berhasil, data awal dibuat otomatis:
   - 1 dompet **Rekening Utama** (saldo awal 0).
   - Kategori default: Transport, Gym, Date, Giving, Saving, Skincare (budget 0).
4. Klik **Masuk** setiap kali membuka aplikasi.

> Di mode Supabase, jika email butuh konfirmasi, cek kotak masuk email kamu.

### 2.3. Lupa Password

- Di halaman masuk, klik **Lupa password?**.
- Masukkan email akun kamu, lalu ikuti link reset yang dikirim.
- **Mode lokal** tidak mendukung reset — data hanya di perangkat; hubungi pengembang.

### 2.4. Keluar Akun

Klik ikon **gear (⚙️)** di kanan atas header → **Keluar**.

---

## 3. Navigasi & Tata Letak

Header terdiri dari:

- **Baris logo** — logo + nama aplikasi di kiri; di kanan ada tombol **tema** (☀️/🌙) dan **gear (⚙️)**.
- **Baris bulan** — navigasi bulan: `‹ [Bulan] [Tahun] ›`. Klik nama bulan untuk memilih bulan lain; klik **➕ Mulai Bulan Baru** untuk membuat bulan berikutnya.
- **Grid navigasi 2×2** — empat tombol: **Dashboard**, **Riwayat**, **Statistik**, **Dompet**.

| Tombol | Fungsi |
|---|---|
| Dashboard | Ringkasan bulan berjalan: saldo, pocket, tagihan, transaksi berulang |
| Riwayat | Daftar transaksi + filter + pencarian + ekspor |
| Statistik | Laporan: ringkasan, per dompet, per kategori, tren, per bulan |
| Dompet | Kelola rekening/dompet & saldo |

Saat scroll ke bawah, header otomatis menghilang; scroll ke atas untuk memunculkannya kembali.

---

## 4. Dashboard

Dashboard adalah tampilan utama bulan berjalan. Bagian-bagiannya dari atas ke bawah:

### 4.1. Kartu Ringkasan
- **Total Pemasukan** — jumlah income + carry-over.
- **Teralokasi ke Pocket** — total budget yang dibagi ke pocket (aksen emas).
- **Uang Bebas (sisa)** — pemasukan − total alokasi.
- **Sisa Uang Bebas** — uang bebas − uang bebas yang sudah terpakai.

### 4.2. Catat Cepat (Quick Add)
Ketik satu baris seperti bahasa sehari-hari lalu tekan **Enter** untuk membuka form transaksi terisi:

| Contoh ketikan | Hasil |
|---|---|
| `makan 35k` | Pengeluaran 35.000, keterangan "makan" |
| `makan 35000 skincare` | Sama + pocket Skincare terpilih |
| `gaji 5jt` | Pengeluaran 5.000.000, keterangan "gaji" |

Awalan nominal: `k`/`rb` = ribu, `jt`/`juta` = juta. Kata setelah `ke` dipakai untuk memilih pocket berdasarkan nama.

### 4.3. Tagihan Bulan Ini
Menampilkan template berjenis **Tagihan** yang aktif:
- Label **"jatuh tempo"** jika tanggalnya sudah lewat di bulan berjalan.
- Tombol **Bayar** membuka form transaksi terisi (nominal + pocket).

### 4.4. Budget yang Perlu Dicek
Kartu peringatan untuk pocket yang pemakaiannya sudah ≥ 70% (maks. 3 teratas). Menampilkan persentase, nominal terpakai vs budget, dan bilah kemajuan. Berwarna oranye (waspada) atau merah (melebihi).

### 4.5. Pemasukan & Carry-over
- Daftar **pemasukan** bulan ini (label + nominal), bisa **Ubah**/**Hapus**, tombol **+ Tambah**.
- **Carry-over** — sisa bulan lalu, otomatis dihitung, bisa diubah manual.

### 4.6. Catatan Bulan Ini
Catatan bebas untuk bulan berjalan, tersimpan otomatis saat keluar kolom.

### 4.7. Alokasi Pocket (Donut)
Diagram lingkaran proporsi budget per pocket, lengkap dengan legenda warna + nominal di bawahnya.

### 4.8. Pocket
Daftar pocket bulan ini. Tiap pocket menampilkan:
- Dot warna + nama pocket + badge **Target** (jika ada goal tabungan).
- **Terpakai / Budget** + sisa.
- Bilah kemajuan (ungu = aman, oranye = waspada ≥80%, merah = over ≥100%).
- Jika ada target tabungan: baris "Terkumpul / %".

Klik pocket untuk langsung membuka form transaksi baru pada pocket itu. Tombol di atas daftar:
**Re-alokasi** (pindahkan budget antar pocket), **Transaksi Berulang**, **Kelola Kategori**.

### 4.9. Transaksi Berulang
Ringkasan template berulang yang aktif (lihat bab 9).

### 4.10. Rekening Utama / Dompet
Jika hanya **1 rekening** (mode default), tampil kartu besar:
- **Saldo saat ini** — dihitung dari saldo awal + pemasukan − pengeluaran/refund/transfer.
- Subtotal **Teralokasi** dan **Uang Bebas**, plus badge "sekat virtual".
Jika ada lebih dari satu dompet, tampil grid kartu saldo per dompet + tombol **Transfer**.

---

## 5. Pocket / Kategori

Kelola lewat Dashboard → **Kelola Kategori**, atau dari grid navigasi **Dompet** bila terhubung ke pengelolaan pocket.

### 5.1. Menambah Pocket
1. Isi **Nama** (mis. "Tabungan Liburan").
2. **Budget / bulan** — nominal yang dialokasikan tiap bulan.
3. **Target tabungan** (opsional) — jumlah tujuan kumpulan.
4. Pilih **Warna**, klik **+ Tambah**.

### 5.2. Mengubah / Menghapus
- Ubah nama, budget, warna, target langsung di daftar, lalu tekan **Simpan Perubahan (N)**.
- Tombol **Hapus** memindahkan transaksi pada pocket itu ke "Uang Bebas".

### 5.3. Mengurutkan
Seret gagang `⋮⋮` ke posisi baru, atau pakai tombol **▲/▼**. Urutan tersimpan saat **Simpan Perubahan**.

### 5.4. Re-alokasi
Tombol **Re-alokasi** membuka jendela untuk memindahkan sebagian budget dari satu pocket ke pocket lain, dengan pratinjau saldo sebelum/sesudah.

> Peringatan kuning muncul jika total alokasi melebihi pemasukan bulan berjalan.

---

## 6. Rekening / Dompet

Klik tombol **Dompet** di grid navigasi.

### 6.1. Mode Satu Rekening (default)
- Judul **"Rekening Utama"**; form tambah dompet disembunyikan karena pocket adalah sekat virtual dari rekening ini.
- Ubah **nama**, **warna**, dan **saldo awal** langsung di baris, lalu **Simpan Perubahan**.

### 6.2. Menyesuaikan Saldo (tanpa transaksi)
1. Klik link **Sesuaikan** di bawah "saldo saat ini".
2. Ketik **saldo bank sebenarnya** (mis. dari mutasi).
3. Aplikasi menampilkan **selisih** (+/−). Klik **Sesuaikan**.
4. Tekan **Simpan Perubahan** untuk menyimpan. **Tidak membuat transaksi**; pocket & carry-over tidak berubah.

### 6.3. Mode Banyak Dompet
Jika kamu menambahkan dompet fisik tambahan (mis. Cash, E-Wallet), tampil:
- Form **Tambah dompet** (nama, saldo awal, warna).
- Grid saldo per dompet di Dashboard + tombol **Transfer**.

### 6.4. Transfer Antar Dompet
Tombol **Transfer** membuka form: pilih dompet asal & tujuan, nominal, tanggal, keterangan. Transfer **tidak** mengubah pocket/uang bebas. Transfer melebihi saldo ditolak.

---

## 7. Transaksi

Buka form transaksi lewat **FAB (+)** di kanan bawah, klik pocket, tombol **Bayar** tagihan, atau Catat Cepat.

### 7.1. Tipe
| Tipe | Efek |
|---|---|
| **Pengeluaran** | Mengurangi sisa pocket (atau uang bebas) & saldo rekening |
| **Refund / Koreksi** | Menambah kembali sisa pocket & saldo rekening |
| **Transfer** | Memindahkan antar dompet; tidak mengubah pocket |

### 7.2. Kolom
- **Tanggal** — jika tanggal di bulan berbeda dari bulan yang sedang dibuka, muncul peringatan; transaksi dicatat ke bulan sesuai tanggal.
- **Tipe** — Pengeluaran / Refund.
- **Nominal (Rp)** — pratinjau format rupiah otomatis.
- **Kategori / Pocket** — pilih pocket atau "Uang Bebas".
- **Dompet** — di mode satu rekening otomatis "Rekening Utama"; di mode banyak, pilih dompet atau "tidak dilacak".
- **Keterangan** — wajib untuk uang bebas.

### 7.3. Edit & Hapus
Dari **Riwayat**: klik **Ubah** untuk mengedit, **Hapus** untuk menghapus (dengan konfirmasi).

---

## 8. Riwayat

### 8.1. Pilih Bulan
Dropdown **"Lihat bulan"** untuk melihat/edit transaksi bulan lain tanpa mengubah bulan di Dashboard.

### 8.2. Pencarian Global
Kolom **"Cari di semua bulan…"** mencari keterangan di seluruh bulan sekaligus. Hasil bisa di-ubah/di-hapus langsung.

### 8.3. Filter
- **Cari keterangan** (dalam bulan terpilih).
- **Semua kategori / Uang Bebas / pocket tertentu**.
- **Semua dompet / Tanpa dompet / dompet tertentu**.
- **Rentang tanggal** (dari – sampai).

Ringkasan di bawah filter menampilkan total **keluar**, **refund**, dan jumlah transaksi.

### 8.4. Pemasukan Bulan Ini
Blok derived yang menampilkan income bulan terpilih (label + nominal), termasuk keterangan "mengkredit saldo".

### 8.5. Ekspor CSV
Tombol **Export CSV** mengunduh transaksi hasil filter (atau seluruh bulan) sebagai file `.csv` (kompatibel Excel, dengan BOM UTF-8).

---

## 9. Transaksi Berulang

Buka lewat Dashboard → **Transaksi Berulang → Kelola**.

### 9.1. Tipe Template
| Tipe | Perilaku saat tanggal jatuh |
|---|---|
| **Pengeluaran** | Membuat transaksi pengeluaran otomatis |
| **Pemasukan** | Menambah ke daftar Pemasukan bulan itu |
| **Tagihan** | Tampil di Dashboard (bab 4.3); transaksi pengeluaran dibuat otomatis |
| **Transfer** | Membuat transfer otomatis antar dua dompet |

### 9.2. Membuat Template
1. Isi **Tanggal** (1–28), **Nominal**, **Keterangan**.
2. Pilih tipe. Untuk pengeluaran/tagihan pilih pocket + dompet; untuk transfer pilih dompet asal & tujuan.
3. Klik **+ Tambah Template**.

### 9.3. Mengelola
Setiap baris template bisa: aktif/nonaktif, ubah tanggal/nominal/keterangan/tipe/pocket/dompet, atau **Hapus**. Simpan lewat **Simpan Perubahan (N)**.

> Transaksi berulang dibuat untuk bulan berjalan & bulan mendatang, sekali (idempoten).

---

## 10. Statistik

Buka dari grid navigasi → **Statistik**.

### 10.1. Rentang & Granularitas
- **Rentang bulan**: 3 / 6 / 12 bulan terakhir, atau semua.
- **Granularitas tren**: **Harian** / **Mingguan** / **Bulanan** (pill di bawah judul).

### 10.2. Kartu Ringkasan
Total **Pemasukan**, **Dialokasikan**, **Belanja (net)**, **Sisa Akhir Bulan** dalam rentang terpilih.

### 10.3. Per Dompet
Tabel Masuk / Keluar / Net / Saldo per dompet (transfer dihitung masuk/keluar). Catatan: saldo = saldo saat ini seluruh bulan.

### 10.4. Belanja per Kategori
Donut total belanja per pocket dengan legenda warna + nominal.

### 10.5. Tren
Garis **Pemasukan vs Belanja** (bulanan) atau garis **Belanja** (harian/mingguan). Legend chip warna di bawah grafik.

### 10.6. Per Bulan
Tabel Pemasukan / Alokasi / Belanja / Sisa per bulan.

### 10.7. Cetak Laporan
Tombol **Cetak** membuka dialog print browser; layout dioptimalkan untuk kertas (header/aksi disembunyikan).

---

## 11. Tagihan

Lihat bab 4.3 (Dashboard) dan 9 (template tipe **Tagihan**). Intinya:
- Template tagihan muncul di section **Tagihan** dengan status **jatuh tempo** bila tanggalnya lewat.
- Tombol **Bayar** membuka form transaksi terisi — pengeluaran tercatat ke pocket yang dipilih dan mengurangi saldo rekening.

---

## 12. Pengaturan

### 12.1. Tema
Tombol ☀️/🌙 di header berpindah terang/gelap dengan animasi. Preferensi disimpan otomatis.

### 12.2. Menu Gear (⚙️)
- **Unduh Backup** — mengunduh seluruh data (dompet, semua bulan + kategori + transaksi, template) sebagai file JSON.
- **Pulihkan Backup** — memuat file JSON backup untuk mengembalikan data (dengan konfirmasi & reload otomatis).
- **Keluar** — logout dari akun.

> Backup berguna sebelum pindah perangkat/proyek, atau sebagai cadangan manual.

---

## 13. Model Data & Perhitungan

### 13.1. Struktur
- **wallet** — dompet: id, nama, warna, saldo awal, urutan.
- **month** — bulan: id (YYYY-MM), label, carry-over, incomes (jsonb), catatan.
- **category** — pocket per bulan: id, nama, key (slug stabil), budget, target, warna, urutan.
- **transaction** — transaksi: tanggal, tipe, nominal, pocket, dompet (asal/tujuan), keterangan.
- **recurring_template** — template berulang: tanggal, tipe, nominal, pocket, dompet, aktif.

### 13.2. Rumus
| Variabel | Rumus |
|---|---|
| Total Pemasukan | Σ income + carry-over |
| Teralokasi | Σ budget pocket |
| Uang Bebas | Total Pemasukan − Teralokasi |
| Sisa Uang Bebas | Uang Bebas − (pengeluaran − refund tanpa pocket) |
| Sisa Pocket | budget − (pengeluaran − refund pocket itu) |
| Saldo Rekening (1 rekening) | saldo awal + Σ income + refund − pengeluaran − transfer keluar |
| Sisa Akhir Bulan | Σ sisa pocket + sisa uang bebas |

### 13.3. Identitas Pocket Antar Bulan
Setiap bulan punya set pocket sendiri (id berbeda). Aplikasi memakai **key** (slug dari nama)
untuk tetap menyambungkan pocket antar bulan — jadi ganti nama tidak memutus riwayat.

### 13.4. Sinkronisasi
Aplikasi memuat data sekali saat masuk (tanpa realtime) dan **memuat ulang otomatis** setelah setiap
perubahan (tambah/ubah/hapus) agar selalu sinkron.

---

## 14. Pemecahan Masalah

| Gejala | Solusi |
|---|---|
| Loading lambat saat pertama buka | Data dimuat batch paralel — perbaiki koneksi; untuk mode Supabase pastikan internet stabil |
| Transaksi tidak mengurangi pocket | Pastikan memilih pocket (bukan "Uang Bebas") & tanggal benar (bulan sesuai) |
| Saldo rekening tidak berubah saat income ditambah | Income mengkredit saldo otomatis — cek kartu **Rekening Utama** setelah refresh |
| Tombol Simpan tidak aktif | Pastikan ada perubahan (angka di tombol = jumlah baris berubah) |
| Backup gagal dipulihkan | Pastikan file adalah hasil **Unduh Backup** (JSON valid), lalu muat ulang halaman |
| Reset password tak terkirim | Di mode lokal tidak didukung; di Supabase cek folder spam / SMTP pengembang |
| Data tampak "hilang" | Periksa pemilihan **bulan** di header & filter di Riwayat |

---

## 15. Catatan Teknis (untuk pengembang)

- **Stack**: Vite + React 18 + Tailwind CSS 3; backend Supabase (PostgreSQL + RLS) atau localStorage.
- **Skema SQL** ada di `supabase/schema.sql`; migrasi lanjutan di `supabase/migration-*.sql`
  (recurring income, category key, RLS referensial, transfer berulang).
- **Skrip**: `npm run dev` (pengembangan), `npm run build` (produksi), `npm run test` (uji, vitest).
- File penting: `src/store/StoreContext.jsx` (state & aksi), `src/lib/calc.js` (perhitungan),
  `src/store/backends/supabase.js` & `local.js` (backend).
- Backup JSON yang diunduh dapat dipindah antar proyek/akun Supabase melalui **Pulihkan Backup**.

---

*Dokumen ini disusun untuk versi 0.1. Fitur dapat berubah seiring pembaruan aplikasi.*

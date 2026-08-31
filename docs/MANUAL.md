# Zheabraa Pocket Budgeting — Buku Manual

> Versi 0.1 · Bahasa: Indonesia · Aplikasi web (Vite + React + Supabase / localStorage)

---

## 1. Tentang Zheabraa

Zheabraa adalah aplikasi keuangan pribadi dengan metode **pocket (amplop) digital**.
Kamu memiliki **1 Rekening Utama** (sumber dana fisik) dan membaginya menjadi
beberapa **pocket virtual**. Setiap pocket memiliki **budget bulanan**. Saat
belanja, uang keluar dari pocket sekaligus mengurangi saldo rekening — persis
seperti amplop sungguhan, tapi uang tetap tersimpan di satu rekening.

**Konsep dasar:**
- **Pemasukan** — gaji, pendapatan sampingan, dll. Menambah saldo rekening.
- **Alokasi** — membagi pemasukan ke pocket (menetapkan budget tiap kategori).
- **Uang Bebas** — sisa pemasukan yang belum dialokasikan ke pocket mana pun.
- **Pengeluaran** — belanja yang dibayar dari pocket tertentu atau uang bebas.

Dengan cara ini kamu selalu tahu: *"pocket mana yang masih aman, mana yang
mulai menipis, dan berapa total uang di rekening."*

---

## 2. Memulai

### 2.1. Mode Penyimpanan Data

| Mode | Data disimpan di | Akses |
|------|------------------|-------|
| **Supabase** (default) | Cloud (server) | HP & laptop, tersinkron antar perangkat |
| **Lokal** | localStorage perangkat ini | Offline, hanya di satu perangkat |

Mode dipilih pengembang lewat file `.env`. Di halaman login, muncul badge
**"Mode lokal"** jika mode lokal aktif. Dalam mode lokal, fitur reset password
tidak tersedia.

### 2.2. Membuat Akun

1. Buka aplikasi, lalu klik **Buat akun** di halaman login.
2. Isi **Nama**, **Email**, dan **Password** (minimal 6 karakter).
3. Klik **Daftar**.
4. Akun baru otomatis dibuat dengan:
   - 1 dompet **Rekening Utama** (saldo awal 0).
   - 6 pocket default: Transport, Gym, Date, Giving, Saving, Skincare
     (budget masing-masing 0, dapat diubah kapan saja).

### 2.3. Login & Logout

- Masukkan **email** dan **password**, lalu klik **Masuk**.
- Untuk keluar: klik ikon **gear (⚙️)** di pojok kanan atas header, lalu pilih **Keluar**.

### 2.4. Lupa Password

- Di halaman login, klik **Lupa password?**.
- Masukkan email akun. Link reset akan dikirim ke email tersebut.
- **Mode lokal** tidak mendukung reset password.

---

## 3. Navigasi

Header aplikasi terdiri dari tiga baris:

1. **Baris atas** — logo + nama aplikasi di kiri; di kanan tombol **tema** (☀️/🌙)
   dan **gear (⚙️)** untuk menu pengaturan.
2. **Baris tengah** — navigasi bulan: `‹ [Bulan] [Tahun] ›`. Klik nama bulan untuk
   memilih bulan lain; pilih **➕ Mulai Bulan Baru** untuk membuat bulan berikutnya.
3. **Baris bawah** — grid navigasi 2×2 dengan tombol: **Dashboard**, **Riwayat**,
   **Statistik**, dan **Dompet**.

**Perilaku scroll:** saat kamu scroll ke bawah, header otomatis menghilang agar
konten lebih lega; scroll ke atas akan memunculkannya kembali.

---

## 4. Dashboard

Dashboard adalah tampilan utama bulan berjalan. Berikut urutan bagiannya:

### 4.1. Kartu Ringkasan

Empat kartu cepat:
- **Total Pemasukan** — jumlah pemasukan + carry-over.
- **Teralokasi ke Pocket** — total budget yang dibagi ke pocket (berwarna emas).
- **Uang Bebas** — pemasukan dikurangi alokasi (sebelum dipakai).
- **Sisa Uang Bebas** — uang bebas dikurangi yang sudah terpakai.

### 4.2. Catat Cepat (Quick Add)

Ketik satu baris seperti bahasa sehari-hari lalu tekan **Enter**. Form transaksi
akan terbuka dengan data terisi otomatis.

| Contoh ketikan | Hasil |
|----------------|-------|
| `makan 35k` | Pengeluaran Rp 35.000, keterangan "makan" |
| `makan 35000 skincare` | Pengeluaran Rp 35.000 + pocket Skincare terpilih |
| `gaji 5jt` | Nominal 5.000.000, keterangan "gaji" |

Awalan: `k` / `rb` = 1.000, `jt` / `juta` = 1.000.000. Kata setelah `ke`
dipakai untuk memilih pocket berdasarkan nama.

### 4.3. Tagihan Bulan Ini

Menampilkan template bertipe **Tagihan** yang aktif. Muncul badge **"jatuh
tempo"** jika tanggalnya sudah lewat bulan ini. Tombol **Bayar** membuka form
transaksi yang sudah terisi nominal dan pocket.

### 4.4. Budget yang Perlu Dicek

Tiga pocket teratas dengan pemakaian budget ≥ 70%. Warna **oranye** = waspada,
**merah** = melebihi. Muncul otomatis, berguna untuk mengingatkan sebelum
kebobolan.

### 4.5. Pemasukan & Carry-over

- Daftar pemasukan bulan ini (label + nominal). Setiap baris punya tombol
  **Ubah** dan **Hapus**, serta tombol **+ Tambah** untuk income baru.
- **Carry-over** — sisa bulan lalu yang otomatis dibawa ke bulan ini. Bisa diubah manual.

### 4.6. Catatan Bulan Ini

Kolom catatan bebas untuk bulan berjalan. Tersimpan otomatis saat kolom
ditinggalkan.

### 4.7. Alokasi Pocket (Donut)

Diagram lingkaran proporsi budget per pocket, dilengkapi **legenda warna +
nominal** di bawahnya.

### 4.8. Daftar Pocket

Kartu per pocket menampilkan:
- Nama, warna, badge **Target** (jika ada target tabungan).
- Nominal terpakai / budget, dan sisa.
- Bilah kemajuan: ungu/violet = aman, oranye ≥ 80%, merah ≥ 100%.

Klik kartu pocket untuk langsung membuka form transaksi baru pada pocket itu.
Di atas daftar ada tombol **Re-alokasi**, **Transaksi Berulang**, dan
**Kelola Kategori**.

### 4.9. Transaksi Berulang

Ringkasan template berulang yang aktif bulan ini (lihat bab 9).

### 4.10. Rekening Utama / Dompet

- **Mode 1 rekening (default):** kartu besar **Rekening Utama** dengan saldo
  saat ini (sudah termasuk kredit pemasukan), plus subtotal *Teralokasi* &
  *Uang Bebas*, dan badge "sekat virtual".
- **Mode lebih dari 1 dompet:** grid kartu saldo per dompet + tombol **Transfer**.

---

## 5. Pocket / Kategori

Kelola lewat Dashboard → **Kelola Kategori** (tombol di seksi Pocket).

### 5.1. Menambah Pocket

Form **Tambah kategori** berisi: nama, budget per bulan, target tabungan
(opsional), dan pemilihan warna. Klik **+ Tambah**.

### 5.2. Mengubah & Menghapus

- Ubah nama, budget, warna, atau target langsung pada baris, lalu tekan
  **Simpan Perubahan (N)**.
- Tombol **Hapus** (dengan konfirmasi) — semua transaksi pada kategori itu
  dipindahkan ke "Uang Bebas".

### 5.3. Mengurutkan

Seret gagang `⋮⋮` ke posisi baru, atau gunakan tombol **▲ / ▼**. Urutan
tersimpan saat menekan **Simpan Perubahan**.

### 5.4. Target Tabungan

Setiap pocket bisa memiliki target kumpulan (misal "Terkumpul 5jt dari 10jt").
Ditampilkan progress bar + badge **Target Tercapai** saat tercapai.

### 5.5. Re-alokasi

Memindahkan nominal antar pocket. Terdapat pratinjau budget sebelum dan sesudah
re-alokasi.

> Peringatan "Alokasi melebihi pemasukan" muncul jika total budget lebih besar
> dari total pemasukan bulan berjalan.

---

## 6. Rekening / Dompet

Klik tombol **Dompet** pada grid navigasi → terbuka modal **Kelola Dompet**.

### 6.1. Mode Satu Rekening

Mode default. Judul modal "Rekening Utama", form tambah dompet disembunyikan
karena pocket adalah sekat virtual dari rekening ini. Kamu dapat mengubah nama,
warna, dan saldo awal langsung pada baris, lalu tekan **Simpan Perubahan**.

### 6.2. Menyesuaikan Saldo (Tanpa Transaksi)

1. Klik link **Sesuaikan** di bawah "saldo saat ini".
2. Ketik **saldo bank sebenarnya** (misalnya dari mutasi rekening).
3. Aplikasi menghitung **selisih** (+ / −).
4. Klik **Sesuaikan**, lalu tekan **Simpan Perubahan** di belakang.

Proses ini **tidak membuat transaksi baru** — hanya menyesuaikan saldo rekening.

### 6.3. Mode Banyak Dompet

Jika kamu menambahkan dompet fisik tambahan (misal Cash, E-Wallet), tampil:
- Form **Tambah dompet** (nama, saldo awal, warna).
- Grid kartu saldo per dompet di Dashboard.
- Tombol **Transfer** untuk memindahkan uang antar dompet.

### 6.4. Transfer

Pilih dompet asal & tujuan, nominal, dan tanggal. Transfer **tidak** mengubah
pocket/uang bebas. Transfer yang melebihi saldo dompet asal akan ditolak.

---

## 7. Transaksi

### 7.1. Membuka Form

- Tombol **FAB (+)** di kanan bawah layar (selalu tersedia).
- Klik kartu pocket di Dashboard.
- Klik **Bayar** pada seksi Tagihan.
- Gunakan Catat Cepat (bab 4.2).

### 7.2. Jenis Transaksi

| Jenis | Efek ke pocket | Efek ke rekening |
|-------|----------------|------------------|
| Pengeluaran | Mengurangi sisa pocket / uang bebas | Mengurangi saldo |
| Refund / Koreksi | Menambah sisa pocket / uang bebas | Menambah saldo |
| Transfer | Tidak ada efek | Memindahkan antar dompet |

### 7.3. Memilih Tanggal

Tanggal menentukan bulan tempat transaksi dicatat. Jika tanggal berada di bulan
yang berbeda dari bulan yang sedang dibuka, muncul peringatan — pocket yang
terpotong adalah pocket dari bulan sesuai tanggal tersebut.

### 7.4. Kategori & Dompet

- **Uang Bebas** — pengeluaran tanpa pocket.
- **Pocket** — pilih salah satu pocket; budget pocket berkurang.
- **Dompet** — di mode 1 rekening otomatis "Rekening Utama"; di mode banyak
  pilih dompet atau "tidak dilacak".

### 7.5. Tombol Simpan

Saat proses menyimpan, tombol menampilkan **"Menyimpan…"** dan non-aktif
sebentar untuk mencegah klik ganda.

### 7.6. Edit & Hapus

Dari halaman **Riwayat** klik **Ubah** untuk mengedit atau **Hapus** untuk
menghapus (dengan konfirmasi).

---

## 8. Riwayat

### 8.1. Filter

- **Cari keterangan** (teks bebas).
- **Kategori** — semua / Uang Bebas / pocket tertentu.
- **Dompet** — semua / tanpa dompet / dompet tertentu.
- **Tanggal** — rentang dari s/d.

Di bawah filter ada ringkasan total pengeluaran, refund, dan jumlah transaksi
dari hasil filter.

### 8.2. Pilih Bulan

Dropdown **"Lihat bulan"** untuk melihat transaksi bulan lain tanpa mengubah
bulan aktif di Dashboard.

### 8.3. Pencarian Global

Kolom **"Cari di semua bulan…"** mencari keterangan di seluruh bulan sekaligus.
Hasil bisa di-ubah atau di-hapus langsung — aplikasi tetap mengingat bulan asal
transaksi.

### 8.4. Pemasukan Bulan Ini

Blok yang menampilkan data income bulan terpilih (label + nominal, dengan tanda
"+"). Ini data derived, bukan transaksi — tetapi ikut mengkredit saldo rekening.

### 8.5. Ekspor CSV

Tombol **Export CSV** mengunduh hasil filter (atau seluruh bulan jika tanpa
filter) sebagai file `.csv`. File menyertakan BOM UTF-8 agar terbuka rapi di Excel.

---

## 9. Transaksi Berulang

Dashboard → **Transaksi Berulang** → **Kelola**.

### 9.1. Jenis Template

| Tipe | Perilaku otomatis |
|------|-------------------|
| Pengeluaran | Membuat transaksi pengeluaran pada tanggal tertentu |
| Pemasukan | Menambah ke daftar income bulan itu |
| Tagihan | Muncul di seksi Tagihan Dashboard; membuat transaksi pengeluaran |
| Transfer | Membuat transaksi transfer antar dua dompet |

### 9.2. Membuat Template

1. Isi **tanggal**, **nominal**, dan **keterangan**.
2. Pilih tipe. Untuk pengeluaran/tagihan: pilih pocket + dompet.
   Untuk transfer: pilih dompet asal & tujuan.
3. Klik **+ Tambah Template**.

### 9.3. Mengelola

Setiap baris template dapat: diaktifkan/nonaktifkan (checkbox), diubah
tanggal/nominal/tipe/dompetnya, atau dihapus (dengan konfirmasi). Simpan lewat
tombol **Simpan Perubahan (N)**.

---

## 10. Statistik

### 10.1. Rentang & Granularitas

- **Rentang bulan** — 3, 6, 12 bulan terakhir, atau semua bulan.
- **Granularitas tren** — Harian / Mingguan / Bulanan.

### 10.2. Ringkasan

Total **Pemasukan**, **Dialokasikan**, **Belanja (net)**, dan **Sisa Akhir Bulan**.

### 10.3. Per Dompet

Tabel Masuk / Keluar / Net / Saldo per dompet. Transfer dihitung sebagai
masuk/keluar. Saldo = saldo saat ini dari seluruh bulan.

### 10.4. Belanja per Kategori

Donut chart total belanja per pocket, dengan legenda warna + nominal.

### 10.5. Tren

Garis **Pemasukan vs Belanja** (granularitas Bulanan), atau garis **Belanja**
saja (granularitas Harian/Mingguan). Ada legenda chip warna di bawah grafik.

### 10.6. Per Bulan

Tabel Pemasukan / Alokasi / Belanja / Sisa per bulan.

### 10.7. Cetak Laporan

Tombol **Cetak** membuka dialog cetak browser; layout halaman dioptimalkan
untuk kertas (header & elemen aksi disembunyikan).

---

## 11. Tagihan

Tagihan adalah template bertipe **Tagihan**. Muncul di Dashboard pada seksi
**Tagihan** beserta tanggal, nominal, dan pocket tujuan.

- Badge **"jatuh tempo"** jika tanggal ≤ tanggal hari ini.
- Tombol **Bayar** membuka form transaksi pengeluaran yang sudah terisi.
- Setelah dibayar, transaksi tercatat sebagai pengeluaran biasa di bulan tersebut.

---

## 12. Pengaturan & Backup

### 12.1. Tema

Tombol ☀️/🌙 di header untuk berpindah mode terang/gelap (dengan animasi View
Transitions). Preferensi tersimpan otomatis.

### 12.2. Menu Gear (⚙️)

- **Unduh Backup** — mengunduh seluruh data (dompet, semua bulan + transaksi,
  template) sebagai file JSON.
- **Pulihkan Backup** — memilih file JSON untuk memulihkan data. Aplikasi akan
  otomatis memuat ulang setelah berhasil.
- **Keluar** — logout dari akun.

> Lakukan backup sebelum mengganti perangkat atau mereset data.

---

## 13. Model Data

### 13.1. Rumus Keuangan

| Variabel | Rumus |
|----------|-------|
| Total Pemasukan | Σ income + carry-over |
| Teralokasi | Σ budget pocket |
| Uang Bebas | Pemasukan − Alokasi |
| Sisa Uang Bebas | Uang Bebas − (expense − refund tanpa pocket) |
| Sisa Pocket | budget − (expense − refund pocket tersebut) |
| Saldo Rekening (1 rekening) | saldo awal + Σ income + refund − expense − transfer keluar |

### 13.2. Carry-over

Sisa akhir bulan menjadi carry-over bulan berikutnya secara otomatis saat
membuat bulan baru.

---

## 14. Tanya Jawab

| Masalah | Solusi |
|---------|--------|
| Loading lama saat pertama buka | Data dimuat dalam batch paralel; periksa koneksi internet |
| Transaksi tidak mengurangi pocket | Pastikan memilih pocket (bukan "Uang Bebas") dan tanggal sesuai bulan |
| Saldo rekening tidak bergerak saat income ditambah | Income otomatis mengkredit saldo — cek kartu Rekening Utama |
| Tombol Simpan tidak aktif | Belum ada perubahan; angka di tombol = jumlah baris yang berubah |
| Backup tidak bisa dipulihkan | Pastikan file adalah hasil "Unduh Backup" (JSON valid) |
| Lupa password | Gunakan "Lupa password?" di halaman login atau hubungi pengembang |
| Data tidak muncul di pencarian | Periksa filter bulan/kategori/dompet yang sedang aktif |

---

## 15. Informasi Umum

Aplikasi dikembangkan oleh **hafizbima (Haz Bim)**.

Umpan balik, laporan bug, dan permintaan fitur dapat dikirim melalui repositori:
<https://github.com/hafizbima/zheabraa>.

*Dokumen ini disusun untuk versi 0.1. Fitur dapat berubah seiring pembaruan aplikasi.*

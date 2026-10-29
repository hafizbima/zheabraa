# Audit UI/UX & Evaluasi Kemudahan Penggunaan (Usability Crosscheck)

- **Proyek:** Zheabraa (Gimme Money - Pocket Budgeting)
- **Tanggal Audit:** 2026-10-29
- **Auditor:** Senior Software Engineer (10+ Years Experience)
- **Metodologi Agency Skills:**
  - `agency-persona-walkthrough-specialist` (Simulasi Kognitif, Fogg Behavior Model, LIFT Model)
  - `agency-ux-researcher` (Evaluasi Alur Tugas & Hambatan Perilaku Pengguna)
  - `agency-ux-architect` (Arsitektur Informasi, Navigasi & Hierarki Layout)
  - `agency-ui-designer` (Konsistensi Komponen, Ergonomi Form & Umpan Balik Visual)
  - `agency-ui-finish-gate-reviewer` (Spesifisitas Produk, First-Read Hierarchy & Kriteria Kelayakan Rilis)
  - `agency-accessibility-auditor` & `agency-mobile-app-builder` (Standar WCAG 2.2 AA & Ergonomi Mobile)

---

## Ringkasan Eksekutif

Berdasarkan pembedahan kode sumber aplikasi secara menyeluruh, keluhan pengguna yang merasa **kesulitan saat menggunakan aplikasi** bukan disebabkan oleh tampilan warna atau estetika dasar, melainkan oleh **4 akar masalah utama**:

1. **Bug Logika pada Alur Interaksi Utama:** Fitur *Catat Cepat* (`QuickAdd`) gagal memproses contoh teks yang tertulis di *placeholder*-nya sendiri dan menghapus ketikan pengguna tanpa pesan apa pun.
2. **Cold-Start & Onboarding Kosong:** Pengguna baru langsung disuguhi angka `Rp 0` di seluruh layar dengan tombol utama *"Tambah Pengeluaran"*, sementara tempat mengisi *Pemasukan* tersembunyi di urutan ke-6 di bawah layar.
3. **Beban Kognitif (Cognitive Overload) di Dashboard:** Halaman utama menumpuk 11 seksi vertikal sekaligus, menduplikasi metrik yang sama, dan meletakkan fitur inti (*Pocket*) jauh di bawah lipatan layar (*below the fold*).
4. **Kebocoran Model Mental Developer ke UI:** Terdapat jargon internal (`Uang Bebas = A langsung, Pocket = child A`, `sweep myBCA`), tombol simpan dua tahap (*draft trap*) yang rawan menghilangkan data, serta notifikasi sukses yang selalu berwarna merah (*error state*).

---

## Matriks Skala Prioritas

Skala prioritas disusun berdasarkan **Dampak ke Pengguna (User Impact)** vs **Beban Pengerjaan (Engineering Effort)**:

- **P0 (Critical / Quick Wins):** Bug fungsional UX atau kebingungan fatal yang menghambat pemakaian harian. Effort kecil, dampak sangat besar. Wajib diperbaiki segera.
- **P1 (High / Major UX Flow):** Masalah arsitektur informasi, alur pengguna baru (*onboarding*), dan duplikasi kontrol yang membuat aplikasi terasa rumit.
- **P2 (Medium / Structural & Data Safety):** Risiko kehilangan perubahan data (*unsaved draft*), ambiguitas konsep fitur, dan ergonomi layar sempit.
- **P3 (Low / Polish & Accessibility):** Penyempurnaan aksesibilitas modal dan optimasi ruang layar *mobile*.

| ID | Prioritas | Temuan Masalah | Lensa Agency Skill | Dampak | Effort | Lokasi File Utama |
| :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **UX-01** | **P0** | Bug `QuickAdd`: contoh placeholder gagal diparsing, ketikan hilang tanpa pesan, dan tidak mendukung pemasukan | `persona-walkthrough`, `ux-researcher` | Sangat Tinggi | Kecil | `src/components/QuickAdd.jsx`, `src/components/TransactionForm.jsx` |
| **UX-02** | **P0** | Semua notifikasi *toast* (`notice`) selalu berwarna merah (`rose-500`) termasuk saat aksi berhasil | `ui-designer`, `finish-gate` | Tinggi | Sangat Kecil | `src/App.jsx`, `src/store/DataContext.jsx` |
| **UX-03** | **P0** | Jargon internal developer (`child A`, `myBCA sweep`) tampil di antarmuka pengguna | `persona-walkthrough`, `finish-gate` | Tinggi | Sangat Kecil | `src/components/Dashboard.jsx`, `src/components/TransactionForm.jsx` |
| **UX-04** | **P0** | Input nominal Rupiah tidak memformat titik ribuan saat diketik (rawan salah ketik jumlah nol) | `ui-designer`, `ux-researcher` | Sangat Tinggi | Kecil | `src/lib/money.js`, `src/components/TransactionForm.jsx`, `src/components/AddPocketModal.jsx`, `src/components/Dashboard.jsx` |
| **UX-05** | **P1** | *Cold-Start Problem*: Pengguna baru tidak dipandu mengisi Pemasukan & Budget sebelum mencatat pengeluaran | `persona-walkthrough`, `ux-researcher` | Sangat Tinggi | Sedang | `src/components/Dashboard.jsx`, `src/store/defaults.js` |
| **UX-06** | **P1** | *Cognitive Overload* di Dashboard (11 seksi menumpuk, metrik duplikat, daftar Pocket terkubur di bawah) | `ux-architect`, `finish-gate` | Sangat Tinggi | Sedang | `src/components/Dashboard.jsx` |
| **UX-07** | **P1** | Duplikasi pemilih bulan dan 2 kolom pencarian bertumpuk di halaman `Riwayat` | `ux-architect`, `ui-designer` | Tinggi | Kecil | `src/components/TransactionList.jsx` |
| **UX-08** | **P1** | Menu `Mulai Bulan Baru` tersembunyi tanpa indikator dropdown & mereset budget pocket menjadi `Rp 0` | `ux-researcher`, `ux-architect` | Tinggi | Sedang | `src/components/Header.jsx`, `src/store/MonthContext.jsx` |
| **UX-09** | **P2** | Jebakan *Two-Step Save* pada `Kelola Pocket`, `Kelola Dompet` (`Sesuaikan Saldo`), dan `Transaksi Berulang` | `ux-researcher`, `ui-designer` | Tinggi | Sedang | `src/components/WalletManager.jsx`, `src/components/CategoryManager.jsx`, `src/components/RecurringManager.jsx` |
| **UX-10** | **P2** | Ambiguitas konsep *Budget Bulanan* vs *Target Tabungan* dalam satu kartu Pocket yang sama | `ux-architect`, `finish-gate` | Sedang | Sedang | `src/components/AddPocketModal.jsx`, `src/components/PocketCard.jsx`, `src/store/MonthContext.jsx` |
| **UX-11** | **P2** | Grid navigasi Header mencampur perpindahan halaman, pembukaan modal (`Dompet`), dan aksi cetak (`Cetak`) | `ux-architect`, `mobile-app-builder` | Sedang | Sedang | `src/components/Header.jsx`, `src/App.jsx` |
| **UX-12** | **P3** | `SaveGoalModal` tidak memakai komponen `Modal` standar (tidak ada `Escape`, `aria-modal`, dan *scroll lock*) | `accessibility-auditor` | Rendah | Sangat Kecil | `src/components/SaveGoalModal.jsx` |

---

## Detail Temuan & Rekomendasi Perbaikan

### Prioritas P0: Critical & Quick Wins (Wajib Segera)

#### [UX-01] Bug Fatal pada Fitur "Catat Cepat" (`QuickAdd`)
- **Lokasi:** `src/components/QuickAdd.jsx:5-45`, `src/components/TransactionForm.jsx:13-24`
- **Lensa Agency:** `agency-persona-walkthrough-specialist` (Fogg Behavior Model: *Ability* gagal saat *Prompt* diikuti)
- **Akar Masalah:**
  1. Placeholder menampilkan contoh: `'Cepat: "makan 35k skincare" atau "gaji 5jt"'`.
  2. Regex pada `parseQuick` (`/^(.+?)\s+(\d[\d.]*(?:k|rb|jt|juta)?)\s*(?:ke\s*(.+))?$/i`) mewajibkan kata **`ke`** sebelum nama kategori.
  3. Saat pengguna mengetik `makan 35k skincare` (tanpa kata `ke`, persis seperti instruksi placeholder) lalu menekan `Enter`, `parseQuick` mengembalikan `null`.
  4. Baris `setQuick('')` tetap dijalankan sebelum `if (!prefill) return`, sehingga teks yang sudah diketik pengguna langsung terhapus tanpa membuka form dan tanpa pesan kesalahan.
  5. Jika pengguna mengetik contoh kedua (`gaji 5jt`), `TransactionForm` terbuka dengan tipe default `Pengeluaran` (`expense`), bukan `Pemasukan` (`income`).
- **Saran Perbaikan:**
  - Ubah parser di `parseQuick` agar kata `ke` bersifat opsional dan tetap mencocokkan token terakhir dengan daftar kategori.
  - Deteksi kata kunci pemasukan (seperti `gaji`, `bonus`, `pemasukan`, `thr`, `komisi`) untuk mengirimkan `type: 'income'` pada objek `prefill`.
  - Di `TransactionForm.jsx`, baca `prefill?.type` sebagai nilai awal state `type`.
  - Jika format ketikan tidak mengandung angka (misal pengguna hanya mengetik `"makan siang"`), jangan hapus input secara diam-diam: tetap buka `TransactionForm` dengan mengisi kolom `description` menggunakan teks tersebut.

#### [UX-02] Semua Notifikasi Toast (`notice`) Selalu Berwarna Merah Error
- **Lokasi:** `src/App.jsx:143-151`, `src/store/DataContext.jsx:16-20`
- **Lensa Agency:** `agency-ui-designer` & `agency-ui-finish-gate-reviewer`
- **Akar Masalah:**
  - Komponen toast di `App.jsx` menggunakan warna hardcoded `border-rose-500 text-rose-500`.
  - Seluruh pemberitahuan sukses (seperti `"Notifikasi diaktifkan"`, `"5 transaksi diimpor"`, `"Semua data berhasil direset"`) tampil dengan warna merah bahaya sehingga pengguna mengira terjadi kegagalan sistem.
- **Saran Perbaikan:**
  - Dukung tipe notifikasi atau deteksi konteks pesan: gunakan aksen `teal-600` / `emerald-600` untuk pesan keberhasilan/informasi dan `rose-500` khusus untuk pesan error/peringatan.

#### [UX-03] Jargon Internal Developer Bocor ke Antarmuka Pengguna
- **Lokasi:** `src/components/Dashboard.jsx:577`, `src/components/TransactionForm.jsx:228`
- **Lensa Agency:** `agency-persona-walkthrough-specialist` (LIFT Model: *Clarity* turun & *Anxiety* naik)
- **Akar Masalah:**
  - Pada kartu Rekening Utama tertulis: `saldo saat ini (Uang Bebas = A langsung, Pocket = child A)`. Istilah `A langsung` dan `child A` adalah catatan struktur data internal yang membingungkan pengguna non-teknis.
  - Pada `TransactionForm.jsx:228` tertulis: `Sweep/pindah dana di myBCA tidak perlu dicatat...`. Kalimat ini terlalu spesifik pada satu produk bank dan memakai istilah teknis *sweep*.
- **Saran Perbaikan:**
  - Ubah `Dashboard.jsx:577` menjadi: `"Total uang di rekeningmu (gabungan Uang Bebas & seluruh Pocket)"`.
  - Ubah `TransactionForm.jsx:228` menjadi: `"Pengeluaran ini langsung memotong sisa Uang Bebas bulan ini."`

#### [UX-04] Input Nominal Rupiah Tanpa Pemisah Ribuan Saat Mengetik
- **Lokasi:** `src/lib/money.js`, `src/components/TransactionForm.jsx:165-177`, `src/components/AddPocketModal.jsx:76-98`, `src/components/Dashboard.jsx:389-409`, `src/components/CategoryManager.jsx:264-293`
- **Lensa Agency:** `agency-ui-designer` (Error Prevention)
- **Akar Masalah:**
  - Saat mengetik angka jutaan (contoh: `15000000`), kolom input menampilkan deretan nol tanpa titik pemisah (`15.000.000`). Pada `AddPocketModal`, `Pemasukan`, dan `CategoryManager`, tidak ada pratinjau format Rupiah di bawah input, sehingga risiko salah input satu digit nol sangat tinggi.
- **Saran Perbaikan:**
  - Tambahkan fungsi `formatNumberInput(val)` di `src/lib/money.js` yang memformat angka dengan titik ribuan (`15.000.000`) langsung saat pengguna mengetik. Fungsi `toInt()` yang sudah ada secara otomatis mengabaikan karakter titik saat menyimpan.

---

### Prioritas P1: High Impact UX & Arsitektur Informasi

#### [UX-05] Cold-Start Problem (Pengguna Baru Tidak Tahu Urutan Pakai Aplikasi)
- **Lokasi:** `src/components/Dashboard.jsx:176-245`, `src/store/defaults.js:5-42`
- **Lensa Agency:** `agency-persona-walkthrough-specialist` (Five-Second Test & First-Session Journey)
- **Akar Masalah:**
  - Metode *Pocket Budgeting* memiliki urutan logis: **(1) Masukkan Pemasukan / Saldo Awal -> (2) Bagi Budget ke Pocket -> (3) Catat Pengeluaran**.
  - Saat pertama kali masuk, seluruh angka bernilai `Rp 0`, namun tombol utama di kartu paling atas adalah **"Tambah Pengeluaran"**, sedangkan bagian **"Pemasukan & Carry-over"** berada jauh di urutan ke-6 di bawah layar.
  - Nama pocket bawaan masih menggunakan bahasa Inggris (`Transport`, `Gym`, `Date`, `Giving`, `Saving`, `Skincare`) yang kurang relevan bagi sebagian pengguna umum di Indonesia.
- **Saran Perbaikan:**
  - Tampilkan kartu panduan *Onboarding 3 Langkah* di bagian atas Dashboard ketika `inflow === 0 && allocated === 0`, lengkap dengan tombol pintas: **1. Isi Pemasukan**, **2. Atur Budget Pocket**, **3. Catat Transaksi**.
  - Pada Hero Card, jika `inflow === 0`, tampilkan tombol aksi **"Isi Pemasukan Dulu"** di samping tombol pengeluaran.

#### [UX-06] Cognitive Overload di Dashboard (11 Seksi Vertikal & Duplikasi Kartu)
- **Lokasi:** `src/components/Dashboard.jsx:175-609`
- **Lensa Agency:** `agency-ux-architect` & `agency-ui-finish-gate-reviewer`
- **Akar Masalah:**
  - Pengguna harus menggulir melewati 8 seksi (Hero, 3 Kartu Metrik, Aman/Hari, QuickAdd, Tagihan, Alert Budget, Pemasukan, Catatan Bulanan, Donut Chart) sebelum akhirnya menemukan **Daftar Pocket** di bagian bawah.
  - Kartu metrik ke-3 (`Sisa Uang Bebas` dan `terpakai`) di baris 251 menduplikasi informasi yang sudah tampil besar di Hero Card tepat di atasnya.
  - Header seksi `Pocket` memuat 5 tombol aksi sekaligus (`Tambah Pocket`, `Kelola Pocket`, `Re-alokasi`, `Transaksi Berulang`, `Template Budget`), lalu tepat di bawah daftar Pocket muncul lagi seksi `Transaksi Berulang`.
- **Saran Perbaikan:**
  - **Susun ulang urutan Dashboard berdasarkan frekuensi pemakaian harian:**
    1. Hero Card (*Sisa Uang Bebas* + *Aman Dibelanjakan / Hari* digabung atau berdekatan)
    2. `QuickAdd` (*Catat Cepat*)
    3. **Daftar Pocket** (fitur utama langsung terlihat tanpa *scroll* jauh)
    4. Tagihan & Peringatan Budget (hanya muncul jika ada yang perlu ditindaklanjuti)
    5. Pemasukan & Carry-over, Rekening/Dompet, Transaksi Berulang, Alokasi Chart, dan Catatan Bulan Ini.
  - Ganti kartu metrik ke-3 yang duplikat (`Sisa Uang Bebas`) menjadi **`Saldo Rekening`** (atau `Total Belanja Bulan Ini`).

#### [UX-07] Duplikasi Kontrol Bulan & 2 Kolom Pencarian di Halaman `Riwayat`
- **Lokasi:** `src/components/TransactionList.jsx:232-256`
- **Lensa Agency:** `agency-ux-architect`
- **Akar Masalah:**
  - Pengguna melihat pemilih bulan di Header (`< Oktober 2026 >`), namun di dalam kartu filter `Riwayat` ada lagi dropdown `"Lihat bulan"` yang mengubah state lokal `viewMonth` secara terpisah dari bulan aktif aplikasi.
  - Terdapat 2 kolom input pencarian tepat berurutan: `"Cari di semua bulan…"` dan `"Cari keterangan…"`, yang memaksa pengguna berpikir kolom mana yang harus dipakai.
- **Saran Perbaikan:**
  - Gunakan satu kontrol bulan global dari Header (atau sinkronkan langsung dengan `switchMonth`).
  - Satukan kedua kolom pencarian menjadi **1 kolom pencarian** dengan tombol *toggle* cakupan: `Bulan Ini` vs `Semua Bulan`.

#### [UX-08] Menu "Mulai Bulan Baru" Tersembunyi & Mereset Budget ke Rp 0
- **Lokasi:** `src/components/Header.jsx:276-308`, `src/store/MonthContext.jsx:66-94`
- **Lensa Agency:** `agency-ux-researcher`
- **Akar Masalah:**
  - Teks nama bulan di Header (`Oktober 2026`) adalah tombol pembuka menu `Pilih bulan` dan `+ Mulai Bulan Baru`, tetapi tidak memiliki ikon panah dropdown (`▾`) maupun border tombol sehingga tidak terlihat bisa diklik.
  - Saat pengguna memulai bulan baru via `Mulai Bulan Baru`, seluruh budget pocket disetel ulang menjadi `0` (`budgetAmount: 0`), memaksa pengguna mengisi ulang budget semua pocket dari nol setiap bulan.
- **Saran Perbaikan:**
  - Tambahkan ikon chevron `▾` pada tombol nama bulan di Header.
  - Pada dialog konfirmasi `Mulai Bulan Baru`, sediakan opsi default untuk **menyalin alokasi budget pocket dari bulan sebelumnya** (atau memilih dari Template Budget jika ada).

---

### Prioritas P2: Structural, Data Safety & Mobile Ergonomics

#### [UX-09] Jebakan "Two-Step Save" (Perubahan Hilang Tanpa Disadari)
- **Lokasi:** `src/components/WalletManager.jsx:196-360`, `src/components/CategoryManager.jsx:217-315`, `src/components/RecurringManager.jsx:209-328`
- **Lensa Agency:** `agency-ux-researcher` & `agency-ui-designer`
- **Akar Masalah:**
  - Pada `WalletManager`, saat pengguna mengklik `Sesuaikan` saldo, mengisi saldo bank sebenarnya, lalu menekan tombol **Sesuaikan** di modal kedua, perubahan tersebut **belum tersimpan ke database** (hanya mengubah draft di modal pertama). Jika pengguna langsung menutup modal `Kelola Dompet`, perubahan saldo hilang.
  - Pada `CategoryManager` dan `RecurringManager`, setiap item menampilkan 6-9 kontrol input sekaligus di dalam satu baris, dan perubahan baru tersimpan jika pengguna menekan tombol `Simpan Perubahan (N)` di footer. Jika pengguna menutup modal lewat tombol `✕` atau klik latar belakang saat `dirtyCount > 0`, seluruh perubahan hilang tanpa konfirmasi.
- **Saran Perbaikan:**
  - Buat aksi `Sesuaikan Saldo` di `WalletManager` langsung menyimpan perubahan ke store/backend saat dikonfirmasi.
  - Tambahkan proteksi saat menutup modal (`onClose`): jika `dirtyCount > 0`, tampilkan konfirmasi *"Ada perubahan yang belum disimpan. Simpan sekarang atau buang perubahan?"*.

#### [UX-10] Ambiguitas Konsep "Budget Bulanan" vs "Target Tabungan" dalam Satu Pocket
- **Lokasi:** `src/components/AddPocketModal.jsx:72-111`, `src/components/PocketCard.jsx:10-114`, `src/store/MonthContext.jsx:424-440`
- **Lensa Agency:** `agency-ux-architect` & `agency-ui-finish-gate-reviewer`
- **Akar Masalah:**
  - Form tambah/edit pocket memperbolehkan satu pocket memiliki *Budget Bulanan* sekaligus *Target Tabungan* secara bersamaan.
  - Di `MonthContext.jsx:424-440`, fungsi `useGoal` ("Pakai" tabungan) membuat transaksi `expense` pada `categoryId` **dan** mengurangi `savedAmount`. Karena `goalSaved()` di `calc.js:188` menghitung `savedAmount + Math.max(0, budgetAmount - categoryUsed)`, memakai tabungan pada pocket yang juga punya `budgetAmount` akan memotong saldo tabungan dua kali.
- **Saran Perbaikan:**
  - Berikan pilihan tipe Pocket yang jelas di `AddPocketModal`: **Pocket Pengeluaran (Budget Bulanan)** atau **Pocket Tabungan (Target Goal)** agar pengguna dan rumus kalkulasi tidak rancu.

#### [UX-11] Navigasi Header Mencampur Halaman, Modal, dan Fungsi Cetak
- **Lokasi:** `src/components/Header.jsx:311-375`
- **Lensa Agency:** `agency-mobile-app-builder` & `agency-ux-architect`
- **Akar Masalah:**
  - Enam tombol di header (`Dashboard`, `Riwayat`, `Statistik`, `Dompet`, `Laporan`, `Cetak`) tampak setara sebagai tab halaman, padahal `Dompet` membuka modal dan `Cetak` menjalankan `window.print()`.
  - Tinggi header di perangkat mobile memakan hampir sepertiga tinggi layar.
- **Saran Perbaikan:**
  - Hapus tombol `Cetak` dari Header utama (cukup letakkan tombol `Cetak` di dalam halaman `Laporan` dan `Statistik`).
  - Pertimbangkan pemisahan antara tab navigasi halaman (`Dashboard`, `Riwayat`, `Statistik`, `Laporan`) dengan tombol manajemen (`Dompet`).

---

### Prioritas P3: Polish & Aksesibilitas

#### [UX-12] Standarisasi Aksesibilitas pada `SaveGoalModal`
- **Lokasi:** `src/components/SaveGoalModal.jsx:14-62`
- **Lensa Agency:** `agency-accessibility-auditor` (WCAG 2.1.1 Keyboard & 4.1.2 Name, Role, Value)
- **Akar Masalah:**
  - `SaveGoalModal` membuat overlay manual dengan `<div>` biasa tanpa menggunakan komponen `Modal.jsx`, sehingga tidak memiliki `role="dialog"`, `aria-modal="true"`, penutupan via tombol `Escape`, dan penguncian *scroll* `document.body`.
- **Saran Perbaikan:**
  - Bungkus isi `SaveGoalModal` menggunakan komponen `Modal.jsx` seperti modal lainnya.

---

## Checklist Eksekusi (Finish-Gate Verification)

Gunakan daftar periksa ini saat mengimplementasikan perbaikan:

- [ ] **P0 - UX-01:** Ketik `"makan 35k skincare"` dan `"gaji 5jt"` di `QuickAdd` -> keduanya berhasil membuka `TransactionForm` dengan kategori/tipe yang tepat, dan ketikan bebas tanpa nominal tidak hilang begitu saja.
- [ ] **P0 - UX-02:** Notifikasi sukses (simpan/impor/aktifkan notifikasi) tampil dengan warna hijau/teal, sedangkan pesan gagal tampil dengan warna merah (`rose`).
- [ ] **P0 - UX-03:** Tidak ada lagi teks `"Uang Bebas = A langsung, Pocket = child A"` atau `"Sweep/pindah dana di myBCA"` di seluruh layar.
- [ ] **P0 - UX-04:** Mengetik nominal di semua form (`TransactionForm`, `AddPocketModal`, `Pemasukan`, `TransferForm`, `ReallocateForm`) otomatis menampilkan pemisah ribuan (contoh: `1.500.000`).
- [ ] **P1 - UX-05:** Akun/bulan baru dengan pemasukan `Rp 0` menampilkan panduan langkah awal (*onboarding*) untuk mengisi pemasukan dan budget terlebih dahulu.
- [ ] **P1 - UX-06:** Daftar `Pocket` dan `QuickAdd` berada di area atas Dashboard (tidak terkubur di bawah `Catatan Bulan Ini` dan `DonutChart`), serta kartu metrik tidak menduplikasi `Sisa Uang Bebas`.
- [ ] **P1 - UX-07:** Halaman `Riwayat` hanya memiliki satu kolom pencarian terpadu (dengan saklar *Bulan Ini / Semua Bulan*) dan tidak menduplikasi pemilih bulan.
- [ ] **P1 - UX-08:** Pemilih bulan di Header memiliki indikator dropdown `▾` dan `Mulai Bulan Baru` menyediakan opsi menyalin budget pocket bulan lalu.
- [ ] **P2 - UX-09:** Menutup `CategoryManager`, `WalletManager`, atau `RecurringManager` saat ada perubahan yang belum disimpan akan memunculkan konfirmasi, dan `Sesuaikan Saldo` langsung menyimpan perubahan.
- [ ] **P2 - UX-10:** Pembuatan Pocket membedakan mode *Budget Pengeluaran* vs *Target Tabungan* secara jelas.
- [ ] **P2 - UX-11:** Tombol `Cetak` dipindahkan dari navigasi utama Header ke dalam halaman `Laporan` / `Statistik`.
- [ ] **P3 - UX-12:** `SaveGoalModal` menggunakan komponen `Modal.jsx` standar dan dapat ditutup dengan tombol `Escape`.

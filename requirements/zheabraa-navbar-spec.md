# Spesifikasi Navbar — Zheabraa Pocket Budgeting

## Ringkasan
Navbar terdiri dari 4 tombol navigasi utama (Dashboard, Riwayat, Statistik, Dompet) dalam grid 2x2, ditambah toggle tema dan ikon gear di pojok kanan atas. Ikon gear membuka dropdown berisi tombol Keluar.

## Struktur Layout

```
┌─────────────────────────────────────┐
│ 🐷 Zheabraa            ☀️  ⚙️        │  ← header row
├─────────────────────────────────────┤
│         ‹  Agustus 2026  ›           │  ← month selector
├─────────────────────────────────────┤
│  [ Dashboard ]      [ Riwayat ]      │  ← nav grid 2x2
│  [ Statistik ]      [ Dompet  ]      │
└─────────────────────────────────────┘
```

Saat gear ditekan, dropdown muncul menempel di bawah ikon gear (posisi kanan atas), berisi satu tombol:

```
┌─────────────┐
│  ⎋ Keluar   │  ← bg merah, teks putih
└─────────────┘
```

## Detail Komponen

### 1. Header row
- Kiri: logo + nama app ("Zheabraa")
- Kanan: dua icon button berdampingan — toggle tema (ikon matahari/bulan) dan gear (ikon pengaturan)
- Kedua icon button berbentuk lingkaran 30x30px, transparan, tanpa border tebal

### 2. Toggle tema
- Icon button tunggal, langsung switch light/dark saat ditekan (tanpa dropdown)
- Ikon berubah sesuai tema aktif (matahari ↔ bulan)

### 3. Gear + dropdown Keluar
- Gear membuka dropdown kecil (bukan navigasi halaman)
- Isi dropdown: satu tombol **Keluar**
  - Background: merah (`#dc2626`)
  - Teks: putih, dengan ikon logout
- Dropdown menempel di kanan bawah ikon gear (`position: absolute`, anchor kanan)

### 4. Month selector
- Baris terpisah di bawah header, rata tengah
- Format: `‹  [Nama Bulan] [Tahun]  ›`
- Panah kiri/kanan untuk navigasi bulan sebelumnya/berikutnya

### 5. Grid navigasi (2x2)
- 4 tombol dengan ukuran seragam: Dashboard, Riwayat, Statistik, Dompet
- Tiap tombol pakai ikon + label, rata tengah
- Tab aktif dibedakan lewat warna (background terang, teks gelap) dibanding tab non-aktif (background gelap, teks terang)

## Warna

| Elemen | Warna |
|---|---|
| Background utama | `#0f1b3d` |
| Background tombol non-aktif | `#16234a` |
| Background tombol aktif | `#f5f2e8` (teks `#0f1b3d`) |
| Aksen / gold | `#d9a441` |
| Teks sekunder (muted) | `#8f9ac2` |
| Border/divider | `#24305a` |
| Background tombol Keluar | `#dc2626` (teks putih) |

## Catatan Implementasi
- Dropdown gear butuh `z-index` di atas grid navigasi agar tidak tertutup/menutupi elemen lain.
- Tambahkan handler "klik di luar dropdown untuk menutup" (click-outside) supaya dropdown tidak menggantung terbuka.
- Pastikan tiap tombol nav punya tinggi tap minimal ±40px (padding vertikal cukup) untuk kenyamanan sentuh di layar mobile.
- State aktif (tab yang sedang dibuka) sebaiknya dikontrol lewat satu source of truth (misalnya `currentRoute` atau state React) agar konsisten dengan routing aplikasi.

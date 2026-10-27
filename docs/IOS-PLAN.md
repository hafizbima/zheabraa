# Rencana Implementasi iOS (Tanpa App Store) — Zheabraa

## 1. Perbandingan Opsi Distribusi iOS Tanpa App Store

Ada 3 jalur teknis untuk menjalankan aplikasi di iOS tanpa publikasi ke Apple App Store. Berdasarkan prinsip *smallest complete change* (`/ponytail`), **Opsi A (iOS Standalone Web App / PWA)** adalah jalur utama terbaik karena gratis, tidak butuh Mac/Xcode, tidak perlu memperbarui sertifikat tiap 7 hari, dan terintegrasi langsung dengan deploy Vercel saat ini.

| Kriteria | **Opsi A: iOS Standalone PWA (Rekomendasi)** | **Opsi B: Sideload `.ipa` (AltStore / Sideloadly)** | **Opsi C: TestFlight / Ad-Hoc `.ipa`** |
| :--- | :--- | :--- | :--- |
| **Biaya Apple Developer** | **\$0 (Gratis)** | \$0 (Apple ID gratis) | \$99 / tahun (~Rp 1,6 juta/tahun) |
| **Cara Pasang oleh User** | Buka URL di Safari → **Share** → **Add to Home Screen** | Pasang AltStore di PC/Mac + kabel ke iPhone | Lewat undangan link TestFlight / profil UDID |
| **Masa Berlaku Aplikasi** | **Permanen** (tidak pernah expired) | **Expired tiap 7 hari** (wajib refresh via PC/Wi-Fi) | 90 hari per build (TestFlight) / 1 tahun (Ad-Hoc) |
| **Update Aplikasi** | **Otomatis** saat push ke Vercel | Harus build `.ipa` ulang & sideload manual | Harus upload build baru via Xcode |
| **Kebutuhan Build** | Cukup Vite (Windows/Linux/Mac) | Wajib macOS + Xcode (atau GitHub Actions macOS) | Wajib macOS + Xcode + akun Developer berbayar |
| **Tampilan di iPhone** | Ikon di Home Screen, layar penuh tanpa address bar Safari, masuk App Switcher, bisa offline | Aplikasi native wrapper (Capacitor WebView) | Aplikasi native wrapper (Capacitor WebView) |

---

## 2. Audit Masalah iOS pada Codebase Saat Ini

Saat ini Zheabraa sudah memasang `vite-plugin-pwa`, namun ada beberapa bug dan celah khusus iOS yang membuat pengalaman di iPhone belum optimal:

1. **Tidak Ada Panduan Install di iOS Safari**
   Berbeda dengan Android Chrome yang memunculkan tombol/popup *"Install App"* otomatis, Apple **tidak menyediakan prompt otomatis** di iOS. Pengguna harus menekan tombol **Share** (`↑`) lalu memilih **"Add to Home Screen"**. Tanpa banner petunjuk di dalam aplikasi, pengguna iOS tidak tahu aplikasi ini bisa di-install.
2. **Tabrakan Status Bar & Notch / Dynamic Island (`safe-area-inset`)**
   Di [`index.html`](file:///d:/OpenCode/gimme-money/index.html#L9), meta tag `apple-mobile-web-app-status-bar-style` disetel ke `black-translucent`. Namun:
   - Meta `viewport` belum memiliki `viewport-fit=cover`.
   - [`Header.jsx`](file:///d:/OpenCode/gimme-money/src/components/Header.jsx#L90) belum memiliki padding atas `env(safe-area-inset-top)`, sehingga saat dibuka dari Home Screen iPhone, header akan bertabrakan dengan jam/notch/Dynamic Island iOS.
   - Tombol FAB `+` di [`App.jsx`](file:///d:/OpenCode/gimme-money/src/App.jsx#L96) (`bottom-6`) berisiko terlalu dekat dengan garis *Home Indicator* di bagian bawah layar iPhone.
3. **Auto-Zoom iOS Safari Saat Klik Input**
   iOS Safari otomatis melakukan *zoom-in* paksa pada halaman setiap kali pengguna mengetuk `<input>` atau `<select>` yang memiliki ukuran font di bawah `16px` (saat ini banyak input memakai `text-sm` = `14px`).
4. **Konflik File PWA Statis vs `vite-plugin-pwa`**
   Di folder `public/` terdapat file warisan [`public/manifest.webmanifest`](file:///d:/OpenCode/gimme-money/public/manifest.webmanifest) (yang juga memiliki karakter encoding rusak `?"` pada nama aplikasi) dan [`public/sw.js`](file:///d:/OpenCode/gimme-money/public/sw.js) manual, yang berbenturan dengan hasil generate otomatis dari [`vite.config.js`](file:///d:/OpenCode/gimme-money/vite.config.js).
5. **Ukuran `apple-touch-icon`**
   iOS memerlukan ikon berukuran **180×180 px** tanpa transparansi agar ikon di Home Screen iPhone tidak pecah atau diberi background hitam oleh sistem iOS.

---

## 3. Rencana Tahapan Implementasi (Opsi A — iOS Standalone PWA)

### Tahap 1: Perbaikan Meta Tags & Aset Ikon iOS ([`index.html`](file:///d:/OpenCode/gimme-money/index.html) & `public/`)
- Buat file ikon khusus iOS `public/apple-touch-icon.png` ukuran **180×180 px** dengan background solid.
- Tambahkan `viewport-fit=cover` pada `<meta name="viewport">` di [`index.html`](file:///d:/OpenCode/gimme-money/index.html#L5).
- Sesuaikan `<meta name="theme-color">` agar mendukung mode terang (`#dceeff`) dan gelap (`#0f1b3d`) di Safari iOS.
- Bersihkan file duplikat [`public/manifest.webmanifest`](file:///d:/OpenCode/gimme-money/public/manifest.webmanifest), [`public/sw.js`](file:///d:/OpenCode/gimme-money/public/sw.js), dan `public/icons/` agar sepenuhnya dikelola oleh `vite-plugin-pwa` di [`vite.config.js`](file:///d:/OpenCode/gimme-money/vite.config.js).

### Tahap 2: Penyesuaian Safe Area & UX iOS ([`src/index.css`](file:///d:/OpenCode/gimme-money/src/index.css), [`Header.jsx`](file:///d:/OpenCode/gimme-money/src/components/Header.jsx), [`App.jsx`](file:///d:/OpenCode/gimme-money/src/App.jsx))
- Tambahkan aturan CSS khusus perangkat sentuh iOS (`@supports (-webkit-touch-callout: none)`) di [`src/index.css`](file:///d:/OpenCode/gimme-money/src/index.css) untuk memastikan `input, select, textarea` memiliki `font-size: 16px` di layar mobile agar tidak memicu *auto-zoom* iOS.
- Tambahkan `pt-[env(safe-area-inset-top)]` pada `<header>` di [`Header.jsx`](file:///d:/OpenCode/gimme-money/src/components/Header.jsx#L90).
- Tambahkan offset `env(safe-area-inset-bottom)` pada container utama dan tombol FAB `+` di [`App.jsx`](file:///d:/OpenCode/gimme-money/src/App.jsx#L75-L100).

### Tahap 3: Komponen Panduan Install iOS (`src/components/IosInstallPrompt.jsx`)
- Buat komponen ringan yang mendeteksi apakah pengguna membuka web dari perangkat iOS (`iPhone`/`iPad`) dan **belum** berada di mode standalone (`!window.navigator.standalone`).
- Tampilkan kartu/banner petunjuk singkat di bagian bawah layar (lengkap dengan ikon Share Safari `↑` dan instruksi *"Ketuk Share → Tambah ke Layar Utama"*), serta tombol tutup yang menyimpan status ke `localStorage` (`gmm:ios-prompt-dismissed`).
- Tambahkan juga tombol **"Pasang Aplikasi"** di dalam menu Gear (`⚙️`) pada [`Header.jsx`](file:///d:/OpenCode/gimme-money/src/components/Header.jsx#L133) supaya pengguna bisa memunculkan panduan install kapan saja.

---

## 4. (Opsional) Rencana Opsi B — Build File `.ipa` Native via Capacitor

Jika di kemudian hari kamu tetap menginginkan file mentah `.ipa` untuk di-sideload via **AltStore / Sideloadly**:
1. Install Capacitor: `npm i @capacitor/core @capacitor/ios` dan `npm i -D @capacitor/cli`.
2. Inisialisasi `capacitor.config.json` dengan `webDir: "dist"` dan `appId: "app.zheabraa.budget"`.
3. Gunakan GitHub Actions dengan runner `macos-latest` untuk menjalankan `npx cap sync ios` dan `xcodebuild` guna menghasilkan file `Zheabraa.ipa` secara otomatis di tab *Actions Artifacts* (tanpa perlu memiliki Mac fisik).


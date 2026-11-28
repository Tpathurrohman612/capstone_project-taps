<p align="center">
  <br>
  <img src="frontend/public/logo-ut.png" alt="Universitas Terbuka" width="120"><br>
  <h1 align="center">Lapor Tuton</h1>
  <p align="center">
    <strong>STSI4401 - Capstone Project · Tugas Akhir Program Sarjana (TAPS)</strong><br>
    <em>"Rancang Bangun Sistem Pelaporan Permasalahan Aktivitas dan Layanan Tutor Berbasis Web untuk Tutorial Online"</em>
  </p>
</p>
<p align="center">

   <a href="https://react.dev/">
     <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React 19">
   </a>

   <a href="https://www.typescriptlang.org/">
     <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5">
   </a>

   <a href="https://vite.dev/">
     <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8">
   </a>

   <a href="https://tailwindcss.com/">
     <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
   </a>

   <a href="https://reactrouter.com/">
     <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router 7">
   </a>

   <a href="https://firebase.google.com/">
     <img src="https://img.shields.io/badge/Firebase_SDK-13-DD2C00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase SDK 13">
   </a>

   <a href="https://pnpm.io/">
     <img src="https://img.shields.io/badge/pnpm-10.34.3-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm 10.34.3">
   </a>

   <a href="https://nodejs.org/">
     <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 22">
   </a>

   <a href="https://vitest.dev/">
     <img src="https://img.shields.io/badge/Vitest-5-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest 5">
   </a>

   <a href="https://github.com/Tpathurrohman612/capstone_project-taps/actions/workflows/ci.yml">
     <img src="https://img.shields.io/github/actions/workflow/status/Tpathurrohman612/capstone_project-taps/ci.yml?branch=main&label=CI&logo=githubactions&logoColor=white&style=for-the-badge" alt="GitHub Actions CI">
   </a>

</p>

<p align="center">

   <a href="#tentang">📌 <strong>Tentang</strong></a> &nbsp;·&nbsp;
   <a href="#tim">👥 <strong>Tim</strong></a> &nbsp;·&nbsp;
   <a href="#gambaran-umum-proyek">📝 <strong>Gambaran Umum</strong></a> &nbsp;·&nbsp;
   <a href="#cakupan-dan-fitur">✨ <strong>Cakupan &amp; Fitur</strong></a> &nbsp;·&nbsp;
   <a href="#alur-pelaporan">🔄 <strong>Alur</strong></a> &nbsp;·&nbsp;
   <a href="#arsitektur-proyek">🏗️ <strong>Arsitektur</strong></a> &nbsp;·&nbsp;
   <a href="#tech-stack">🛠️ <strong>Tech Stack</strong></a> &nbsp;·&nbsp;
   <a href="#memulai">🚀 <strong>Memulai</strong></a> &nbsp;·&nbsp;
   <a href="#pengujian">🧪 <strong>Pengujian</strong></a>

</p>

---

<a id="tentang"></a>

## 📌 Tentang

**Lapor Tuton** adalah aplikasi berbasis web untuk membantu mahasiswa Universitas Terbuka menyampaikan dan memantau laporan permasalahan terkait aktivitas dan layanan tutor pada saat melaksanakan pembelajaran Tutorial Online (Tuton).

Proyek ini dikembangkan sebagai bagian dari mata kuliah **STSI4401 - Capstone Project** yang merupakan **Tugas Akhir Program Sarjana (TAPS)**. Ruang lingkup implementasinya berfokus pada proses pengajuan laporan oleh mahasiswa, pemeriksaan oleh Administrator, penerusan laporan kepada Fakultas/Unit terkait melalui kanal eksternal, serta pencatatan hasil validasi dan tindak lanjut.

> **Catatan ruang lingkup:** Lapor Tuton merupakan implementasi proyek Capstone sesuai kebutuhan yang ditetapkan. Repository ini bukan pernyataan bahwa aplikasi telah siap untuk operasional publik berskala besar.

<a id="tim"></a>

## 👥 Tim

| Nomor | Nama Lengkap | NIM | UT Daerah |
|---:|---|---|---|
| 1 | Indah Octarina | 051582853 | Palembang |
| 2 | Maulidya Safna Citra K | 047972767 | Bogor |
| 3 | Salsabila Chustiarani | 051490436 | Surabaya |
| 4 | Sidiq Muhammad Toha | 048798217 | Yogyakarta |
| 5 | Taufik Pathurrohman | 049973116 | Bandung |

---

<a id="gambaran-umum-proyek"></a>

## 📝 Gambaran Umum Proyek

### Latar Belakang

Pelaksanaan Tutorial Online (Tuton) di Universitas Terbuka merupakan salah satu bentuk layanan pembelajaran bagi mahasiswa. Dalam pelaksanaannya, mahasiswa dapat mengalami berbagai permasalahan terkait aktivitas dan layanan tutor, seperti tutor kurang aktif, keterlambatan respons diskusi, keterlambatan penilaian, serta kurangnya umpan balik.

Berdasarkan survei kelompok terhadap **167 mahasiswa Universitas Terbuka**, sebanyak **122 responden (73,05%)** menyatakan pernah mengalami permasalahan terkait aktivitas dan layanan tutor. Dari 64 responden yang pernah melaporkan permasalahannya, **31 responden (48,44%)** menyatakan tindak lanjut laporan belum tuntas atau belum memperoleh kejelasan. Selain itu, **131 dari 167 responden (78,44%)** menyatakan membutuhkan atau sangat membutuhkan layanan yang memudahkan pelaporan permasalahan terkait aktivitas dan layanan tutor selama Tuton.

Temuan tersebut menjadi dasar pengembangan sarana pelaporan yang membantu mahasiswa menyampaikan permasalahan secara terstruktur dan memantau perkembangan penanganannya. Hasil survei merupakan gambaran dari responden yang berpartisipasi dan tidak dimaksudkan untuk digeneralisasi ke seluruh populasi mahasiswa Universitas Terbuka.

### Tujuan Pengembangan

Lapor Tuton dikembangkan untuk menyediakan sarana pelaporan berbasis web yang membantu mahasiswa menyampaikan permasalahan terkait aktivitas dan layanan tutor, melengkapi laporan dengan bukti pendukung, serta memantau perkembangan status dan tindak lanjut laporan.

### Solusi yang Dikembangkan

Lapor Tuton menyediakan mekanisme pengelolaan laporan yang melibatkan Mahasiswa dan Administrator. Sistem mendukung pengajuan laporan, pemeriksaan kelengkapan, pengelolaan status, penerusan data kepada Fakultas/Unit terkait melalui kanal eksternal, serta pencatatan hasil validasi dan tindak lanjut.

### Gambaran Cara Kerja Sistem

Secara umum, proses pelaporan pada Lapor Tuton berlangsung melalui tahapan berikut:

1. **Mahasiswa** membuat laporan, mengisi informasi yang diperlukan, dan mengunggah bukti pendukung.
2. **Administrator** memeriksa laporan dan menentukan proses berikutnya, termasuk meminta kelengkapan atau menolak laporan apabila tidak memenuhi persyaratan.
3. **Administrator** meneruskan laporan yang lolos pemeriksaan kepada Fakultas/Unit terkait melalui kanal komunikasi di luar aplikasi.
4. **Fakultas/Unit terkait** memberikan hasil validasi atau umpan balik melalui kanal eksternal.
5. **Administrator** mencatat hasil validasi dan tindak lanjut ke dalam sistem agar perkembangan laporan dapat dipantau oleh mahasiswa.

### Pengguna dan Pihak yang Terlibat

Terdapat tiga pihak yang terlibat dalam proses pengelolaan laporan:

- **Mahasiswa:** mengajukan laporan, melengkapi informasi dan bukti pendukung, serta memantau perkembangan laporan.
- **Administrator:** memeriksa dan mengelola laporan, meneruskan laporan kepada pihak terkait, serta mencatat hasil validasi dan tindak lanjut.
- **Fakultas/Unit terkait:** berperan sebagai pihak eksternal yang menerima laporan dan memberikan hasil validasi melalui kanal komunikasi di luar aplikasi.

Dalam implementasinya, hanya Mahasiswa dan Administrator yang memiliki akses langsung ke aplikasi Lapor Tuton. Fakultas/Unit terkait tidak memiliki akun maupun akses langsung ke sistem.

<a id="cakupan-dan-fitur"></a>

## ✨ Cakupan dan Fitur

### Cakupan Implementasi

| Dalam Cakupan | Di Luar Cakupan |
|---|---|
| Pengajuan laporan oleh mahasiswa. | Fakultas/Unit terkait menggunakan akun langsung di aplikasi. |
| Pemeriksaan dan pengelolaan laporan oleh Administrator. | Integrasi langsung dan otomatis dengan sistem Fakultas/Unit terkait. |
| Pencatatan hasil validasi dan tindak lanjut. | Komunikasi otomatis antara aplikasi dan pihak eksternal. |
| Pemantauan status, riwayat, dan pemberitahuan laporan. | Pengelolaan nilai mahasiswa atau pemberian sanksi langsung kepada tutor. |
| Ekspor data laporan dan bukti pendukung untuk diteruskan melalui kanal eksternal. | Jaminan batas waktu atau hasil penyelesaian laporan oleh Fakultas/Unit terkait. |

### Fitur Mahasiswa

- Masuk menggunakan akun Google ketika konfigurasi Firebase telah tersedia.
- Melengkapi identitas mahasiswa, termasuk NIM dan informasi akademik yang diperlukan.
- Membuat laporan permasalahan aktivitas dan layanan tutor.
- Menambahkan bukti pendukung pada laporan.
- Melihat daftar, detail, status, dan riwayat laporan.
- Melengkapi laporan ketika Administrator meminta kelengkapan.
- Menerima pemberitahuan atas pembaruan laporan dan menandai pemberitahuan sebagai telah dibaca.
- Melihat informasi profil, termasuk nama, NIM, fakultas, program studi, dan UT Daerah.

### Fitur Administrator

- Melihat ringkasan dan antrean laporan.
- Memeriksa detail laporan dan identitas pelapor.
- Meloloskan, meminta kelengkapan, atau menolak laporan sesuai alur yang ditetapkan.
- Mengelompokkan laporan berdasarkan informasi akademik yang relevan.
- Meneruskan laporan dan bukti pendukung kepada Fakultas/Unit terkait melalui kanal eksternal.
- Mencatat unit tujuan, kanal pengiriman, hasil validasi, dan tindak lanjut.
- Melihat riwayat penanganan laporan.
- Mengekspor data laporan ke berkas Excel serta mengemas keluaran ekspor dan bukti pendukung dalam arsip ZIP.

<a id="alur-pelaporan"></a>

## 🔄 Alur Pelaporan dan Status Laporan

Sistem menggunakan tujuh status laporan untuk menggambarkan perkembangan penanganan laporan dari awal hingga akhir.

| No. | Status | Keterangan |
|---:|---|---|
| 1 | **Menunggu Pemeriksaan** | Laporan telah dikirim atau dilengkapi kembali oleh mahasiswa dan menunggu pemeriksaan Administrator. |
| 2 | **Perlu Dilengkapi** | Administrator meminta mahasiswa melengkapi informasi atau bukti pendukung dengan menyertakan alasan. Setelah dilengkapi, laporan kembali ke Menunggu Pemeriksaan dengan nomor laporan yang sama. |
| 3 | **Ditolak** | Laporan tidak memenuhi persyaratan dan ditolak oleh Administrator dengan alasan. Status ini merupakan hasil akhir. |
| 4 | **Lolos Pemeriksaan** | Laporan telah memenuhi pemeriksaan awal dan dapat dikelompokkan serta diteruskan kepada Fakultas/Unit terkait. |
| 5 | **Diteruskan ke Fakultas** | Administrator telah meneruskan data laporan dan bukti pendukung melalui kanal eksternal serta menunggu tanggapan. |
| 6 | **Ditindaklanjuti** | Administrator mencatat hasil validasi dari Fakultas/Unit terkait ke dalam sistem. |
| 7 | **Selesai** | Tindak lanjut telah dicatat dan laporan ditutup. Status ini merupakan hasil akhir. |

Hasil validasi dicatat sebagai informasi tersendiri, bukan sebagai status tambahan. Pilihan hasil validasi terdiri dari **Terbukti**, **Tidak Terbukti**, dan **Tidak Ada Tanggapan**.

Alur utama laporan dimulai dari pengajuan oleh Mahasiswa, pemeriksaan oleh Administrator, penerusan kepada Fakultas/Unit terkait melalui kanal eksternal, kemudian pencatatan hasil validasi dan tindak lanjut oleh Administrator. Laporan berakhir pada status **Ditolak** atau **Selesai**.

<a id="arsitektur-proyek"></a>

## 🏗️ Arsitektur Proyek

Repository ini menggunakan frontend React dengan Firebase sebagai layanan backend terkelola (**Backend as a Service** atau BaaS). Repository tidak memiliki custom REST API atau folder backend tersendiri.

Komponen utama sistem meliputi:

1. **Frontend React** — menyediakan antarmuka dan alur penggunaan Mahasiswa serta Administrator.
2. **Firebase Authentication** — menangani autentikasi pengguna melalui Google ketika mode Firebase aktif.
3. **Cloud Firestore** — menyimpan data profil, laporan, status, riwayat, lampiran, dan data penanganan ketika mode Firebase aktif.
4. **Firestore Security Rules** — mendefinisikan aturan akses data pada `firestore.rules`.
5. **Firebase Hosting** — menyajikan hasil build frontend dari direktori `frontend/dist` sesuai konfigurasi `firebase.json`.

### Mode Operasi

Aplikasi menyediakan dua mode operasi:

- **Mode Firebase:** digunakan ketika konfigurasi Firebase wajib telah diisi. Data aplikasi pada mode ini dikelola melalui layanan Firebase, terutama Cloud Firestore.
- **Mode simulasi:** digunakan ketika konfigurasi Firebase belum lengkap. Mode ini menyediakan akun contoh dan penyimpanan melalui `sessionStorage` untuk kebutuhan demonstrasi atau pengembangan lokal. Data pada mode simulasi bukan data bersama lintas perangkat dan tidak ditujukan sebagai penyimpanan permanen.

### Penyimpanan Lampiran

Pada implementasi saat ini, isi lampiran disimpan sebagai data Base64 pada dokumen Cloud Firestore. Firebase Storage belum digunakan sebagai tempat penyimpanan berkas; aturan pada `storage.rules` saat ini menolak seluruh operasi baca dan tulis.

<a id="tech-stack"></a>

## 🛠️ Tech Stack

### Frontend

- [React](https://react.dev/) 19 — pustaka untuk membangun antarmuka pengguna.
- [TypeScript](https://www.typescriptlang.org/) 5 — bahasa pemrograman dengan sistem tipe statis.
- [Vite](https://vite.dev/) 8 — perangkat pengembangan dan build frontend.
- [Tailwind CSS](https://tailwindcss.com/) 4 — utility-first CSS framework.
- [React Router](https://reactrouter.com/) 7 — pengelolaan navigasi dan routing aplikasi.

### Layanan Firebase

- [Firebase Authentication](https://firebase.google.com/docs/auth) — autentikasi pengguna melalui akun Google.
- [Cloud Firestore](https://firebase.google.com/docs/firestore) — penyimpanan data aplikasi ketika mode Firebase aktif.
- [Firebase App Check](https://firebase.google.com/docs/app-check) — integrasi pemeriksaan keaslian aplikasi yang dapat diaktifkan melalui konfigurasi.
- [Firebase Hosting](https://firebase.google.com/docs/hosting) — layanan hosting untuk hasil build frontend.

### Pengembangan dan Pengujian

- [pnpm](https://pnpm.io/) 10.34.3 melalui Corepack — pengelolaan dependensi.
- [Vitest](https://vitest.dev/) 5 dan [Testing Library](https://testing-library.com/) — pengujian kode dan komponen.
- Firebase Emulator Suite dan `@firebase/rules-unit-testing` — pengujian aturan akses Firestore.
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) — pemformatan kode.
- Git dan GitHub — pengelolaan versi serta kolaborasi kode sumber.
- GitHub Actions — pemeriksaan otomatis melalui workflow CI.
- `xlsx` — ekspor data laporan ke Excel.
- `jszip` — pengemasan berkas ekspor dan bukti pendukung.

<a id="struktur-repository"></a>

## 🗂️ Struktur Repository

```text
capstone_project-taps/
├── .github/
│   └── workflows/
│       └── ci.yml
├── frontend/
│   ├── public/
│   │   └── logo-ut.png
│   ├── src/
│   │   ├── features/
│   │   │   ├── admin/       # Fitur Administrator
│   │   │   ├── auth/        # Autentikasi dan identitas pengguna
│   │   │   ├── owner/       # Perkakas internal pengembang
│   │   │   └── student/     # Fitur Mahasiswa
│   │   ├── screens/         # Layar pendukung
│   │   ├── shared/
│   │   │   ├── components/  # Komponen bersama
│   │   │   ├── data/        # Repository dan pengelolaan data
│   │   │   ├── domain/      # Aturan domain dan status laporan
│   │   │   ├── lib/         # Konfigurasi dan utilitas
│   │   │   └── types/       # Tipe data bersama
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── routes.tsx
│   ├── .env.example
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   └── vite.config.ts
├── .firebaserc
├── .gitignore
├── .mise.toml
├── .nvmrc
├── AGENTS.md
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── README.md
└── storage.rules
```

<a id="memulai"></a>

## 🚀 Memulai

### Prasyarat

Sebelum menjalankan proyek, siapkan:

- Node.js 22.
- Corepack yang tersedia bersama instalasi Node.js.
- pnpm 10.34.3 melalui Corepack.
- Git.

Untuk menjalankan pengujian Firestore Rules menggunakan emulator, diperlukan pula:

- Java Development Kit (JDK) 21 atau lebih baru.
- Firebase CLI.

Versi Node.js dan pnpm acuan juga dicantumkan pada `.nvmrc` dan `.mise.toml`.

### 1. Clone Repository

```bash
git clone https://github.com/Tpathurrohman612/capstone_project-taps.git
cd capstone_project-taps
```

### 2. Instal Dependensi Frontend

Jalankan dari direktori root repository:

```bash
corepack pnpm@10.34.3 --dir frontend install
```

### 3. Siapkan Konfigurasi Environment

Salin template konfigurasi:

```bash
cp frontend/.env.example frontend/.env.local
```

- Untuk menggunakan Firebase, isi variabel yang diperlukan pada `frontend/.env.local` berdasarkan konfigurasi aplikasi Web di Firebase Console.
- Untuk menjalankan mode simulasi, biarkan konfigurasi Firebase wajib tetap kosong.

Jangan commit atau mengunggah `frontend/.env.local` ke repository.

### 4. Jalankan Development Server

```bash
corepack pnpm@10.34.3 --dir frontend run dev
```

Buka alamat lokal yang ditampilkan oleh Vite pada terminal.

<a id="konfigurasi-firebase"></a>

## 🔧 Konfigurasi Firebase

Project Firebase default yang tercantum pada `.firebaserc` adalah `lapor-tutor`. Aplikasi web yang ditampilkan pada materi proyek dapat diakses melalui [https://lapor-tuton.web.app](https://lapor-tuton.web.app).

Variabel yang tersedia pada `frontend/.env.example` adalah:

| Variabel | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | API key konfigurasi aplikasi Web Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain autentikasi Firebase. |
| `VITE_FIREBASE_PROJECT_ID` | ID project Firebase. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Identitas bucket Storage pada konfigurasi Firebase. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase. |
| `VITE_FIREBASE_APP_ID` | App ID aplikasi Web Firebase. |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | Kunci situs untuk integrasi Firebase App Check. |
| `VITE_FIREBASE_APPCHECK_PROVIDER` | Penyedia App Check: `enterprise` (default) atau `v3`. |
| `VITE_FIREBASE_USE_EMULATOR` | Isi `true` untuk menghubungkan aplikasi ke Firebase Emulator Suite lokal. |

Nilai konfigurasi Firebase Web digunakan oleh frontend dan bukan pengganti aturan otorisasi. Jangan menaruh **Service Account private key**, kredensial server, token rahasia, atau secret layanan pihak ketiga pada variabel frontend maupun repository publik.

Sebelum menggunakan mode Firebase, pastikan penyedia Google telah diaktifkan pada Firebase Authentication dan domain aplikasi yang digunakan telah diizinkan pada pengaturan Firebase Authentication.

### Firebase Emulator Suite

Konfigurasi port emulator tersedia pada `firebase.json`. Script berikut disediakan di `frontend/package.json`:

```bash
corepack pnpm@10.34.3 --dir frontend run emulators
```

Untuk mengarahkan aplikasi ke emulator, isi `VITE_FIREBASE_USE_EMULATOR=true` pada `frontend/.env.local` dan gunakan konfigurasi Firebase yang sesuai untuk project emulator lokal.

<a id="pengujian"></a>

## 🧪 Pengujian

Jalankan perintah berikut dari root repository.

### Unit Test

```bash
corepack pnpm@10.34.3 --dir frontend test
```

### Test dengan Coverage

```bash
corepack pnpm@10.34.3 --dir frontend run test:coverage
```

### Type Checking

```bash
corepack pnpm@10.34.3 --dir frontend run typecheck
```

### Pemeriksaan Format

```bash
corepack pnpm@10.34.3 --dir frontend exec oxfmt --check src
```

### Build Produksi

```bash
corepack pnpm@10.34.3 --dir frontend run build
```

Hasil build frontend ditempatkan pada `frontend/dist`.

### Pengujian Firestore Security Rules

```bash
corepack pnpm@10.34.3 --dir frontend run test:rules:emulator
```

Pengujian ini menggunakan Firestore Emulator Suite, Firebase CLI, dan JDK 21 atau lebih baru. Pengujian yang memerlukan emulator dapat dilewati ketika emulator tidak tersedia; karena itu, keberhasilan perintah `test` biasa tidak dengan sendirinya membuktikan seluruh Security Rules telah diuji.

### Continuous Integration

Workflow `.github/workflows/ci.yml` menjalankan pemeriksaan TypeScript dan test coverage pada pemicu push ke branch yang dikonfigurasi serta pull request. Build produksi dan pengujian Firestore Rules dengan emulator dijalankan melalui perintah terpisah sebagaimana dijelaskan di atas.

> **Catatan hasil pengujian proyek:** Angka 36/36 PASS yang disampaikan dalam presentasi merupakan hasil pengujian fungsional *Black-box Testing* terhadap 36 kasus uji. Angka tersebut berbeda dari hasil Unit Test/Vitest dan pengujian Firestore Security Rules yang dijalankan melalui perintah pengujian pada repository.

<a id="catatan-implementasi-dan-batasan"></a>

## ⚠️ Catatan Implementasi dan Batasan

- Proyek menggunakan Firebase sebagai layanan backend terkelola; custom backend/API terpisah belum tersedia.
- Mode simulasi menggunakan akun contoh dan `sessionStorage`; data simulasi tidak dibagikan lintas perangkat dan tidak bersifat permanen.
- Mode Firebase memerlukan konfigurasi environment yang lengkap dan pengaturan Firebase Console yang sesuai.
- Isi lampiran saat ini disimpan sebagai Base64 pada Cloud Firestore. Firebase Storage belum digunakan untuk penyimpanan lampiran.
- Aplikasi menerima lampiran JPG, PNG, dan PDF, dengan maksimal lima berkas per laporan serta ukuran PDF maksimal 500 KB.
- Fakultas/Unit terkait berperan sebagai pihak eksternal dan tidak memiliki akun langsung pada aplikasi.
- Firebase App Check telah disiapkan dalam kode, tetapi hanya aktif jika kunci situs dikonfigurasikan dan aplikasi tidak berjalan menggunakan emulator.
- Aturan akses data tersedia pada `firestore.rules` dan `storage.rules`. Aturan tersebut, terutama akses terhadap koleksi pendukung laporan, tetap perlu ditinjau dan diuji sesuai kebutuhan sebelum aplikasi digunakan di luar ruang lingkup implementasi proyek.
- Evaluasi terhadap delapan kebutuhan nonfungsional belum dilaksanakan secara terukur.
- Pengujian fungsional dilakukan oleh anggota tim dan belum melibatkan mahasiswa di luar tim sebagai pengguna akhir. Oleh karena itu, hasil 36 dari 36 kasus uji yang berhasil menunjukkan kesesuaian fungsi pada skenario yang diuji, bukan bukti penerimaan pengguna atau pemenuhan seluruh kebutuhan nonfungsional.
- Perluasan penggunaan, kebutuhan operasional, pembatasan penyalahgunaan, dan kesiapan keamanan untuk skala yang lebih luas berada di luar klaim ruang lingkup proyek ini.

<a id="kontribusi"></a>

## 🤝 Kontribusi

Perubahan kode dan dokumentasi sebaiknya dilakukan melalui branch terpisah dan Pull Request agar dapat ditinjau sebelum digabungkan ke `main`.

Sebelum mengajukan Pull Request, jalankan pemeriksaan yang relevan, sekurang-kurangnya:

```bash
corepack pnpm@10.34.3 --dir frontend test
corepack pnpm@10.34.3 --dir frontend run typecheck
corepack pnpm@10.34.3 --dir frontend run build
```

Jangan menyertakan file environment lokal, kredensial rahasia, private key, token, atau data pribadi pengguna dalam commit.

<a id="lisensi"></a>

## 📄 Lisensi

Repository ini belum mencantumkan file lisensi. Hak penggunaan, distribusi, dan modifikasi di luar kebutuhan proyek perlu dikonfirmasi kepada pemilik proyek/kontributor terkait sebelum dilakukan.

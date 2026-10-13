# TAPS — Lapor Tuton

TAPS (Tutorial Online Reporting System) adalah prototipe sistem pelaporan aktivitas dan layanan tutor selama Tutorial Online (Tuton) Universitas Terbuka.

## Struktur Proyek

- `frontend/` — aplikasi React, Vite, dan Tailwind CSS.
- `backend/` — direncanakan untuk API dan logika server.
- `database/` — direncanakan untuk skema dan penyimpanan data.

Folder `backend/` dan `database/` belum diimplementasikan.

## Persyaratan

- Node.js yang kompatibel dengan Vite dan Vitest.
- pnpm 10.34.3 melalui Corepack.

Versi tool acuan tercantum di `.mise.toml`.

## Menjalankan Frontend

Dari root repositori:

    corepack pnpm@10.34.3 --dir frontend install
    corepack pnpm@10.34.3 --dir frontend run dev

Buka alamat lokal yang ditampilkan oleh Vite.

## Pengujian dan Build

    corepack pnpm@10.34.3 --dir frontend test
    corepack pnpm@10.34.3 --dir frontend exec tsc --noEmit --noUnusedLocals --noUnusedParameters
    corepack pnpm@10.34.3 --dir frontend exec oxfmt --check src
    corepack pnpm@10.34.3 --dir frontend run build

## Batasan Prototipe

- Login Google masih berupa simulasi.
- Kredensial administrator demo berada di source code frontend dan tidak boleh digunakan untuk produksi.
- Proteksi route React hanya membatasi navigasi di sisi klien; otorisasi server tetap diperlukan.
- Data laporan disimpan menggunakan `sessionStorage`, bukan database permanen.
- Metadata lampiran disimpan pada data laporan; penyimpanan file sebenarnya perlu dirancang pada tahap backend.

## Rencana Pengembangan

1. Menyelesaikan audit dan pengujian frontend.
2. Merancang API untuk laporan dan autentikasi.
3. Merancang skema serta migrasi database.
4. Mengimplementasikan autentikasi dan otorisasi server.
5. Mengintegrasikan frontend dengan backend dan database.
6. Menambahkan pengujian integrasi dan dokumentasi operasional.

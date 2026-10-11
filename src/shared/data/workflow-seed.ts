import type { WorkflowReport } from "../types/workflow"

export const workflowSeed: WorkflowReport[] = [
  {
    id: "LT-2026-0007",
    title: "Belum ada tanggapan pada forum inisiasi",
    category: "Aktivitas tutor",
    course: "ESPA4123 · Statistika Ekonomi",
    className: "01",
    tutor: "M. Arief Nugroho, M.Si.",
    submitted: "15 September 2026",
    status: "Diproses",
    updates: [
      {
        time: "17 September 2026, 10:00",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
      {
        time: "17 September 2026, 13:30",
        title: "Validasi disiapkan",
        text: "Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait.",
      },
      {
        time: "17 September 2026, 16:45",
        title: "Hasil validasi diterima dan dicatat",
        text: "Hasil validasi dari Fakultas/Unit terkait telah diterima dan dicatat oleh Administrator.",
      },
      {
        time: "17 September 2026, 17:00",
        title: "Laporan memasuki proses tindak lanjut",
        text: "Hasil validasi telah diterima dan dicatat. Laporan memasuki proses tindak lanjut.",
      },
      {
        time: "17 September 2026, 17:30",
        title: "Laporan selesai",
        text: "Tindak lanjut telah selesai dilakukan dan laporan dinyatakan selesai.",
      },
    ],
  },
  {
    id: "LT-2026-0005",
    title: "Tutor belum memberi penilaian tugas",
    category: "Aktivitas tutor",
    course: "EKMA4157 · Manajemen Pemasaran",
    className: "03",
    tutor: "Hendra Wijaya, S.E., M.M.",
    submitted: "14 September 2026",
    status: "Menunggu Validasi",
    updates: [
      {
        time: "14 September 2026, 14:30",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
      {
        time: "17 September 2026, 17:10",
        title: "Data laporan dikirim ke Fakultas/Unit terkait",
        text: "Data laporan telah dikirim oleh Administrator melalui kanal eksternal untuk proses validasi.",
      },
    ],
  },
  {
    id: "LT-2026-0009",
    title: "Umpan balik tugas akuntansi belum tersedia",
    category: "Aktivitas tutor",
    course: "AKUN4312 · Akuntansi Keuangan Menengah",
    className: "02",
    tutor: "Dewi Lestari, S.E., M.Ak.",
    submitted: "18 September 2026",
    status: "Diverifikasi",
    courseType: "Teori/Umum",
    duration: "3–6 hari",
    description:
      "Mahasiswa belum menerima umpan balik atas tugas modul ke-4 meskipun batas waktu penilaian telah terlewati.",
    attachments: [
      { name: "bukti-unggah-tugas-akuntansi.pdf", type: "PDF", size: "612 KB" },
      { name: "tangkapan-layar-status-tugas.png", type: "PNG", size: "438 KB" },
    ],
    updates: [
      {
        time: "18 September 2026, 09:15",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
    ],
  },
  {
    id: "LT-2026-0010",
    title: "Umpan balik tugas belum tersedia",
    category: "Aktivitas tutor",
    course: "AKUN4312 · Akuntansi Keuangan Menengah",
    className: "02",
    tutor: "Dewi Lestari, S.E., M.Ak.",
    submitted: "19 September 2026",
    status: "Diverifikasi",
    courseType: "Teori/Umum",
    duration: "1 minggu atau lebih",
    description:
      "Mahasiswa melaporkan bahwa umpan balik tugas pada kegiatan Tutorial Online belum tersedia.",
    attachments: [
      { name: "bukti-pendukung-tuton.pdf", type: "PDF", size: "824 KB" },
    ],
    updates: [
      {
        time: "19 September 2026, 09:30",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
    ],
  },
  {
    id: "LT-2026-0001",
    title: "Belum ada umpan balik diskusi minggu ke-3",
    category: "Aktivitas tutor",
    course: "EKMA4111 · Pengantar Bisnis",
    className: "01",
    tutor: "Dr. Rina Kusuma, M.M.",
    submitted: "12 September 2026",
    status: "Diproses",
    updates: [
      {
        time: "13 September 2026, 10:15",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
      {
        time: "14 September 2026, 15:20",
        title: "Laporan diproses",
        text: "Laporan diteruskan kepada pengelola Tutorial Online untuk tindak lanjut.",
      },
    ],
  },
  {
    id: "LT-2026-0008",
    title: "Materi tutorial minggu ke-5 belum tersedia",
    category: "Materi Tutorial Online",
    course: "MKDU4109 · Pendidikan Kewarganegaraan",
    className: "02",
    tutor: "Agus Prasetyo, S.Pd., M.Pd.",
    submitted: "16 September 2026",
    status: "Selesai",
    updates: [
      {
        time: "17 September 2026, 10:00",
        title: "Laporan diverifikasi",
        text: "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.",
      },
      {
        time: "17 September 2026, 13:30",
        title: "Laporan diproses",
        text: "Laporan diteruskan kepada pengelola Tutorial Online untuk tindak lanjut.",
      },
      {
        time: "17 September 2026, 16:45",
        title: "Laporan selesai",
        text: "Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.",
      },
    ],
  },
  {
    id: "LT-2026-0003",
    title: "Jadwal aktivitas tutor tidak sesuai ketentuan",
    category: "Layanan tutor",
    course: "ADBI4410 · Manajemen Sumber Daya Manusia",
    className: "03",
    tutor: "Nadia Permata, S.E., M.M.",
    submitted: "28 Agustus 2026",
    status: "Selesai",
    updates: [
      {
        time: "29 Agustus 2026, 11:00",
        title: "Laporan diverifikasi",
        text: "Informasi laporan telah diperiksa oleh pengelola.",
      },
      {
        time: "02 September 2026, 13:40",
        title: "Laporan selesai",
        text: "Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.",
      },
    ],
  },
  {
    id: "LT-2026-0004",
    title: "Keterlambatan respons pada forum diskusi",
    category: "Aktivitas tutor",
    course: "PAJA3210 · Perpajakan",
    className: "02",
    tutor: "Rizka Maulani, S.E., Ak.",
    submitted: "20 Agustus 2026",
    status: "Selesai",
    updates: [
      {
        time: "21 Agustus 2026, 09:40",
        title: "Laporan diverifikasi",
        text: "Informasi laporan telah diperiksa oleh pengelola.",
      },
      {
        time: "26 Agustus 2026, 16:00",
        title: "Laporan selesai",
        text: "Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.",
      },
    ],
  },
  {
    id: "LT-2026-0002",
    title: "Umpan balik tugas belum diterima",
    category: "Layanan tutor",
    course: "EKMA4216 · Manajemen Operasi",
    className: "01",
    tutor: "Budi Santoso, S.E., M.M.",
    submitted: "15 Agustus 2026",
    status: "Selesai",
    updates: [
      {
        time: "16 Agustus 2026, 10:20",
        title: "Laporan diverifikasi",
        text: "Informasi laporan telah diperiksa oleh pengelola.",
      },
      {
        time: "22 Agustus 2026, 14:10",
        title: "Laporan selesai",
        text: "Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.",
      },
    ],
  },
]

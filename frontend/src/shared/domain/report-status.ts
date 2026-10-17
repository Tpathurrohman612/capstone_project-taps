/**
 * Status laporan dan aturan perpindahannya.
 *
 * Modul ini adalah penerjemahan langsung Tabel 4.1 (Daftar Status Laporan) dan
 * Tabel 4.2 (Aturan Perubahan Status) pada proposal. Tidak ada status maupun
 * perpindahan yang boleh ditambahkan di sini tanpa mengubah kedua tabel itu
 * lebih dulu, supaya dokumen dan sistem tidak pernah berbeda.
 *
 * Perpindahan status sengaja diperlakukan sebagai aturan data, bukan logika
 * yang tersebar di layar. Dengan begitu satu-satunya pintu perubahan status
 * dapat diuji, dan tidak mungkin ada layar yang memindahkan laporan ke status
 * yang tidak diizinkan.
 */

export const REPORT_STATUSES = [
  'Diterima',
  'Perlu Informasi Tambahan',
  'Ditolak',
  'Diverifikasi',
  'Menunggu Validasi',
  'Sedang Diproses',
  'Selesai',
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

/** Pihak yang boleh memicu perpindahan status. */
export type StatusActor = 'Mahasiswa' | 'Administrator'

export type StatusMeta = {
  /** Urutan tampil, mengikuti kolom `urutan` pada entitas status_laporan. */
  urutan: number
  arti: string
  /** Benar bila laporan tidak dapat berpindah ke status mana pun lagi. */
  terminal: boolean
}

/** Tabel 4.1 Daftar Status Laporan. */
export const STATUS_META: Readonly<Record<ReportStatus, StatusMeta>> = {
  Diterima: {
    urutan: 1,
    arti: 'Laporan masuk dan menunggu verifikasi Administrator',
    terminal: false,
  },
  'Perlu Informasi Tambahan': {
    urutan: 2,
    arti: 'Laporan dikembalikan kepada Mahasiswa untuk dilengkapi',
    terminal: false,
  },
  Ditolak: {
    urutan: 3,
    arti: 'Laporan tidak memenuhi syarat dan tidak diproses lebih lanjut',
    terminal: true,
  },
  Diverifikasi: {
    urutan: 4,
    arti: 'Laporan lolos verifikasi dan siap dikirim untuk validasi',
    terminal: false,
  },
  'Menunggu Validasi': {
    urutan: 5,
    arti: 'Data laporan telah dikirim ke Fakultas/Unit terkait',
    terminal: false,
  },
  'Sedang Diproses': {
    urutan: 6,
    arti: 'Hasil validasi telah dicatat dan laporan ditindaklanjuti',
    terminal: false,
  },
  Selesai: {
    urutan: 7,
    arti: 'Laporan selesai ditangani dan tindak lanjut telah dicatat',
    terminal: true,
  },
}

export type StatusTransition = {
  /** null berarti laporan belum ada, yaitu saat pertama kali dikirim. */
  dari: ReportStatus | null
  ke: ReportStatus
  dipicuOleh: StatusActor
  keterangan: string
  /**
   * Field yang wajib terisi agar perpindahan sah. Kosong berarti tidak ada
   * syarat tambahan selain peran pemicunya.
   */
  syaratWajib: readonly string[]
}

/** Tabel 4.2 Aturan Perubahan Status. */
export const STATUS_TRANSITIONS: readonly StatusTransition[] = [
  {
    dari: null,
    ke: 'Diterima',
    dipicuOleh: 'Mahasiswa',
    keterangan: 'Mahasiswa mengirim laporan',
    syaratWajib: [],
  },
  {
    dari: 'Diterima',
    ke: 'Diverifikasi',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator memverifikasi',
    syaratWajib: [],
  },
  {
    dari: 'Diterima',
    ke: 'Perlu Informasi Tambahan',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator meminta kelengkapan',
    syaratWajib: ['alasan'],
  },
  {
    dari: 'Diterima',
    ke: 'Ditolak',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator menolak',
    syaratWajib: ['alasan'],
  },
  {
    dari: 'Perlu Informasi Tambahan',
    ke: 'Diterima',
    dipicuOleh: 'Mahasiswa',
    keterangan: 'Mahasiswa melengkapi laporan',
    syaratWajib: [],
  },
  {
    dari: 'Diverifikasi',
    ke: 'Menunggu Validasi',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator mengirim hasil ekspor dan mencatat pengiriman',
    syaratWajib: ['unit_tujuan', 'kanal_pengiriman'],
  },
  {
    dari: 'Menunggu Validasi',
    ke: 'Sedang Diproses',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator mencatat hasil validasi',
    syaratWajib: ['hasil_validasi', 'unit_validator'],
  },
  {
    dari: 'Sedang Diproses',
    ke: 'Selesai',
    dipicuOleh: 'Administrator',
    keterangan: 'Administrator mencatat tindak lanjut',
    syaratWajib: ['tindak_lanjut'],
  },
]

/** Nilai sah untuk field hasil_validasi, termasuk jalur tanpa tanggapan. */
export const HASIL_VALIDASI = ['Terbukti', 'Tidak Terbukti', 'Tidak Ada Tanggapan'] as const

export type HasilValidasi = (typeof HASIL_VALIDASI)[number]

export const isReportStatus = (value: unknown): value is ReportStatus =>
  typeof value === 'string' && (REPORT_STATUSES as readonly string[]).includes(value)

export const isHasilValidasi = (value: unknown): value is HasilValidasi =>
  typeof value === 'string' && (HASIL_VALIDASI as readonly string[]).includes(value)

/** Mencari aturan untuk satu perpindahan, atau undefined bila tidak diizinkan. */
export function findTransition(
  dari: ReportStatus | null,
  ke: ReportStatus,
): StatusTransition | undefined {
  return STATUS_TRANSITIONS.find((transition) => transition.dari === dari && transition.ke === ke)
}

/** Seluruh status yang dapat dicapai dari satu status, opsional disaring per peran. */
export function nextStatuses(dari: ReportStatus | null, oleh?: StatusActor): ReportStatus[] {
  return STATUS_TRANSITIONS.filter(
    (transition) => transition.dari === dari && (!oleh || transition.dipicuOleh === oleh),
  ).map((transition) => transition.ke)
}

export type TransitionCheck =
  | { diizinkan: true; transisi: StatusTransition }
  | { diizinkan: false; alasan: string }

/**
 * Memeriksa satu perpindahan status beserta syaratnya.
 *
 * `data` berisi field yang menyertai perpindahan. Field dianggap kosong bila
 * tidak ada, bernilai null, atau berupa teks yang hanya spasi, sehingga
 * mengirim spasi tidak dapat dipakai untuk melewati syarat wajib.
 */
export function checkTransition(params: {
  dari: ReportStatus | null
  ke: ReportStatus
  oleh: StatusActor
  data?: Record<string, unknown>
}): TransitionCheck {
  const { dari, ke, oleh, data = {} } = params

  const transisi = findTransition(dari, ke)

  if (!transisi) {
    const asal = dari === null ? 'laporan baru' : `status ${dari}`
    return {
      diizinkan: false,
      alasan: `Perpindahan dari ${asal} ke ${ke} tidak diizinkan.`,
    }
  }

  if (transisi.dipicuOleh !== oleh) {
    return {
      diizinkan: false,
      alasan: `Perpindahan ke ${ke} hanya dapat dilakukan oleh ${transisi.dipicuOleh}.`,
    }
  }

  const kosong = transisi.syaratWajib.filter((field) => {
    const nilai = data[field]
    if (nilai === undefined || nilai === null) return true
    return typeof nilai === 'string' && nilai.trim() === ''
  })

  if (kosong.length > 0) {
    return {
      diizinkan: false,
      alasan: `Perpindahan ke ${ke} membutuhkan ${kosong.join(' dan ')}.`,
    }
  }

  return { diizinkan: true, transisi }
}

/** Benar bila laporan sudah tidak dapat berpindah status lagi. */
export const isTerminal = (status: ReportStatus): boolean => STATUS_META[status].terminal

/** Status terurut sesuai kolom `urutan`, untuk penyajian daftar dan filter. */
export const statusesInOrder = (): ReportStatus[] =>
  [...REPORT_STATUSES].sort((a, b) => STATUS_META[a].urutan - STATUS_META[b].urutan)

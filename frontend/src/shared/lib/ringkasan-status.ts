import { isTerminal, nextStatuses, STATUS_META, type ReportStatus } from '../domain/report-status'

/**
 * Ringkasan satu status bagi pembacanya.
 *
 * Lini status menunjukkan di mana laporan berada, tetapi tidak menjawab
 * pertanyaan yang sebenarnya diajukan mahasiswa: siapa yang sedang memegang
 * laporan saya, dan apa yang akan terjadi berikutnya. Penjelasan Tabel 4.1
 * sudah ada sejak awal, hanya tidak pernah ditampilkan.
 */
export type RingkasanStatus = {
  status: ReportStatus
  arti: string
  /** Kalimat tentang apa yang terjadi setelah ini, atau undefined bila berakhir. */
  selanjutnya: string | undefined
}

/** Siapa yang harus bertindak agar laporan berpindah dari status ini. */
const PELAKU_BERIKUTNYA: Partial<Record<ReportStatus, string>> = {
  'Menunggu Pemeriksaan': 'Administrator memeriksa kelengkapan dan kelayakan laporan.',
  'Perlu Dilengkapi': 'Anda melengkapi laporan, lalu laporan kembali diperiksa Administrator.',
  'Lolos Pemeriksaan': 'Administrator meneruskan laporan ke Fakultas/Unit terkait.',
  'Diteruskan ke Fakultas':
    'Fakultas/Unit terkait menanggapi, lalu Administrator mencatat hasilnya.',
  Ditindaklanjuti: 'Administrator mencatat tindak lanjut dan menutup laporan.',
}

export function ringkasanStatus(status: ReportStatus): RingkasanStatus {
  return {
    status,
    arti: STATUS_META[status].arti,
    // Status akhir tidak memiliki kelanjutan, dan menyebut langkah berikutnya
    // untuk laporan yang sudah ditutup justru menjanjikan sesuatu yang tidak
    // akan terjadi.
    selanjutnya: isTerminal(status) ? undefined : PELAKU_BERIKUTNYA[status],
  }
}

/** Status yang memang menunggu tindakan mahasiswa, bukan Administrator. */
export const menungguMahasiswa = (status: ReportStatus): boolean =>
  nextStatuses(status, 'Mahasiswa').length > 0

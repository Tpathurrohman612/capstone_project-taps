import { type ReportStatus } from '../../../shared/domain/report-status'

/** Ekspor hanya menyertakan laporan yang sudah diteruskan ke Fakultas. */
export const STATUS_EKSPOR: ReportStatus = 'Diteruskan ke Fakultas'

/**
 * Mengapa tombol ekspor belum dapat ditekan.
 *
 * Syaratnya sudah dijelaskan, tetapi hanya setelah tombolnya ditekan. Karena
 * tombol itu justru dinonaktifkan ketika syaratnya belum terpenuhi,
 * penjelasannya tidak pernah terbaca siapa pun. Administrator hanya melihat
 * tombol kelabu tanpa tahu apa yang kurang.
 *
 * Urutannya mengikuti urutan pengisian penyaring: fakultas dahulu, lalu
 * status, baru pemilihan barisnya. Menyebut syarat yang belakangan selagi
 * syarat sebelumnya belum terpenuhi akan menyesatkan.
 */
export function alasanEksporTertutup(params: {
  fakultas: string
  status: string
  jumlahTerpilih: number
  jumlahSiap: number
}): string | undefined {
  if (params.fakultas === 'Semua') {
    return 'Pilih satu Fakultas terlebih dahulu. Data dikirim ke satu unit, sehingga ekspor gabungan beberapa fakultas tidak dapat dilakukan.'
  }

  if (params.status !== STATUS_EKSPOR) {
    return `Pilih Status Laporan "${STATUS_EKSPOR}" terlebih dahulu. Hanya laporan yang sudah diteruskan yang berkasnya dikirim ke Fakultas.`
  }

  if (params.jumlahSiap === 0) {
    return `Belum ada laporan berstatus ${STATUS_EKSPOR} pada ${params.fakultas}.`
  }

  if (params.jumlahTerpilih === 0) {
    return 'Centang laporan yang akan diekspor, atau centang kotak pada baris judul untuk memilih seluruhnya.'
  }

  return undefined
}

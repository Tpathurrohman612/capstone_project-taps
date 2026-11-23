import type { WorkflowReport } from '../types/workflow'

/**
 * Waktu satu tahap pada lini status.
 *
 * Judul catatan riwayat ditulis sebagai "Status menjadi <status>", sedangkan
 * lini status mencarinya memakai daftar kalimat peninggalan prototipe seperti
 * "Laporan diterima". Keduanya tidak pernah cocok, sehingga setiap tahap
 * selalu menyatakan belum ada catatan waktu meskipun waktunya tersimpan.
 *
 * Pencocokan kini diturunkan dari nama statusnya sendiri, bukan dari daftar
 * yang ditulis ulang dan dapat meleset tanpa ada yang gagal.
 */
export function judulRiwayat(status: string): string {
  return `Status menjadi ${status}`
}

export function waktuTahap(params: {
  riwayat: WorkflowReport['updates']
  status: string
  indeks: number
  tahapSekarang: number
}): string {
  const catatan = params.riwayat.find((item) => item.title === judulRiwayat(params.status))
  if (catatan && catatan.time !== '') return catatan.time

  return params.indeks > params.tahapSekarang ? 'Menunggu pembaruan' : 'Belum ada catatan waktu'
}

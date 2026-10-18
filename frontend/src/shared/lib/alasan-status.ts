import type { WorkflowReport } from '../types/workflow'

/**
 * Alasan yang ditulis Administrator untuk status laporan saat ini.
 *
 * Penolakan dan permintaan kelengkapan sama-sama menuntut alasan, dan alasan
 * itu tersimpan sebagai keterangan pada riwayat status. Mahasiswa sebelumnya
 * tidak pernah melihatnya: ia hanya diberi tahu laporannya perlu dilengkapi,
 * tanpa diberi tahu apa yang kurang.
 *
 * Yang diambil adalah catatan terakhir yang statusnya sama dengan status
 * laporan sekarang, karena laporan dapat beberapa kali diminta dilengkapi dan
 * yang berlaku selalu permintaan yang terbaru.
 */
export function alasanStatus(
  riwayat: WorkflowReport['updates'],
  status: string,
): string | undefined {
  const judul = `Status menjadi ${status}`

  // Riwayat tersusun dari yang terbaru, sehingga yang pertama cocok adalah
  // yang terakhir dicatat.
  const catatan = riwayat.find((item) => item.title === judul)
  if (!catatan) return undefined

  const teks = catatan.text.trim()
  if (teks === '') return undefined

  // Keterangan ditulis sebagai "<kalimat pembuka>. Alasan: <alasan>".
  // Kalimat pembukanya mengulang apa yang sudah dinyatakan judul bagiannya,
  // sehingga yang ditampilkan cukup alasannya saja.
  const pisah = teks.split(/\bAlasan:\s*/)
  const alasan = pisah.length > 1 ? pisah.slice(1).join('Alasan: ').trim() : teks

  return alasan === '' ? undefined : alasan
}

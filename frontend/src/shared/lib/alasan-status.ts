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

/**
 * Kalimat pembuka keterangan ketika mahasiswa melengkapi laporannya.
 *
 * Dipakai bersama oleh penulis keterangan dan pembacanya, supaya keduanya
 * tidak dapat berbeda tanpa ada yang menyadarinya.
 */
export const PREFIKS_KELENGKAPAN = 'Mahasiswa melengkapi laporan.'

/** Satu kelengkapan yang pernah dikirim mahasiswa. */
export type CatatanKelengkapan = { waktu: string; penjelasan: string }

/**
 * Kelengkapan terakhir yang dikirim mahasiswa.
 *
 * Kelengkapan diperlakukan sebagai satu keterangan yang disunting berulang,
 * bukan sebagai catatan yang bertumpuk. Ketika Administrator meminta
 * kelengkapan lagi, isian mahasiswa diisi lebih dahulu dengan keterangan
 * terakhirnya, sehingga yang dikirim berikutnya sudah memuat seluruh
 * keterangan sebelumnya. Menampilkan setiap pengiriman sebagai baris
 * tersendiri akan mengulang isi yang sama berkali-kali.
 */
export function kelengkapanTerakhir(
  riwayat: WorkflowReport['updates'],
): CatatanKelengkapan | undefined {
  return catatanKelengkapan(riwayat)[0]
}

/**
 * Seluruh kelengkapan yang pernah dikirim mahasiswa, terbaru lebih dahulu.
 *
 * Kelengkapan tersimpan sebagai keterangan riwayat, sehingga tanpa pembacaan
 * ini ia hanya terbaca sebagai satu baris pada lini masa dan bercampur dengan
 * catatan Administrator. Administrator maupun mahasiswa membutuhkannya
 * sebagai keterangan tersendiri, terpisah dari uraian permasalahan yang
 * ditulis pada awal laporan.
 */
export function catatanKelengkapan(riwayat: WorkflowReport['updates']): CatatanKelengkapan[] {
  return riwayat
    .filter((item) => item.text.trim().startsWith(PREFIKS_KELENGKAPAN))
    .map((item) => ({
      waktu: item.time,
      penjelasan: item.text.trim().slice(PREFIKS_KELENGKAPAN.length).trim(),
    }))
    .filter((catatan) => catatan.penjelasan !== '')
}

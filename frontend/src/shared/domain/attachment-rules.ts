/**
 * Batas bukti pendukung.
 *
 * Batas ditegakkan agar satu laporan tidak dapat membawa berkas tanpa batas
 * jumlah maupun ukuran. Aturannya diletakkan terpisah dari layar supaya dapat
 * diuji tanpa merender apa pun, dan supaya sisi penyimpanan kelak memakai
 * angka yang sama persis dengan yang ditampilkan kepada pengguna.
 */

/** Ukuran terbesar satu berkas, dalam byte. */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

/** Banyaknya berkas terbanyak dalam satu laporan. */
export const MAX_FILE_COUNT = 5

export const MAX_FILE_SIZE_LABEL = '5 MB'

/** Keterangan satu berkas yang diperlukan pemeriksaan. */
export type FileLike = {
  name: string
  size: number
}

export type AttachmentCheck =
  | { diterima: true; berkas: FileLike[] }
  | { diterima: false; alasan: string; berkas: FileLike[] }

/** Mengubah ukuran byte menjadi keterangan yang dapat dibaca. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/**
 * Memeriksa berkas yang hendak ditambahkan ke daftar yang sudah ada.
 *
 * Pemeriksaan menolak seluruh penambahan ketika ada satu berkas yang tidak
 * memenuhi syarat, bukan menerima sebagiannya diam-diam. Menerima sebagian
 * membuat pengguna mengira seluruh berkasnya terkirim.
 */
export function checkAttachments(params: {
  sudahAda: readonly FileLike[]
  tambahan: readonly FileLike[]
}): AttachmentCheck {
  const { sudahAda, tambahan } = params

  const terlaluBesar = tambahan.filter((berkas) => berkas.size > MAX_FILE_SIZE_BYTES)

  if (terlaluBesar.length > 0) {
    const nama = terlaluBesar.map((berkas) => berkas.name).join(', ')
    return {
      diterima: false,
      alasan:
        `Ukuran setiap berkas paling besar ${MAX_FILE_SIZE_LABEL}. ` +
        `Berkas berikut melebihi batas: ${nama}.`,
      berkas: [...sudahAda],
    }
  }

  // Berkas kosong hampir selalu berarti unggahan gagal atau berkas rusak,
  // sehingga ditolak daripada tersimpan sebagai bukti yang tidak dapat dibuka.
  const kosong = tambahan.filter((berkas) => berkas.size === 0)

  if (kosong.length > 0) {
    const nama = kosong.map((berkas) => berkas.name).join(', ')
    return {
      diterima: false,
      alasan: `Berkas berikut kosong dan tidak dapat dijadikan bukti: ${nama}.`,
      berkas: [...sudahAda],
    }
  }

  // Berkas dengan nama sama dianggap berkas yang sama, sehingga tidak
  // ditambahkan dua kali ketika pengguna memilihnya ulang.
  const namaAda = new Set(sudahAda.map((berkas) => berkas.name))
  const benarBaru = tambahan.filter((berkas) => !namaAda.has(berkas.name))

  if (sudahAda.length + benarBaru.length > MAX_FILE_COUNT) {
    const sisa = Math.max(0, MAX_FILE_COUNT - sudahAda.length)
    return {
      diterima: false,
      alasan:
        sisa === 0
          ? `Jumlah berkas sudah mencapai batas ${MAX_FILE_COUNT} berkas.`
          : `Jumlah berkas paling banyak ${MAX_FILE_COUNT}. Tersisa ${sisa} berkas lagi.`,
      berkas: [...sudahAda],
    }
  }

  return { diterima: true, berkas: [...sudahAda, ...benarBaru] }
}

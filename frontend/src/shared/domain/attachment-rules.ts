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
  /** Tipe MIME. Kosong berarti tidak diketahui dan diperlakukan sebagai bukan gambar. */
  type?: string
}

/**
 * Batas berkas yang tidak dapat dimampatkan, misalnya PDF.
 *
 * Ditetapkan tepat 500 KB agar sama persis dengan keterangan yang dibaca
 * pengguna. Perhitungan batas dokumen Firestore sebenarnya membolehkan sekitar
 * 538 KB, tetapi memakai angka bulat yang sama dengan tulisan di layar lebih
 * berharga daripada tambahan 38 KB yang tidak terasa.
 *
 * Bukti pendukung disimpan sebagai data base64 di dalam dokumen Firestore
 * karena Cloud Storage memerlukan paket berbayar. Satu dokumen dibatasi 1 MiB
 * dan base64 memperbesar sekitar sepertiga, sehingga berkas yang tidak dapat
 * dimampatkan harus sudah kecil sejak awal.
 *
 * Gambar tidak tunduk pada batas ini karena akan dimampatkan lebih dulu;
 * batasnya tetap MAX_FILE_SIZE_BYTES agar pengguna tidak perlu memperkecil
 * tangkapan layarnya sendiri.
 */
export const MAX_UNCOMPRESSIBLE_BYTES = 500 * 1024

export const MAX_UNCOMPRESSIBLE_LABEL = '500 KB'

const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp']

const dapatDimampatkan = (berkas: FileLike): boolean =>
  typeof berkas.type === 'string' && TIPE_GAMBAR.includes(berkas.type.toLowerCase())

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

  // Berkas yang tidak dapat dimampatkan diperiksa terhadap batas penyimpanan
  // yang lebih ketat, karena ukurannya tidak akan berubah sebelum disimpan.
  const tidakMuat = tambahan.filter(
    (berkas) => !dapatDimampatkan(berkas) && berkas.size > MAX_UNCOMPRESSIBLE_BYTES,
  )

  if (tidakMuat.length > 0) {
    const nama = tidakMuat.map((berkas) => berkas.name).join(', ')
    return {
      diterima: false,
      alasan:
        `Berkas selain gambar paling besar ${MAX_UNCOMPRESSIBLE_LABEL} karena tidak ` +
        `dapat dimampatkan. Berkas berikut melebihi batas: ${nama}.`,
      berkas: [...sudahAda],
    }
  }

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

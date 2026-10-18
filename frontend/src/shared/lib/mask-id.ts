/**
 * Pemendek pengenal panjang.
 *
 * Pengenal seperti Firebase UID cukup ditampilkan sebagian: bagian itu sudah
 * memadai untuk mencocokkan satu akun dengan catatan lain, sementara
 * menampilkannya utuh membuat tangkapan layar dan rekaman demonstrasi
 * membawa pengenal lengkap tanpa alasan.
 *
 * Pemendekan ini bukan pengamanan. Pengenal yang dipendekkan tetap tidak
 * rahasia, dan aturan keamananlah yang menentukan siapa boleh mengakses apa.
 */

/** Banyaknya karakter yang ditampilkan di awal. */
export const MASK_PREFIX_LENGTH = 3

/** Banyaknya karakter yang ditampilkan di akhir. */
export const MASK_SUFFIX_LENGTH = 4

/**
 * Memendekkan pengenal menjadi bentuk awal…akhir.
 *
 * Pengenal yang sudah pendek dikembalikan apa adanya, karena memendekkannya
 * justru menghasilkan teks yang lebih panjang daripada aslinya dan tidak
 * menyembunyikan apa pun.
 */
export function maskId(id: string | null | undefined): string | undefined {
  if (id === null || id === undefined) return undefined

  const bersih = id.trim()
  if (bersih === '') return undefined

  const minimal = MASK_PREFIX_LENGTH + MASK_SUFFIX_LENGTH + 1
  if (bersih.length <= minimal) return bersih

  return `${bersih.slice(0, MASK_PREFIX_LENGTH)}…${bersih.slice(-MASK_SUFFIX_LENGTH)}`
}

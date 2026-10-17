/**
 * Nomor laporan.
 *
 * ERD pada Gambar 3.3 memisahkan `nomor_laporan` dari `id_laporan`:
 * `id_laporan` adalah kunci primer yang tidak pernah dilihat pengguna,
 * sedangkan `nomor_laporan` adalah nomor yang dibaca manusia dan dipakai saat
 * berkomunikasi dengan Fakultas/Unit terkait, misalnya LT-2026-0007.
 *
 * Modul ini hanya mengurus bentuk dan penghitungan nomor. Penyimpanan serta
 * penguncian urutannya ditangani lapisan data, karena menjamin nomor tidak
 * kembar memerlukan transaksi.
 */

/** Awalan tetap, dari Lapor Tuton. */
export const REPORT_NUMBER_PREFIX = 'LT'

/** Banyaknya digit urutan dalam satu tahun. */
export const REPORT_NUMBER_DIGITS = 4

const PATTERN = /^LT-(\d{4})-(\d{4})$/

export type ParsedReportNumber = {
  tahun: number
  urutan: number
}

/** Menyusun nomor laporan dari tahun dan urutan. */
export function formatReportNumber(tahun: number, urutan: number): string {
  if (!Number.isInteger(tahun) || tahun < 1000 || tahun > 9999) {
    throw new RangeError(`Tahun nomor laporan harus empat digit, diterima ${tahun}.`)
  }

  if (!Number.isInteger(urutan) || urutan < 1) {
    throw new RangeError(`Urutan nomor laporan harus bilangan bulat positif, diterima ${urutan}.`)
  }

  // Urutan yang melewati empat digit tetap ditulis apa adanya daripada
  // dipotong, karena memotongnya akan menghasilkan nomor kembar tanpa
  // peringatan. Bentuknya memang menjadi lebih panjang, dan itu disengaja.
  return `${REPORT_NUMBER_PREFIX}-${tahun}-${String(urutan).padStart(REPORT_NUMBER_DIGITS, '0')}`
}

/** Membaca nomor laporan, atau undefined bila bentuknya tidak sesuai. */
export function parseReportNumber(nomor: string): ParsedReportNumber | undefined {
  const cocok = PATTERN.exec(nomor.trim())
  if (!cocok) return undefined

  return { tahun: Number(cocok[1]), urutan: Number(cocok[2]) }
}

export const isReportNumber = (nilai: unknown): nilai is string =>
  typeof nilai === 'string' && PATTERN.test(nilai.trim())

/**
 * Menentukan nomor berikutnya untuk satu tahun dari daftar nomor yang sudah
 * ada. Nomor dari tahun lain diabaikan, sehingga urutan dimulai kembali dari 1
 * setiap pergantian tahun. Nomor yang bentuknya tidak sah juga diabaikan agar
 * satu rekaman rusak tidak menghentikan pembuatan laporan.
 */
export function nextReportNumber(existing: readonly string[], tahun: number): string {
  const tertinggi = existing.reduce((tinggi, nomor) => {
    const terbaca = parseReportNumber(nomor)
    if (!terbaca || terbaca.tahun !== tahun) return tinggi
    return Math.max(tinggi, terbaca.urutan)
  }, 0)

  return formatReportNumber(tahun, tertinggi + 1)
}

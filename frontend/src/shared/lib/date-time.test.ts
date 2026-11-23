import { describe, expect, it } from 'vitest'
import { formatIndonesianDate, formatIndonesianDateTime } from './date-time'

/**
 * Format tanggal dipakai pada seluruh tampilan laporan dan riwayat, sehingga
 * perubahan kecil di sini terlihat di banyak tempat.
 *
 * Pengujian memakai tanggal dalam waktu lokal, bukan UTC, karena Intl memformat
 * menurut zona waktu mesin. Memakai UTC akan membuat hasilnya berubah-ubah
 * tergantung tempat pengujian dijalankan.
 */

const tanggalLokal = (tahun: number, bulanNol: number, hari: number, jam = 0, menit = 0): Date =>
  new Date(tahun, bulanNol, hari, jam, menit)

describe('formatIndonesianDate', () => {
  it('menulis bulan dengan nama lengkap berbahasa Indonesia', () => {
    expect(formatIndonesianDate(tanggalLokal(2026, 9, 17))).toBe('17 Oktober 2026')
  })

  it('tidak menambahkan nol di depan tanggal satu digit', () => {
    expect(formatIndonesianDate(tanggalLokal(2026, 0, 5))).toBe('5 Januari 2026')
  })

  it('menangani hari terakhir tahun', () => {
    expect(formatIndonesianDate(tanggalLokal(2026, 11, 31))).toBe('31 Desember 2026')
  })

  it('menangani 29 Februari pada tahun kabisat', () => {
    expect(formatIndonesianDate(tanggalLokal(2028, 1, 29))).toBe('29 Februari 2028')
  })
})

describe('formatIndonesianDateTime', () => {
  it('menambahkan jam dan menit setelah tanggal', () => {
    expect(formatIndonesianDateTime(tanggalLokal(2026, 9, 17, 14, 30))).toBe(
      '17 Oktober 2026, 14:30',
    )
  })

  it('memakai jam 24 dan bukan AM atau PM', () => {
    const hasil = formatIndonesianDateTime(tanggalLokal(2026, 9, 17, 21, 5))
    expect(hasil).toBe('17 Oktober 2026, 21:05')
    expect(hasil).not.toMatch(/AM|PM/i)
  })

  it('menulis tengah malam sebagai 00:00, bukan 24:00', () => {
    // hourCycle h23 dipilih justru untuk ini; h24 akan menghasilkan 24:00.
    expect(formatIndonesianDateTime(tanggalLokal(2026, 9, 17, 0, 0))).toBe('17 Oktober 2026, 00:00')
  })

  it('menambahkan nol di depan jam dan menit satu digit', () => {
    expect(formatIndonesianDateTime(tanggalLokal(2026, 9, 17, 9, 7))).toBe('17 Oktober 2026, 09:07')
  })

  it('memakai tanggal yang sama dengan formatIndonesianDate', () => {
    const tanggal = tanggalLokal(2026, 2, 8, 16, 45)
    expect(formatIndonesianDateTime(tanggal).startsWith(formatIndonesianDate(tanggal))).toBe(true)
  })
})

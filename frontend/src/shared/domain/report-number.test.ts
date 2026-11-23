import { describe, expect, it } from 'vitest'
import {
  formatReportNumber,
  isReportNumber,
  nextReportNumber,
  parseReportNumber,
} from './report-number'

describe('formatReportNumber', () => {
  it('menyusun nomor sesuai contoh pada ERD', () => {
    expect(formatReportNumber(2026, 7)).toBe('LT-2026-0007')
  })

  it('menambahkan nol di depan sampai empat digit', () => {
    expect(formatReportNumber(2026, 1)).toBe('LT-2026-0001')
    expect(formatReportNumber(2026, 42)).toBe('LT-2026-0042')
    expect(formatReportNumber(2026, 9999)).toBe('LT-2026-9999')
  })

  it('tidak memotong urutan yang melewati empat digit', () => {
    // Memotong akan menghasilkan nomor kembar tanpa peringatan, sehingga
    // nomornya sengaja dibiarkan memanjang.
    expect(formatReportNumber(2026, 10000)).toBe('LT-2026-10000')
  })

  it('menolak tahun yang bukan empat digit', () => {
    expect(() => formatReportNumber(26, 1)).toThrow(RangeError)
    expect(() => formatReportNumber(12026, 1)).toThrow(RangeError)
  })

  it('menolak urutan nol, negatif, atau pecahan', () => {
    expect(() => formatReportNumber(2026, 0)).toThrow(RangeError)
    expect(() => formatReportNumber(2026, -3)).toThrow(RangeError)
    expect(() => formatReportNumber(2026, 1.5)).toThrow(RangeError)
  })
})

describe('parseReportNumber', () => {
  it('membaca tahun dan urutan', () => {
    expect(parseReportNumber('LT-2026-0007')).toEqual({ tahun: 2026, urutan: 7 })
  })

  it('mengabaikan spasi di tepi', () => {
    expect(parseReportNumber('  LT-2026-0007  ')).toEqual({ tahun: 2026, urutan: 7 })
  })

  it('menolak bentuk yang tidak sesuai', () => {
    expect(parseReportNumber('LT-2026-7')).toBeUndefined()
    expect(parseReportNumber('XX-2026-0007')).toBeUndefined()
    expect(parseReportNumber('LT-2026')).toBeUndefined()
    expect(parseReportNumber('')).toBeUndefined()
    expect(parseReportNumber('lt-2026-0007')).toBeUndefined()
  })
})

describe('isReportNumber', () => {
  it('membedakan nomor laporan dari nilai lain', () => {
    expect(isReportNumber('LT-2026-0007')).toBe(true)
    expect(isReportNumber('LT-2026-7')).toBe(false)
    expect(isReportNumber(7)).toBe(false)
    expect(isReportNumber(null)).toBe(false)
  })
})

describe('nextReportNumber', () => {
  it('memulai dari satu ketika belum ada laporan', () => {
    expect(nextReportNumber([], 2026)).toBe('LT-2026-0001')
  })

  it('melanjutkan dari urutan tertinggi, bukan dari jumlah data', () => {
    // Jumlah data tiga, tetapi urutan tertinggi sembilan. Memakai jumlah data
    // akan menghasilkan nomor yang sudah terpakai.
    const ada = ['LT-2026-0001', 'LT-2026-0009', 'LT-2026-0004']
    expect(nextReportNumber(ada, 2026)).toBe('LT-2026-0010')
  })

  it('tidak terpengaruh urutan masukan', () => {
    expect(nextReportNumber(['LT-2026-0009', 'LT-2026-0001'], 2026)).toBe('LT-2026-0010')
    expect(nextReportNumber(['LT-2026-0001', 'LT-2026-0009'], 2026)).toBe('LT-2026-0010')
  })

  it('mengabaikan nomor dari tahun lain', () => {
    const ada = ['LT-2025-0120', 'LT-2024-0999']
    expect(nextReportNumber(ada, 2026)).toBe('LT-2026-0001')
  })

  it('memulai urutan baru setiap pergantian tahun', () => {
    const ada = ['LT-2026-0310']
    expect(nextReportNumber(ada, 2027)).toBe('LT-2027-0001')
  })

  it('mengabaikan nomor yang bentuknya rusak', () => {
    // Satu rekaman rusak tidak boleh menghentikan pembuatan laporan.
    const ada = ['LT-2026-0003', 'rusak', '', 'LT-2026-XX']
    expect(nextReportNumber(ada, 2026)).toBe('LT-2026-0004')
  })

  it('menghasilkan nomor yang dapat dibaca kembali', () => {
    const nomor = nextReportNumber(['LT-2026-0007'], 2026)
    expect(parseReportNumber(nomor)).toEqual({ tahun: 2026, urutan: 8 })
  })
})

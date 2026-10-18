import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { HASIL_VALIDASI, isHasilValidasi } from '../../../shared/domain/report-status'

/**
 * Pilihan hasil validasi.
 *
 * Tabel 4.2 menetapkan tiga kemungkinan hasil validasi, tetapi isiannya pada
 * layar berupa teks bebas, sehingga kesimpulan yang tercatat dapat berbunyi
 * apa saja. Hasil semacam itu tidak dapat dihitung maupun dibandingkan
 * antarlaporan, dan nilai bakunya tidak pernah terpakai sama sekali.
 */

const layar = readFileSync(join(__dirname, '../screens/AdminWorkflowDetailScreen.tsx'), 'utf8')

describe('hasil validasi', () => {
  it('menetapkan tiga kemungkinan sesuai Tabel 4.2', () => {
    expect([...HASIL_VALIDASI]).toEqual(['Terbukti', 'Tidak Terbukti', 'Tidak Ada Tanggapan'])
  })

  it('hanya menerima nilai yang ditetapkan', () => {
    expect(isHasilValidasi('Terbukti')).toBe(true)
    expect(isHasilValidasi('KATANYA OKE')).toBe(false)
    expect(isHasilValidasi('')).toBe(false)
  })

  it('menawarkan pilihannya pada layar, bukan isian bebas', () => {
    // Selama isiannya berupa input teks, nilai baku pada Tabel 4.2 tidak
    // pernah terpakai dan hasil validasi dapat berbunyi apa saja.
    expect(layar, 'layar tidak memakai daftar hasil validasi').toMatch(/HASIL_VALIDASI\.map/)
  })

  it('menjelaskan setiap pilihannya', () => {
    // Namanya saja tidak menerangkan kapan masing-masing dipakai, terutama
    // Tidak Ada Tanggapan yang menandai keadaan tanpa jawaban.
    for (const pilihan of HASIL_VALIDASI) {
      expect(layar, `pilihan "${pilihan}" tidak dijelaskan`).toContain(pilihan)
    }
    expect(layar).toMatch(/KETERANGAN_HASIL/)
  })

  it('mewajibkan unit validator sebagaimana Tabel 4.2', () => {
    expect(layar, 'unit validator tidak diwajibkan').toMatch(/Unit Validator wajib diisi/)
  })
})

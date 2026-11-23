import { describe, expect, it } from 'vitest'
import { menungguMahasiswa, ringkasanStatus } from './ringkasan-status'
import { isTerminal, REPORT_STATUSES } from '../domain/report-status'

/**
 * Ringkasan status.
 *
 * Yang dijaga di sini bukan kalimatnya, melainkan kelengkapannya: setiap
 * status yang masih berjalan harus dapat menjelaskan apa yang terjadi
 * berikutnya, dan setiap status akhir tidak boleh menjanjikan kelanjutan yang
 * tidak akan pernah terjadi.
 */

describe('ringkasanStatus', () => {
  it('menjelaskan langkah berikutnya untuk setiap status yang masih berjalan', () => {
    // Status baru yang ditambahkan ke Tabel 4.1 tanpa penjelasan lanjutannya
    // akan tertangkap di sini, bukan muncul sebagai bagian kosong di layar.
    for (const status of REPORT_STATUSES) {
      if (isTerminal(status)) continue

      const ringkasan = ringkasanStatus(status)
      expect(ringkasan.selanjutnya, `${status} harus menjelaskan langkah berikutnya`).toBeTruthy()
    }
  })

  it('tidak menjanjikan kelanjutan untuk status akhir', () => {
    for (const status of REPORT_STATUSES) {
      if (!isTerminal(status)) continue

      expect(ringkasanStatus(status).selanjutnya, `${status} sudah berakhir`).toBeUndefined()
    }
  })

  it('menyertakan arti dari Tabel 4.1', () => {
    for (const status of REPORT_STATUSES) {
      expect(ringkasanStatus(status).arti, `${status} harus memiliki arti`).toBeTruthy()
    }
  })

  it('mengenali status yang menunggu tindakan mahasiswa', () => {
    expect(menungguMahasiswa('Perlu Dilengkapi')).toBe(true)
    expect(menungguMahasiswa('Diteruskan ke Fakultas')).toBe(false)
    expect(menungguMahasiswa('Ditolak')).toBe(false)
  })
})

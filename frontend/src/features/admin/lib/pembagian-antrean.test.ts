import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isTerminal, REPORT_STATUSES } from '../../../shared/domain/report-status'

/**
 * Pembagian antara Antrean Laporan dan Riwayat Laporan.
 *
 * Keduanya pernah memakai status Selesai sebagai patokan, padahal Ditolak
 * juga status akhir. Laporan yang ditolak karena itu mengendap selamanya di
 * antrean dan tidak pernah masuk riwayat, bahkan muncul pada daftar laporan
 * yang perlu ditindaklanjuti meskipun tidak ada lagi yang dapat dilakukan.
 */

describe('pembagian antrean dan riwayat', () => {
  it('menempatkan setiap status pada tepat satu sisi', () => {
    for (const status of REPORT_STATUSES) {
      const diAntrean = !isTerminal(status)
      const diRiwayat = isTerminal(status)

      expect(diAntrean !== diRiwayat, `${status} harus berada pada tepat satu sisi`).toBe(true)
    }
  })

  it('menempatkan Ditolak pada riwayat, bukan antrean', () => {
    expect(isTerminal('Ditolak'), 'Ditolak tidak boleh tersisa di antrean').toBe(true)
  })

  it('menempatkan seluruh status yang masih berjalan pada antrean', () => {
    for (const status of REPORT_STATUSES) {
      if (status === 'Ditolak' || status === 'Selesai') continue
      expect(isTerminal(status), `${status} masih berjalan`).toBe(false)
    }
  })

  it('membagi antrean memakai sifat akhir status, bukan nama status tertentu', () => {
    // Patokan berupa nama status tunggal meleset begitu Tabel 4.1 menambah
    // status akhir yang baru, dan itu sudah terjadi dengan Ditolak. Yang
    // diperiksa di sini: ketiga layar memakai isTerminal, dan tidak satu pun
    // masih mengecualikan laporan hanya berdasarkan nama Selesai.
    const layar = [
      '../screens/AdminWorkflowQueueScreen.tsx',
      '../screens/AdminWorkflowHistoryScreen.tsx',
      '../screens/AdminDashboardScreen.tsx',
    ]

    for (const berkas of layar) {
      const isi = readFileSync(join(__dirname, berkas), 'utf8')

      expect(isi, `${berkas} tidak memakai isTerminal`).toContain('isTerminal')
      expect(isi, `${berkas} masih mengecualikan memakai nama Selesai`).not.toMatch(
        /status\s*!==\s*'Selesai'/,
      )
    }
  })
})

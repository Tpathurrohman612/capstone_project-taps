import { describe, expect, it } from 'vitest'
import { statusBadge } from './status-badge'
import { REPORT_STATUSES } from '../../../shared/domain/report-status'

/**
 * Lencana status adalah satu-satunya petunjuk visual keadaan laporan, sehingga
 * status tanpa warna akan tampil seolah tidak bermakna.
 */
describe('statusBadge', () => {
  it('memberi kelas untuk setiap status pada Tabel 4.1', () => {
    for (const status of REPORT_STATUSES) {
      const kelas = statusBadge(status)
      expect(kelas, `status ${status} tidak memiliki kelas`).toBeTruthy()
      expect(kelas).toContain('border-')
      expect(kelas).toContain('bg-')
      expect(kelas).toContain('text-')
    }
  })

  it('membedakan Ditolak dengan warna merah', () => {
    // Laporan yang berhenti tidak boleh terlihat sama seperti status netral.
    expect(statusBadge('Ditolak')).toContain('#B42318')
  })

  it('membedakan Perlu Dilengkapi dengan warna oranye', () => {
    expect(statusBadge('Perlu Dilengkapi')).toContain('#8A4B12')
  })

  it('memberi Ditolak dan Selesai warna yang berbeda', () => {
    // Keduanya status akhir, tetapi maknanya berlawanan.
    expect(statusBadge('Ditolak')).not.toBe(statusBadge('Selesai'))
  })

  it('tidak memakai warna yang sama untuk Ditolak dan Menunggu Pemeriksaan', () => {
    expect(statusBadge('Ditolak')).not.toBe(statusBadge('Menunggu Pemeriksaan'))
  })
})

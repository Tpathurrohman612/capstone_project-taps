import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { workflowStatusClass } from './workflow-ui'
import { statusBadge } from '../../student/lib/status-badge'
import { REPORT_STATUSES } from '../../../shared/domain/report-status'

/**
 * Warna lencana status.
 *
 * Layar Dasbor Administrator pernah memiliki peta warnanya sendiri yang hanya
 * mengenali dua status, sehingga sisanya jatuh ke warna biru. Laporan yang
 * ditolak pun tampil biru seperti laporan yang sedang berjalan.
 *
 * Peta bersama di kedua sisi bertipe lengkap, sehingga status baru pada Tabel
 * 4.1 akan memunculkan galat kompilasi. Yang tidak dapat dijaga tipe adalah
 * munculnya kembali peta kedua, dan itulah yang diperiksa di sini.
 */

const MERAH = '#B42318'

describe('warna lencana status', () => {
  it('memberi warna pada setiap status di kedua sisi', () => {
    for (const status of REPORT_STATUSES) {
      expect(workflowStatusClass(status), `${status} pada sisi Administrator`).toBeTruthy()
      expect(statusBadge(status), `${status} pada sisi Mahasiswa`).toBeTruthy()
    }
  })

  it('menandai laporan yang ditolak dengan merah di kedua sisi', () => {
    // Inilah yang pernah gagal: Ditolak tampil biru dan terbaca seperti
    // laporan yang masih berjalan.
    expect(workflowStatusClass('Ditolak')).toContain(MERAH)
    expect(statusBadge('Ditolak')).toContain(MERAH)
  })

  it('tidak memakai warna merah untuk status yang masih berjalan', () => {
    for (const status of REPORT_STATUSES) {
      if (status === 'Ditolak') continue
      expect(workflowStatusClass(status), `${status} tidak boleh merah`).not.toContain(MERAH)
    }
  })

  it('tidak ada layar yang membuat peta warna statusnya sendiri', () => {
    // Peta kedua tidak akan tertangkap pemeriksa tipe, karena ia dapat
    // menerima string apa pun dan menyediakan warna cadangan untuk status yang
    // tidak dikenalinya. Yang tersisa hanyalah memeriksa sumbernya.
    const layar = [
      '../screens/AdminDashboardScreen.tsx',
      '../screens/AdminWorkflowQueueScreen.tsx',
      '../screens/AdminWorkflowDetailScreen.tsx',
      '../../student/screens/DetailReportScreen.tsx',
      '../../student/screens/ReportHistoryScreen.tsx',
      '../../student/screens/DashboardScreen.tsx',
    ]

    for (const berkas of layar) {
      const isi = readFileSync(join(__dirname, berkas), 'utf8')

      expect(isi, `${berkas} membuat peta warna status sendiri`).not.toMatch(
        /const \w*[Ss]tatusClass\w* = \(/,
      )
    }
  })

  it('memberi warna berbeda untuk setiap status', () => {
    // Dua status berwarna sama persis tidak dapat dipisahkan sekilas, dan itu
    // pernah terjadi pada Lolos Pemeriksaan dengan Diteruskan ke Fakultas.
    const warna = REPORT_STATUSES.map((status) => statusBadge(status))

    expect(new Set(warna).size, 'ada status yang berwarna sama persis').toBe(warna.length)
  })

  it('tidak memakai warna yang nyaris sama dengan latar kartu', () => {
    // Latar kartu riwayat #F7F9FC. Lencana berlatar sedekat itu terbaca
    // seperti tanpa warna sama sekali, dan itu pernah terjadi pada Selesai.
    expect(statusBadge('Selesai')).not.toContain('#EEF5FB')
  })

  it('tidak menyebut nama status sebagai teks tertanam pada layar', () => {
    // Penggantian nama status pernah mengubah label tanggal "Diterima
    // <tanggal>" menjadi klaim status yang keliru, karena teks itu kebetulan
    // memuat nama status. Teks semacam itu tidak boleh berdampingan dengan
    // nilai yang bukan status.
    const layar = readFileSync(
      join(__dirname, '../../student/screens/ReportHistoryScreen.tsx'),
      'utf8',
    )

    for (const status of REPORT_STATUSES) {
      expect(layar, `"${status}" tertanam sebagai teks biasa`).not.toContain(`${status} {report.`)
    }
  })
})

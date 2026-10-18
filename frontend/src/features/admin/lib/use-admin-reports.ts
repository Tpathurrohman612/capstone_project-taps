import { useCallback, useEffect, useState } from 'react'
import type { WorkflowReport } from '../../../shared/types/workflow'
import type { ReportStatus } from '../../../shared/domain/report-status'
import { changeReportStatus, fetchAllReports } from '../../../shared/data/report-store'
import { useAuth } from '../../../shared/lib/auth-context'
import { jelaskanGalatFirestore } from '../../../shared/lib/firestore-error'

/**
 * Seluruh laporan bagi Administrator.
 *
 * Layar Administrator sebelumnya membaca dan menulis sessionStorage secara
 * langsung, sehingga laporan mahasiswa yang sudah tersimpan di Cloud Firestore
 * tidak pernah terlihat di antrean. Hook ini menyatukan pembacaan yang kini
 * asinkron, dan menjadikan perubahan status melewati satu pintu yang sama.
 *
 * Pembacaan seluruh laporan hanya berhasil bila pemanggil benar-benar
 * Administrator; aturan keamanan menolaknya bila bukan, sehingga kegagalan di
 * sini juga menjadi penanda bahwa peran yang dipakai keliru.
 */
export function useAdminReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<WorkflowReport[]>([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState<string | undefined>(undefined)
  const [penanda, setPenanda] = useState(0)

  useEffect(() => {
    let aktif = true
    setMemuat(true)
    setGalat(undefined)

    fetchAllReports()
      .then((hasil) => {
        if (aktif) setReports(hasil)
      })
      .catch((penyebab: unknown) => {
        if (!aktif) return
        setReports([])
        setGalat(jelaskanGalatFirestore(penyebab, 'daftar-laporan-administrator'))
      })
      .finally(() => {
        if (aktif) setMemuat(false)
      })

    return () => {
      aktif = false
    }
  }, [penanda])

  const muatUlang = useCallback(() => setPenanda((nilai) => nilai + 1), [])

  /**
   * Memindahkan status satu laporan.
   *
   * Kelayakan perpindahan diperiksa lapisan data memakai Tabel 4.2, dan
   * aturan keamanan memeriksanya lagi di server. Kegagalan dikembalikan
   * sebagai pesan agar layar dapat menampilkannya, bukan dilempar sebagai
   * galat yang menjatuhkan halaman.
   */
  const ubahStatus = useCallback(
    async (params: {
      report: WorkflowReport
      ke: ReportStatus
      keterangan?: string
      data?: Record<string, unknown>
    }): Promise<{ berhasil: true } | { berhasil: false; alasan: string }> => {
      if (!user) {
        return { berhasil: false, alasan: 'Sesi masuk sudah berakhir. Silakan masuk kembali.' }
      }

      try {
        await changeReportStatus({
          docId: params.report.docId,
          reportNumber: params.report.id,
          ke: params.ke,
          oleh: 'Administrator',
          uidPencatat: user.uid,
          ...(params.keterangan ? { keterangan: params.keterangan } : {}),
          ...(params.data ? { data: params.data } : {}),
        })

        muatUlang()
        return { berhasil: true }
      } catch (penyebab) {
        return { berhasil: false, alasan: jelaskanGalatFirestore(penyebab, 'ubah-status') }
      }
    },
    [user, muatUlang],
  )

  return { reports, memuat, galat, muatUlang, ubahStatus }
}

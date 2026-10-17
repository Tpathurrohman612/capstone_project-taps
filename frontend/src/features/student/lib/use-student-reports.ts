import { useCallback, useEffect, useMemo, useState } from 'react'
import type { HistoryReport } from '../../../shared/types/history-report'
import type { WorkflowReport } from '../../../shared/types/workflow'
import { fetchMyReports, toHistoryReport } from '../../../shared/data/report-store'
import { useStudentIdentity } from './student-identity'

/**
 * Riwayat laporan milik mahasiswa yang sedang masuk.
 *
 * Pembacaan dari Firestore berlangsung asinkron, sedangkan layar sebelumnya
 * membaca sessionStorage secara serentak. Hook ini menyatukan keduanya: layar
 * cukup menunggu `memuat` selesai tanpa mengetahui data berasal dari mana.
 *
 * Urutan dan pemetaan ke bentuk riwayat dilakukan di sini, sehingga keempat
 * layar yang memakainya tidak dapat berbeda cara mengurutkan.
 */
export function useStudentReports() {
  const identity = useStudentIdentity()
  const [reports, setReports] = useState<WorkflowReport[]>([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState<string | undefined>(undefined)
  const [penanda, setPenanda] = useState(0)

  const ownerKey = identity.ownerKey

  useEffect(() => {
    // Selama identitas belum diketahui, tidak ada yang dapat dibaca. Menandai
    // selesai memuat pada saat ini akan membuat layar menampilkan "tidak ada
    // laporan" padahal datanya belum sempat diminta.
    if (identity.memuat) {
      setMemuat(true)
      return
    }

    if (ownerKey === undefined || ownerKey === '') {
      setReports([])
      setMemuat(false)
      return
    }

    let aktif = true
    setMemuat(true)
    setGalat(undefined)

    fetchMyReports(ownerKey)
      .then((hasil) => {
        if (!aktif) return
        setReports(hasil)
      })
      .catch((penyebab: unknown) => {
        if (!aktif) return
        setReports([])
        setGalat(
          penyebab instanceof Error
            ? penyebab.message
            : 'Gagal memuat laporan. Periksa koneksi lalu coba lagi.',
        )
      })
      .finally(() => {
        if (aktif) setMemuat(false)
      })

    return () => {
      aktif = false
    }
  }, [ownerKey, identity.memuat, penanda])

  const muatUlang = useCallback(() => {
    setPenanda((nilai) => nilai + 1)
  }, [])

  const riwayat: HistoryReport[] = useMemo(
    () =>
      [...reports]
        .map(toHistoryReport)
        .sort((kiri, kanan) => kanan.id.localeCompare(kiri.id, undefined, { numeric: true })),
    [reports],
  )

  return { reports, riwayat, memuat, galat, muatUlang, identity }
}

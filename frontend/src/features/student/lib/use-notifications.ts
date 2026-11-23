import { useCallback, useEffect, useMemo, useState } from 'react'
import type { WorkflowReport } from '../../../shared/types/workflow'
import { usingFirestore } from '../../../shared/data/report-store'
import {
  listNotifications,
  markNotificationRead,
  notificationMessage,
  type ReportNotification,
} from '../../../shared/data/notification-repository'

/**
 * Notifikasi perubahan status laporan milik mahasiswa yang sedang masuk.
 *
 * Sebelumnya daftar notifikasi berupa dua rekaman yang ditulis langsung di
 * dalam kode, dan penanda sudah dibaca hanya hidup di state React sehingga
 * kembali belum dibaca setiap kali halaman dimuat ulang. Kini keduanya berasal
 * dari riwayat_status_laporan di Firestore, dan penandaannya tersimpan pada
 * field dibaca_pada sesuai ERD.
 *
 * Pada mode prototipe tanpa Firebase, daftar dikosongkan daripada diisi
 * rekaman contoh, karena notifikasi palsu yang terlihat sungguhan lebih
 * menyesatkan daripada tidak ada notifikasi sama sekali.
 */

export type TampilanNotifikasi = {
  id: string
  nomorLaporan: string | undefined
  pesan: string
  waktu: Date | undefined
  belumDibaca: boolean
}

export function useNotifications(reports: readonly WorkflowReport[]) {
  const [notifikasi, setNotifikasi] = useState<ReportNotification[]>([])
  const [memuat, setMemuat] = useState(false)

  // Peta dari id dokumen laporan ke nomor yang dilihat pengguna, supaya pesan
  // notifikasi menyebut LT-2026-0001 dan bukan pengenal dokumen.
  const nomorPerDok = useMemo(() => {
    const peta = new Map<string, string>()
    for (const laporan of reports) {
      if (laporan.docId) peta.set(laporan.docId, laporan.id)
    }
    return peta
  }, [reports])

  const idLaporan = useMemo(
    () => reports.map((laporan) => laporan.docId).filter((id): id is string => Boolean(id)),
    [reports],
  )

  // Kunci sederhana atas daftar id, supaya efek tidak berjalan ulang hanya
  // karena array baru dibuat dengan isi yang sama.
  const kunci = idLaporan.join(',')

  useEffect(() => {
    if (!usingFirestore() || idLaporan.length === 0) {
      setNotifikasi([])
      return
    }

    let aktif = true
    setMemuat(true)

    listNotifications(idLaporan)
      .then((hasil) => {
        if (aktif) setNotifikasi(hasil)
      })
      .catch(() => {
        // Gagal memuat notifikasi tidak boleh menjatuhkan dasbor.
        if (aktif) setNotifikasi([])
      })
      .finally(() => {
        if (aktif) setMemuat(false)
      })

    return () => {
      aktif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci])

  const tandaiDibaca = useCallback(async (id: string) => {
    // Tampilan diperbarui lebih dulu agar terasa langsung, lalu penandaannya
    // disimpan. Bila penyimpanan gagal, keadaan dikembalikan supaya tampilan
    // tidak mengaku sudah dibaca padahal basis data tidak mencatatnya.
    setNotifikasi((daftar) =>
      daftar.map((item) =>
        item.id === id ? { ...item, belumDibaca: false, dibacaPada: new Date() } : item,
      ),
    )

    try {
      await markNotificationRead(id)
    } catch {
      setNotifikasi((daftar) =>
        daftar.map((item) =>
          item.id === id ? { ...item, belumDibaca: true, dibacaPada: undefined } : item,
        ),
      )
    }
  }, [])

  /**
   * Menandai seluruh notifikasi yang belum dibaca.
   *
   * Sebelumnya tombol pada dasbor hanya mengosongkan daftar di layar tanpa
   * menyentuh basis data, sehingga notifikasi yang sama muncul lagi setelah
   * halaman dimuat ulang.
   */
  const tandaiSemuaDibaca = useCallback(async () => {
    const belum = notifikasi.filter((item) => item.belumDibaca).map((item) => item.id)
    if (belum.length === 0) return

    await Promise.all(belum.map((id) => tandaiDibaca(id)))
  }, [notifikasi, tandaiDibaca])

  const tampilan: TampilanNotifikasi[] = useMemo(
    () =>
      notifikasi.map((item) => ({
        id: item.id,
        nomorLaporan: nomorPerDok.get(item.idLaporan),
        pesan: notificationMessage(item, nomorPerDok.get(item.idLaporan)),
        waktu: item.waktu,
        belumDibaca: item.belumDibaca,
      })),
    [notifikasi, nomorPerDok],
  )

  const belumDibaca = tampilan.filter((item) => item.belumDibaca).length

  return { notifikasi: tampilan, belumDibaca, memuat, tandaiDibaca, tandaiSemuaDibaca }
}

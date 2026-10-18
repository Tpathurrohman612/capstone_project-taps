import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { isReportStatus, type ReportStatus } from '../domain/report-status'
import { RIWAYAT_COLLECTION } from './laporan-repository'

/**
 * Notifikasi perubahan status laporan.
 *
 * FR-07 menuntut mahasiswa diberi tahu setiap kali status atau tindak lanjut
 * laporannya berubah. Notifikasi tidak disimpan sebagai koleksi tersendiri,
 * melainkan diturunkan dari riwayat_status_laporan yang memang sudah mencatat
 * setiap perubahan. Menyimpannya dua kali akan membuka kemungkinan keduanya
 * berbeda isi.
 *
 * Penanda sudah dibaca memakai field dibaca_pada pada entitas riwayat, persis
 * sebagaimana dirancang pada ERD Gambar 3.3. Sebelumnya penanda itu hanya ada
 * di dalam state React, sehingga hilang setiap kali halaman dimuat ulang.
 */

export type ReportNotification = {
  /** Pengenal dokumen riwayat, dipakai saat menandai sudah dibaca. */
  id: string
  /** Pengenal dokumen laporan, untuk membuka detailnya. */
  idLaporan: string
  status: ReportStatus
  keterangan: string
  waktu: Date | undefined
  dibacaPada: Date | undefined
  belumDibaca: boolean
}

export class NotificationNotConfiguredError extends Error {
  constructor() {
    super('Firebase belum dikonfigurasi, notifikasi tidak dapat dibaca.')
    this.name = 'NotificationNotConfiguredError'
  }
}

const keDate = (nilai: unknown): Date | undefined =>
  nilai instanceof Timestamp ? nilai.toDate() : nilai instanceof Date ? nilai : undefined

function toNotification(id: string, data: DocumentData): ReportNotification | undefined {
  if (typeof data.id_laporan !== 'string' || !isReportStatus(data.id_status)) return undefined

  const dibacaPada = keDate(data.dibaca_pada)

  return {
    id,
    idLaporan: data.id_laporan,
    status: data.id_status,
    keterangan: typeof data.keterangan === 'string' ? data.keterangan : '',
    waktu: keDate(data.tanggal_riwayat),
    dibacaPada,
    belumDibaca: dibacaPada === undefined,
  }
}

/**
 * Notifikasi untuk seluruh laporan milik satu mahasiswa.
 *
 * Pembacaan riwayat tidak dapat disaring langsung berdasarkan pemiliknya,
 * karena entitas riwayat menyimpan id_laporan dan bukan uid pemilik. Karena
 * itu pemanggil menyediakan daftar id laporan miliknya, dan kueri dipecah per
 * sepuluh id mengikuti batas operator `in` pada Firestore.
 */
export async function listNotifications(
  idLaporanMilik: readonly string[],
): Promise<ReportNotification[]> {
  if (!isFirebaseConfigured()) throw new NotificationNotConfiguredError()
  if (idLaporanMilik.length === 0) return []

  const potongan: string[][] = []
  for (let i = 0; i < idLaporanMilik.length; i += 10) {
    potongan.push([...idLaporanMilik.slice(i, i + 10)])
  }

  const hasil = await Promise.all(
    potongan.map((sebagian) =>
      getDocs(query(collection(db, RIWAYAT_COLLECTION), where('id_laporan', 'in', sebagian))),
    ),
  )

  return (
    hasil
      .flatMap((kumpulan) => kumpulan.docs)
      .map((snapshot) => toNotification(snapshot.id, snapshot.data()))
      .filter((notifikasi): notifikasi is ReportNotification => notifikasi !== undefined)
      // Catatan pertama setiap laporan adalah pengirimannya sendiri, dan
      // memberitahu mahasiswa tentang tindakannya sendiri tidak berguna.
      .filter((notifikasi) => notifikasi.status !== 'Diterima' || notifikasi.keterangan !== '')
      .sort((kiri, kanan) => (kanan.waktu?.getTime() ?? 0) - (kiri.waktu?.getTime() ?? 0))
  )
}

/**
 * Menandai satu notifikasi sudah dibaca.
 *
 * Hanya field dibaca_pada yang diubah, dan aturan keamanan menolak perubahan
 * field lain pada dokumen riwayat, sehingga penandaan ini tidak dapat dipakai
 * menyunting isi riwayat.
 */
export async function markNotificationRead(idRiwayat: string): Promise<void> {
  if (!isFirebaseConfigured()) throw new NotificationNotConfiguredError()

  await updateDoc(doc(db, RIWAYAT_COLLECTION, idRiwayat), {
    dibaca_pada: serverTimestamp(),
  })
}

/** Menandai sekumpulan notifikasi sudah dibaca sekaligus. */
export async function markAllNotificationsRead(idRiwayat: readonly string[]): Promise<void> {
  await Promise.all(idRiwayat.map((id) => markNotificationRead(id)))
}

/** Kalimat notifikasi yang ditampilkan kepada mahasiswa. */
export function notificationMessage(
  notifikasi: ReportNotification,
  nomorLaporan: string | undefined,
): string {
  const nomor = nomorLaporan ?? 'Laporan'

  return notifikasi.keterangan !== ''
    ? `${nomor}: ${notifikasi.keterangan}`
    : `Status ${nomor} diperbarui menjadi ${notifikasi.status}.`
}

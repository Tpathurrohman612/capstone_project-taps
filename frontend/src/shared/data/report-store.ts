import type { HistoryReport } from '../types/history-report'
import type { WorkflowReport } from '../types/workflow'
import type { ReportStatus, StatusActor } from '../domain/report-status'
import { isFirebaseConfigured } from '../lib/firebase'
import { getWorkflowReports, saveWorkflowReports } from '../lib/workflow-storage'
import { formToLaporanBaru, laporanToWorkflowReport } from './report-mapper'
import { listNotifications } from './notification-repository'
import { formatIndonesianDateTime } from '../lib/date-time'
import type { Penanganan } from './laporan-repository'
import {
  createLaporan,
  listLampiran,
  listPenanganan,
  listLaporanMilik,
  listSemuaLaporan,
  ubahStatusLaporan,
} from './laporan-repository'

/**
 * Satu pintu penyimpanan laporan bagi seluruh layar.
 *
 * Aplikasi berjalan dalam dua mode. Saat Firebase terkonfigurasi, laporan
 * tersimpan di Cloud Firestore sehingga bertahan dan terlihat oleh
 * Administrator pada perangkat lain. Saat belum, laporan tersimpan di
 * sessionStorage seperti pada prototipe, supaya anggota tim tanpa kredensial
 * tetap dapat menjalankan aplikasi.
 *
 * Layar tidak perlu mengetahui mode mana yang aktif. Sebelumnya setiap layar
 * memanggil sessionStorage secara langsung, sehingga laporan tidak pernah
 * sampai ke Firestore meskipun lapisan datanya sudah siap.
 */

export type ReportInput = {
  judul: string
  kategori: string
  course: string
  kelas: string
  tutor: string
  jenisMataKuliah?: string
  durasi?: string
  deskripsi?: string
  prodi?: string
  fakultas?: string
  attachments?: { name: string; type: string; size: string; data?: string }[]
}

export const usingFirestore = (): boolean => isFirebaseConfigured()

/** Membaca laporan milik satu pengguna. */
export async function fetchMyReports(ownerKey: string | undefined): Promise<WorkflowReport[]> {
  if (ownerKey === undefined || ownerKey === '') return []

  if (usingFirestore()) {
    const laporan = await listLaporanMilik(ownerKey)
    return laporan.map(laporanToWorkflowReport)
  }

  return getWorkflowReports().filter((report) => report.studentNim === ownerKey)
}

/** Membaca seluruh laporan. Hanya berhasil bila pemanggil Administrator. */
export async function fetchAllReports(): Promise<WorkflowReport[]> {
  if (usingFirestore()) {
    const laporan = await listSemuaLaporan()
    return laporan.map(laporanToWorkflowReport)
  }

  return getWorkflowReports()
}

/**
 * Menyimpan laporan baru dan mengembalikan nomor laporannya.
 *
 * Pada mode Firestore, nomor dan status awal ditentukan di dalam transaksi
 * lapisan data, bukan di sini, sehingga dua pengiriman bersamaan tidak
 * memperoleh nomor yang sama.
 */
export async function submitReport(params: {
  ownerKey: string
  input: ReportInput
}): Promise<string> {
  if (usingFirestore()) {
    const hasil = await createLaporan({
      uid: params.ownerKey,
      data: formToLaporanBaru(params.input),
      lampiran: (params.input.attachments ?? []).map((berkas) => ({
        nama_file: berkas.name,
        tipe_file: berkas.type,
        ukuran_file: berkas.size,
        ...(berkas.data ? { isi_base64: berkas.data } : {}),
      })),
    })
    return hasil.nomor_laporan
  }

  // Jalur prototipe. Penomoran memakai nomor tertinggi yang tersimpan, bukan
  // jumlah data, supaya laporan yang terhapus tidak membuat nomor terulang.
  const tersimpan = getWorkflowReports()
  const tertinggi = tersimpan.reduce((tinggi, report) => {
    const cocok = /^LT-(\d{4})-(\d{4})$/.exec(report.id)
    return cocok ? Math.max(tinggi, Number(cocok[2])) : tinggi
  }, 0)

  const tahun = new Date().getFullYear()
  const nomor = `LT-${tahun}-${String(tertinggi + 1).padStart(4, '0')}`
  const { kode, nama } = pisahMataKuliah(params.input.course)

  const baru: WorkflowReport = {
    id: nomor,
    studentNim: params.ownerKey,
    title: params.input.judul,
    category: params.input.kategori,
    course: [kode, nama].filter(Boolean).join(' · '),
    className: params.input.kelas,
    tutor: params.input.tutor,
    submitted: new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
    status: 'Diterima',
    updates: [],
    ...(params.input.jenisMataKuliah ? { courseType: params.input.jenisMataKuliah } : {}),
    ...(params.input.fakultas ? { studentFaculty: params.input.fakultas } : {}),
    ...(params.input.durasi ? { duration: params.input.durasi } : {}),
    ...(params.input.deskripsi ? { description: params.input.deskripsi } : {}),
    ...(params.input.attachments ? { attachments: params.input.attachments } : {}),
  }

  saveWorkflowReports([...tersimpan, baru])
  return nomor
}

const pisahMataKuliah = (course: string) => {
  const pisah = course.split(' · ')
  return pisah.length < 2
    ? { kode: '', nama: course.trim() }
    : { kode: pisah[0]?.trim() ?? '', nama: pisah.slice(1).join(' · ').trim() }
}

/** Memindahkan status laporan mengikuti Tabel 4.2. */
export async function changeReportStatus(params: {
  docId: string | undefined
  reportNumber: string
  ke: ReportStatus
  oleh: StatusActor
  uidPencatat: string
  keterangan?: string
  data?: Record<string, unknown>
}): Promise<void> {
  if (usingFirestore()) {
    if (!params.docId) {
      throw new Error(
        'Laporan ini belum tersimpan di basis data, sehingga status belum dapat diubah.',
      )
    }

    await ubahStatusLaporan({
      idLaporan: params.docId,
      ke: params.ke,
      oleh: params.oleh,
      uidPencatat: params.uidPencatat,
      ...(params.keterangan ? { keterangan: params.keterangan } : {}),
      ...(params.data ? { data: params.data } : {}),
    })
    return
  }

  const tersimpan = getWorkflowReports()
  const target = tersimpan.find((report) => report.id === params.reportNumber)
  if (!target) throw new Error('Laporan tidak ditemukan.')

  target.status = params.ke
  saveWorkflowReports(tersimpan)
}

/** Catatan penanganan satu laporan, kosong pada mode prototipe. */
export async function fetchPenanganan(report: WorkflowReport | undefined): Promise<Penanganan> {
  const kosong: Penanganan = { pengiriman: [], validasi: [], tindakLanjut: [] }

  if (!report || !usingFirestore() || !report.docId) return kosong

  return await listPenanganan(report.docId)
}

/**
 * Riwayat perubahan status satu laporan.
 *
 * Riwayat tidak ikut dibaca bersama daftar laporan, karena daftar hanya
 * memerlukan status terkininya dan menarik seluruh riwayat setiap kali daftar
 * dibuka akan menggandakan biaya pembacaan tanpa ada yang memakainya.
 */
export async function fetchReportUpdates(
  report: WorkflowReport | undefined,
): Promise<WorkflowReport['updates']> {
  if (!report) return []

  if (usingFirestore()) {
    if (!report.docId) return []

    const riwayat = await listNotifications([report.docId])

    return riwayat.map((catatan) => ({
      time: catatan.waktu ? formatIndonesianDateTime(catatan.waktu) : 'Belum ada catatan waktu',
      title: `Status menjadi ${catatan.status}`,
      text: catatan.keterangan || `Laporan berpindah ke status ${catatan.status}.`,
    }))
  }

  return report.updates
}

/**
 * Bukti pendukung milik satu laporan.
 *
 * Pada mode prototipe, lampiran menempel pada laporannya di sessionStorage.
 * Pada mode Firestore, lampiran berada pada koleksi tersendiri sesuai ERD,
 * sehingga dibaca terpisah dan hanya saat halaman detail dibuka.
 */
export async function fetchAttachments(
  report: WorkflowReport | undefined,
): Promise<{ name: string; type: string; size?: string; url?: string }[]> {
  if (!report) return []

  if (usingFirestore()) {
    if (!report.docId) return []
    const lampiran = await listLampiran(report.docId)
    return lampiran.map((berkas) => ({
      name: berkas.nama_file,
      type: berkas.tipe_file,
      ...(berkas.ukuran_file ? { size: berkas.ukuran_file } : {}),
      // Isi berkas disimpan sebagai data URL di dalam dokumennya sendiri,
      // sehingga dapat langsung dipakai sebagai alamat tanpa Cloud Storage.
      // path_storage dipakai lebih dulu bila kelak berkas pindah ke Storage.
      ...(berkas.path_storage
        ? { url: berkas.path_storage }
        : berkas.isi_base64
          ? { url: berkas.isi_base64 }
          : {}),
    }))
  }

  return report.attachments ?? []
}

/** Mengubah laporan menjadi bentuk riwayat yang dipakai layar mahasiswa. */
export function toHistoryReport(report: WorkflowReport): HistoryReport {
  return {
    id: report.id,
    title: report.title,
    status: report.status,
    category: report.category,
    courseType: report.courseType ?? 'Teori/Umum',
    course: report.course,
    className: report.className,
    tutor: report.tutor,
    submitted: report.submitted,
    duration: report.duration ?? '1 minggu atau lebih',
    ...(report.description !== undefined ? { description: report.description } : {}),
    ...(report.attachments !== undefined ? { attachments: report.attachments } : {}),
  }
}

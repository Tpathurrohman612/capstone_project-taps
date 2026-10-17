import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import {
  checkTransition,
  isReportStatus,
  type ReportStatus,
  type StatusActor,
} from '../domain/report-status'
import { isReportNumber, nextReportNumber, parseReportNumber } from '../domain/report-number'

/**
 * Akses data laporan di Cloud Firestore.
 *
 * Nama koleksi dan field mengikuti ERD pada Gambar 3.3, bukan penamaan
 * antarmuka, supaya dokumen dan basis data dapat dibandingkan langsung.
 * Lapisan ini tidak mengenal komponen React; seluruh aturan status diambil
 * dari shared/domain/report-status.ts.
 */

export const LAPORAN_COLLECTION = 'laporan'
export const RIWAYAT_COLLECTION = 'riwayat_status_laporan'

export class LaporanNotConfiguredError extends Error {
  constructor() {
    super('Firebase belum dikonfigurasi, laporan tidak dapat dibaca atau disimpan.')
    this.name = 'LaporanNotConfiguredError'
  }
}

export class TransitionNotAllowedError extends Error {
  constructor(alasan: string) {
    super(alasan)
    this.name = 'TransitionNotAllowedError'
  }
}

/** Satu laporan sebagaimana tersimpan, memakai penamaan ERD. */
export type Laporan = {
  id_laporan: string
  nomor_laporan: string
  uid_pelapor: string
  id_kategori: string
  id_status: ReportStatus
  nama_tutor: string
  judul_laporan: string
  deskripsi?: string
  jenis_mata_kuliah?: string
  kode_mata_kuliah?: string
  nama_mata_kuliah?: string
  kelas_mata_kuliah?: string
  perkiraan_durasi?: string
  prodi_pelapor?: string
  fakultas_pelapor?: string
  tanggal_laporan: Date
  tanggal_diperbarui?: Date
}

export type LaporanBaru = Omit<
  Laporan,
  'id_laporan' | 'nomor_laporan' | 'id_status' | 'tanggal_laporan' | 'tanggal_diperbarui'
>

const pastikanSiap = () => {
  if (!isFirebaseConfigured()) throw new LaporanNotConfiguredError()
}

const keDate = (nilai: unknown): Date | undefined => {
  if (nilai instanceof Timestamp) return nilai.toDate()
  if (nilai instanceof Date) return nilai
  return undefined
}

const teksOpsional = (nilai: unknown): string | undefined =>
  typeof nilai === 'string' && nilai !== '' ? nilai : undefined

/**
 * Mengubah dokumen Firestore menjadi Laporan.
 *
 * Dokumen yang kehilangan field wajib atau berstatus tidak dikenal
 * dikembalikan sebagai undefined, bukan dipaksa menjadi objek setengah jadi.
 * Pemanggil menyaringnya, sehingga satu dokumen rusak tidak merusak daftar.
 */
export function toLaporan(id: string, data: DocumentData): Laporan | undefined {
  if (
    typeof data.nomor_laporan !== 'string' ||
    typeof data.uid_pelapor !== 'string' ||
    typeof data.judul_laporan !== 'string' ||
    !isReportStatus(data.id_status)
  ) {
    return undefined
  }

  const tanggal = keDate(data.tanggal_laporan)
  if (!tanggal) return undefined

  const hasil: Laporan = {
    id_laporan: id,
    nomor_laporan: data.nomor_laporan,
    uid_pelapor: data.uid_pelapor,
    id_kategori: typeof data.id_kategori === 'string' ? data.id_kategori : '',
    id_status: data.id_status,
    nama_tutor: typeof data.nama_tutor === 'string' ? data.nama_tutor : '',
    judul_laporan: data.judul_laporan,
    tanggal_laporan: tanggal,
  }

  const opsional: [keyof Laporan, string | undefined][] = [
    ['deskripsi', teksOpsional(data.deskripsi)],
    ['jenis_mata_kuliah', teksOpsional(data.jenis_mata_kuliah)],
    ['kode_mata_kuliah', teksOpsional(data.kode_mata_kuliah)],
    ['nama_mata_kuliah', teksOpsional(data.nama_mata_kuliah)],
    ['kelas_mata_kuliah', teksOpsional(data.kelas_mata_kuliah)],
    ['perkiraan_durasi', teksOpsional(data.perkiraan_durasi)],
    ['prodi_pelapor', teksOpsional(data.prodi_pelapor)],
    ['fakultas_pelapor', teksOpsional(data.fakultas_pelapor)],
  ]

  for (const [kunci, nilai] of opsional) {
    if (nilai !== undefined) Object.assign(hasil, { [kunci]: nilai })
  }

  const diperbarui = keDate(data.tanggal_diperbarui)
  if (diperbarui) hasil.tanggal_diperbarui = diperbarui

  return hasil
}

/**
 * Membaca laporan milik satu mahasiswa.
 *
 * Penyaring uid_pelapor bukan sekadar kenyamanan: firestore.rules menolak
 * kueri yang tidak dapat dibuktikan hanya menyentuh laporan milik pemanggil,
 * sehingga menghapus penyaring ini membuat kueri gagal, bukan mengembalikan
 * laporan orang lain.
 */
export async function listLaporanMilik(uid: string): Promise<Laporan[]> {
  pastikanSiap()

  const hasil = await getDocs(
    query(
      collection(db, LAPORAN_COLLECTION),
      where('uid_pelapor', '==', uid),
      orderBy('tanggal_laporan', 'desc'),
    ),
  )

  return hasil.docs
    .map((snapshot) => toLaporan(snapshot.id, snapshot.data()))
    .filter((laporan): laporan is Laporan => laporan !== undefined)
}

/** Membaca seluruh laporan. Hanya berhasil bila pemanggil Administrator. */
export async function listSemuaLaporan(): Promise<Laporan[]> {
  pastikanSiap()

  const hasil = await getDocs(
    query(collection(db, LAPORAN_COLLECTION), orderBy('tanggal_laporan', 'desc')),
  )

  return hasil.docs
    .map((snapshot) => toLaporan(snapshot.id, snapshot.data()))
    .filter((laporan): laporan is Laporan => laporan !== undefined)
}

export async function getLaporan(idLaporan: string): Promise<Laporan | undefined> {
  pastikanSiap()

  const snapshot = await getDoc(doc(db, LAPORAN_COLLECTION, idLaporan))
  if (!snapshot.exists()) return undefined

  return toLaporan(snapshot.id, snapshot.data())
}

/**
 * Menentukan nomor laporan berikutnya untuk satu tahun.
 *
 * Mengambil satu nomor tertinggi pada tahun berjalan, bukan seluruh laporan,
 * supaya biaya pembacaan tidak tumbuh seiring jumlah laporan.
 */
async function nomorBerikutnya(tahun: number): Promise<string> {
  const batasBawah = `LT-${tahun}-0000`
  const batasAtas = `LT-${tahun}-9999`

  const hasil = await getDocs(
    query(
      collection(db, LAPORAN_COLLECTION),
      where('nomor_laporan', '>=', batasBawah),
      where('nomor_laporan', '<=', batasAtas),
      orderBy('nomor_laporan', 'desc'),
      limit(1),
    ),
  )

  const tertinggi = hasil.docs[0]?.data().nomor_laporan
  return nextReportNumber(isReportNumber(tertinggi) ? [tertinggi] : [], tahun)
}

/**
 * Membuat laporan baru beserta catatan riwayat pertamanya.
 *
 * Status awal selalu Diterima sesuai baris pertama Tabel 4.2, dan hal itu
 * ditegakkan pula oleh firestore.rules sehingga tidak bergantung pada kode di
 * peramban. Penomoran dan penulisan dijalankan dalam satu transaksi agar dua
 * pengiriman bersamaan tidak memperoleh nomor yang sama.
 */
export async function createLaporan(params: {
  uid: string
  data: LaporanBaru
  sekarang?: Date
}): Promise<Laporan> {
  pastikanSiap()

  const sekarang = params.sekarang ?? new Date()
  const tahun = sekarang.getFullYear()
  const nomor = await nomorBerikutnya(tahun)

  const laporanRef = doc(collection(db, LAPORAN_COLLECTION))
  const riwayatRef = doc(collection(db, RIWAYAT_COLLECTION))

  await runTransaction(db, async (transaction) => {
    transaction.set(laporanRef, {
      ...params.data,
      nomor_laporan: nomor,
      uid_pelapor: params.uid,
      id_status: 'Diterima' satisfies ReportStatus,
      tanggal_laporan: serverTimestamp(),
      tanggal_diperbarui: serverTimestamp(),
    })

    transaction.set(riwayatRef, {
      id_laporan: laporanRef.id,
      id_status: 'Diterima' satisfies ReportStatus,
      uid_pencatat: params.uid,
      keterangan: 'Laporan dikirim mahasiswa',
      tanggal_riwayat: serverTimestamp(),
    })
  })

  return {
    ...params.data,
    id_laporan: laporanRef.id,
    nomor_laporan: nomor,
    uid_pelapor: params.uid,
    id_status: 'Diterima',
    tanggal_laporan: sekarang,
  }
}

/**
 * Memindahkan laporan ke status berikutnya.
 *
 * Kelayakan diperiksa dua kali dengan sengaja. Pemeriksaan di sini memakai
 * Tabel 4.2 sehingga pesan galatnya jelas dan dapat diuji tanpa jaringan,
 * sedangkan firestore.rules memeriksanya lagi di server supaya tidak dapat
 * dilewati. Pembacaan status terkini dan penulisannya berada dalam satu
 * transaksi, agar dua Administrator yang menekan tombol bersamaan tidak dapat
 * memindahkan laporan dua langkah sekaligus.
 */
export async function ubahStatusLaporan(params: {
  idLaporan: string
  ke: ReportStatus
  oleh: StatusActor
  uidPencatat: string
  keterangan?: string
  data?: Record<string, unknown>
}): Promise<ReportStatus> {
  pastikanSiap()

  const laporanRef = doc(db, LAPORAN_COLLECTION, params.idLaporan)
  const riwayatRef = doc(collection(db, RIWAYAT_COLLECTION))

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(laporanRef)

    if (!snapshot.exists()) {
      throw new TransitionNotAllowedError('Laporan tidak ditemukan.')
    }

    const sekarang = snapshot.data().id_status

    if (!isReportStatus(sekarang)) {
      throw new TransitionNotAllowedError(
        `Status tersimpan "${String(sekarang)}" tidak dikenal, sehingga perpindahan dihentikan.`,
      )
    }

    const pemeriksaan = checkTransition({
      dari: sekarang,
      ke: params.ke,
      oleh: params.oleh,
      ...(params.data ? { data: params.data } : {}),
    })

    if (!pemeriksaan.diizinkan) {
      throw new TransitionNotAllowedError(pemeriksaan.alasan)
    }

    transaction.update(laporanRef, {
      id_status: params.ke,
      tanggal_diperbarui: serverTimestamp(),
    })

    transaction.set(riwayatRef, {
      id_laporan: params.idLaporan,
      id_status: params.ke,
      uid_pencatat: params.uidPencatat,
      keterangan: params.keterangan ?? pemeriksaan.transisi.keterangan,
      tanggal_riwayat: serverTimestamp(),
    })
  })

  return params.ke
}

/** Tahun pada satu nomor laporan, untuk pengelompokan dan pelaporan. */
export const tahunLaporan = (nomor: string): number | undefined => parseReportNumber(nomor)?.tahun

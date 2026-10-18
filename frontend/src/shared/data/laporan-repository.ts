import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
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
import { formatReportNumber, parseReportNumber } from '../domain/report-number'

/**
 * Akses data laporan di Cloud Firestore.
 *
 * Nama koleksi dan field mengikuti ERD pada Gambar 3.3, bukan penamaan
 * antarmuka, supaya dokumen dan basis data dapat dibandingkan langsung.
 * Lapisan ini tidak mengenal komponen React; seluruh aturan status diambil
 * dari shared/domain/report-status.ts.
 */

export const LAPORAN_COLLECTION = 'laporan'
export const LAMPIRAN_COLLECTION = 'lampiran'
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

/**
 * Data laporan yang berasal dari formulir.
 *
 * `uid_pelapor`, `nomor_laporan`, `id_status`, dan kedua tanggal sengaja tidak
 * termasuk: seluruhnya ditentukan lapisan data dari sesi yang sedang masuk dan
 * dari transaksi penomoran, bukan dari apa pun yang dikirim layar.
 */
/**
 * Keterangan satu berkas bukti pendukung.
 *
 * Hanya metadata yang disimpan. Mengunggah berkasnya sendiri memerlukan Cloud
 * Storage, yang tidak tersedia pada paket Spark, sehingga path_storage
 * dibiarkan kosong sampai paket dinaikkan. Menyimpan metadata lebih dulu
 * membuat daftar bukti tetap benar dan tidak perlu dibangun ulang nanti.
 */
export type LampiranBaru = {
  nama_file: string
  tipe_file: string
  ukuran_file?: string
  /**
   * Isi berkas sebagai data URL base64.
   *
   * Cloud Storage memerlukan paket berbayar, sehingga bukti pendukung
   * disimpan langsung di dalam dokumennya. Gambar dimampatkan lebih dulu agar
   * muat dalam batas satu megabyte per dokumen Firestore.
   */
  isi_base64?: string
}

export type Lampiran = LampiranBaru & {
  id_lampiran: string
  id_laporan: string
  /**
   * Alamat berkas pada Cloud Storage. Kosong selama paket Spark dipakai,
   * karena Cloud Storage memerlukan Blaze dan hanya metadata yang disimpan.
   */
  path_storage?: string
}

export type LaporanBaru = Omit<
  Laporan,
  | 'id_laporan'
  | 'nomor_laporan'
  | 'uid_pelapor'
  | 'id_status'
  | 'tanggal_laporan'
  | 'tanggal_diperbarui'
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

  // Penyaring dan pengurutan pada field berbeda menuntut composite index di
  // Firestore, dan tanpa indeks itu kueri gagal seluruhnya. Pengurutan karena
  // itu dilakukan setelah data diterima: jumlah laporan per mahasiswa kecil,
  // dan menghindari indeks membuat penyiapan proyek tidak menyimpan jebakan
  // yang baru terasa saat dijalankan.
  const hasil = await getDocs(
    query(collection(db, LAPORAN_COLLECTION), where('uid_pelapor', '==', uid)),
  )

  return hasil.docs
    .map((snapshot) => toLaporan(snapshot.id, snapshot.data()))
    .filter((laporan): laporan is Laporan => laporan !== undefined)
    .sort((kiri, kanan) => kanan.tanggal_laporan.getTime() - kiri.tanggal_laporan.getTime())
}

/** Membaca seluruh laporan. Hanya berhasil bila pemanggil Administrator. */
export async function listSemuaLaporan(): Promise<Laporan[]> {
  pastikanSiap()

  const hasil = await getDocs(collection(db, LAPORAN_COLLECTION))

  return hasil.docs
    .map((snapshot) => toLaporan(snapshot.id, snapshot.data()))
    .filter((laporan): laporan is Laporan => laporan !== undefined)
    .sort((kiri, kanan) => kanan.tanggal_laporan.getTime() - kiri.tanggal_laporan.getTime())
}

export async function getLaporan(idLaporan: string): Promise<Laporan | undefined> {
  pastikanSiap()

  const snapshot = await getDoc(doc(db, LAPORAN_COLLECTION, idLaporan))
  if (!snapshot.exists()) return undefined

  return toLaporan(snapshot.id, snapshot.data())
}

export const PENCACAH_COLLECTION = 'pencacah_laporan'
export const PENGIRIMAN_COLLECTION = 'pengiriman_validasi'
export const VALIDASI_COLLECTION = 'validasi'
export const TINDAK_LANJUT_COLLECTION = 'tindak_lanjut'

/**
 * Membuat laporan baru beserta catatan riwayat pertamanya.
 *
 * Status awal selalu Menunggu Pemeriksaan sesuai baris pertama Tabel 4.2, dan hal itu
 * ditegakkan pula oleh firestore.rules sehingga tidak bergantung pada kode di
 * peramban. Penomoran dan penulisan dijalankan dalam satu transaksi agar dua
 * pengiriman bersamaan tidak memperoleh nomor yang sama.
 */
export async function createLaporan(params: {
  uid: string
  data: LaporanBaru
  lampiran?: readonly LampiranBaru[]
  sekarang?: Date
}): Promise<Laporan> {
  pastikanSiap()

  const sekarang = params.sekarang ?? new Date()
  const tahun = sekarang.getFullYear()

  const laporanRef = doc(collection(db, LAPORAN_COLLECTION))
  const riwayatRef = doc(collection(db, RIWAYAT_COLLECTION))
  const pencacahRef = doc(db, PENCACAH_COLLECTION, String(tahun))

  let nomor = ''

  await runTransaction(db, async (transaction) => {
    // Seluruh pembacaan harus mendahului penulisan dalam satu transaksi
    // Firestore, sehingga pencacah dibaca lebih dulu.
    const pencacah = await transaction.get(pencacahRef)
    const terakhir = pencacah.exists() ? pencacah.data().terakhir : 0
    const urutan = (typeof terakhir === 'number' && Number.isInteger(terakhir) ? terakhir : 0) + 1

    nomor = formatReportNumber(tahun, urutan)

    // Menulis nilai utuh, bukan increment(), supaya aturan keamanan dapat
    // membuktikan kenaikannya tepat satu. increment() tidak dapat diperiksa
    // aturan karena nilainya baru dihitung server setelah aturan berjalan.
    transaction.set(pencacahRef, { terakhir: urutan })

    transaction.set(laporanRef, {
      ...params.data,
      nomor_laporan: nomor,
      uid_pelapor: params.uid,
      id_status: 'Menunggu Pemeriksaan' satisfies ReportStatus,
      tanggal_laporan: serverTimestamp(),
      tanggal_diperbarui: serverTimestamp(),
    })

    transaction.set(riwayatRef, {
      id_laporan: laporanRef.id,
      id_status: 'Menunggu Pemeriksaan' satisfies ReportStatus,
      uid_pencatat: params.uid,
      keterangan: 'Laporan dikirim mahasiswa',
      tanggal_riwayat: serverTimestamp(),
    })

    // Bukti pendukung ditulis dalam transaksi yang sama, sehingga laporan
    // tanpa lampirannya tidak mungkin tersimpan sebagian.
    for (const berkas of params.lampiran ?? []) {
      transaction.set(doc(collection(db, LAMPIRAN_COLLECTION)), {
        id_laporan: laporanRef.id,
        nama_file: berkas.nama_file,
        tipe_file: berkas.tipe_file,
        ...(berkas.ukuran_file ? { ukuran_file: berkas.ukuran_file } : {}),
        ...(berkas.isi_base64 ? { isi_base64: berkas.isi_base64 } : {}),
        path_storage: '',
        tanggal_upload: serverTimestamp(),
      })
    }
  })

  return {
    ...params.data,
    id_laporan: laporanRef.id,
    nomor_laporan: nomor,
    uid_pelapor: params.uid,
    id_status: 'Menunggu Pemeriksaan',
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

    // Entitas penanganan pada ERD Gambar 3.3 ditulis bersama perpindahan
    // statusnya, di dalam transaksi yang sama. Riwayat mencatat bahwa status
    // berpindah; entitas inilah yang menyimpan rinciannya, dan tanpa itu
    // keterangan penanganan hanya hidup sebagai kalimat di dalam riwayat.
    const data = params.data ?? {}
    const teks = (kunci: string): string =>
      typeof data[kunci] === 'string' ? (data[kunci] as string) : ''

    if (params.ke === 'Diteruskan ke Fakultas') {
      transaction.set(doc(collection(db, PENGIRIMAN_COLLECTION)), {
        id_laporan: params.idLaporan,
        uid_pengirim: params.uidPencatat,
        unit_tujuan: teks('unit_tujuan'),
        kanal_pengiriman: teks('kanal_pengiriman'),
        ...(teks('catatan') ? { catatan: teks('catatan') } : {}),
        tanggal_kirim: serverTimestamp(),
      })
    }

    if (params.ke === 'Ditindaklanjuti') {
      transaction.set(doc(collection(db, VALIDASI_COLLECTION)), {
        id_laporan: params.idLaporan,
        uid_pencatat: params.uidPencatat,
        unit_validator: teks('unit_validator'),
        hasil_validasi: teks('hasil_validasi'),
        ...(teks('catatan_validasi') ? { keterangan: teks('catatan_validasi') } : {}),
        tanggal_validasi: serverTimestamp(),
      })
    }

    if (params.ke === 'Selesai') {
      transaction.set(doc(collection(db, TINDAK_LANJUT_COLLECTION)), {
        id_laporan: params.idLaporan,
        uid_pencatat: params.uidPencatat,
        keterangan: teks('tindak_lanjut'),
        tanggal_tindak_lanjut: serverTimestamp(),
      })
    }
  })

  return params.ke
}

/** Membaca bukti pendukung milik satu laporan. */
export async function listLampiran(idLaporan: string): Promise<Lampiran[]> {
  pastikanSiap()

  const hasil = await getDocs(
    query(collection(db, LAMPIRAN_COLLECTION), where('id_laporan', '==', idLaporan)),
  )

  return hasil.docs
    .map((snapshot) => {
      const data = snapshot.data()
      if (typeof data.nama_file !== 'string' || data.nama_file === '') return undefined

      return {
        id_lampiran: snapshot.id,
        id_laporan: idLaporan,
        nama_file: data.nama_file,
        tipe_file: typeof data.tipe_file === 'string' ? data.tipe_file : 'FILE',
        ...(typeof data.ukuran_file === 'string' ? { ukuran_file: data.ukuran_file } : {}),
        ...(typeof data.path_storage === 'string' && data.path_storage !== ''
          ? { path_storage: data.path_storage }
          : {}),
        ...(typeof data.isi_base64 === 'string' && data.isi_base64 !== ''
          ? { isi_base64: data.isi_base64 }
          : {}),
      } satisfies Lampiran
    })
    .filter((berkas): berkas is Lampiran => berkas !== undefined)
}

/**
 * Menambahkan lampiran pada laporan yang sudah ada.
 *
 * Dipakai ketika mahasiswa melengkapi laporan yang diminta Administrator.
 * Aturan keamanan hanya mengizinkannya bila laporan induknya memang milik
 * yang menulis, sehingga pemeriksaan kepemilikannya terjadi di server.
 */
export async function tambahLampiran(idLaporan: string, lampiran: LampiranBaru[]): Promise<void> {
  pastikanSiap()

  if (lampiran.length === 0) return

  const tulis = writeBatch(db)
  for (const berkas of lampiran) {
    tulis.set(doc(collection(db, LAMPIRAN_COLLECTION)), {
      id_laporan: idLaporan,
      ...berkas,
      tanggal_upload: serverTimestamp(),
    })
  }

  await tulis.commit()
}

/** Catatan penanganan satu laporan, sesuai entitas pada ERD Gambar 3.3. */
export type Penanganan = {
  pengiriman: { unit_tujuan: string; kanal_pengiriman: string; tanggal?: Date }[]
  validasi: {
    hasil_validasi: string
    unit_validator: string
    keterangan?: string
    tanggal?: Date
  }[]
  tindakLanjut: { keterangan: string; tanggal?: Date }[]
}

/**
 * Membaca catatan penanganan satu laporan.
 *
 * Riwayat status menjawab kapan laporan berpindah; entitas inilah yang
 * menjawab apa hasilnya. Keduanya dibaca terpisah karena hanya halaman detail
 * yang memerlukannya.
 */
export async function listPenanganan(idLaporan: string): Promise<Penanganan> {
  pastikanSiap()

  const ambil = async (koleksi: string) =>
    (await getDocs(query(collection(db, koleksi), where('id_laporan', '==', idLaporan)))).docs

  const [kirim, nilai, tindak] = await Promise.all([
    ambil(PENGIRIMAN_COLLECTION),
    ambil(VALIDASI_COLLECTION),
    ambil(TINDAK_LANJUT_COLLECTION),
  ])

  const teks = (nilai: unknown): string => (typeof nilai === 'string' ? nilai : '')

  return {
    pengiriman: kirim.map((d) => {
      const data = d.data()
      const tanggal = keDate(data.tanggal_kirim)
      return {
        unit_tujuan: teks(data.unit_tujuan),
        kanal_pengiriman: teks(data.kanal_pengiriman),
        ...(tanggal ? { tanggal } : {}),
      }
    }),
    validasi: nilai.map((d) => {
      const data = d.data()
      const tanggal = keDate(data.tanggal_validasi)
      return {
        hasil_validasi: teks(data.hasil_validasi),
        unit_validator: teks(data.unit_validator),
        ...(teks(data.keterangan) ? { keterangan: teks(data.keterangan) } : {}),
        ...(tanggal ? { tanggal } : {}),
      }
    }),
    tindakLanjut: tindak.map((d) => {
      const data = d.data()
      const tanggal = keDate(data.tanggal_tindak_lanjut)
      return {
        keterangan: teks(data.keterangan),
        ...(tanggal ? { tanggal } : {}),
      }
    }),
  }
}

/** Tahun pada satu nomor laporan, untuk pengelompokan dan pelaporan. */
export const tahunLaporan = (nomor: string): number | undefined => parseReportNumber(nomor)?.tahun

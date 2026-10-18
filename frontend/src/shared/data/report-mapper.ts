import type { WorkflowReport } from '../types/workflow'
import type { Laporan, LaporanBaru } from './laporan-repository'
import { formatIndonesianDate } from '../lib/date-time'

/**
 * Penerjemah antara bentuk antarmuka dan bentuk basis data.
 *
 * Antarmuka memakai penamaan yang nyaman dibaca di layar, sedangkan Firestore
 * memakai penamaan ERD Gambar 3.3. Keduanya sengaja tidak disamakan: dokumen
 * perancangan harus dapat dibandingkan langsung dengan isi basis data, dan
 * layar tidak perlu ikut berubah setiap kali nama field berubah.
 *
 * Satu-satunya tempat kedua penamaan itu bertemu adalah berkas ini.
 */

/** Pemisah antara kode dan nama mata kuliah pada tampilan. */
export const COURSE_SEPARATOR = ' · '

/** Memecah "MSIM4301 · Rekayasa Perangkat Lunak" menjadi kode dan nama. */
export function splitCourse(course: string): { kode: string; nama: string } {
  const pisah = course.split(COURSE_SEPARATOR)

  if (pisah.length < 2) {
    // Tanpa pemisah, seluruh teks diperlakukan sebagai nama mata kuliah agar
    // tidak ada informasi yang hilang diam-diam.
    return { kode: '', nama: course.trim() }
  }

  return {
    kode: pisah[0]?.trim() ?? '',
    nama: pisah.slice(1).join(COURSE_SEPARATOR).trim(),
  }
}

/** Menggabungkan kode dan nama mata kuliah untuk ditampilkan. */
export function joinCourse(kode: string | undefined, nama: string | undefined): string {
  const bagian = [kode?.trim(), nama?.trim()].filter(
    (teks): teks is string => teks !== undefined && teks !== '',
  )

  return bagian.join(COURSE_SEPARATOR)
}

/**
 * Mengubah laporan dari basis data menjadi bentuk yang dipakai layar.
 *
 * `updates` sengaja dikosongkan: riwayat status tersimpan pada koleksi
 * tersendiri dan dibaca terpisah, sehingga daftar laporan tidak perlu menarik
 * seluruh riwayat setiap kali dibuka.
 */
export function laporanToWorkflowReport(laporan: Laporan): WorkflowReport {
  const hasil: WorkflowReport = {
    id: laporan.nomor_laporan,
    docId: laporan.id_laporan,
    studentNim: laporan.uid_pelapor,
    title: laporan.judul_laporan,
    category: laporan.id_kategori,
    course: joinCourse(laporan.kode_mata_kuliah, laporan.nama_mata_kuliah),
    className: laporan.kelas_mata_kuliah ?? '',
    tutor: laporan.nama_tutor,
    submitted: formatIndonesianDate(laporan.tanggal_laporan),
    status: laporan.id_status,
    updates: [],
  }

  const opsional: [keyof WorkflowReport, string | undefined][] = [
    ['courseType', laporan.jenis_mata_kuliah],
    ['studentFaculty', laporan.fakultas_pelapor],
    ['duration', laporan.perkiraan_durasi],
    ['description', laporan.deskripsi],
  ]

  for (const [kunci, nilai] of opsional) {
    if (nilai !== undefined && nilai !== '') Object.assign(hasil, { [kunci]: nilai })
  }

  return hasil
}

/**
 * Menyusun data laporan baru untuk disimpan.
 *
 * Nomor laporan, pemilik, status awal, dan tanggal tidak termasuk di sini:
 * keempatnya ditentukan lapisan data di dalam transaksi, bukan oleh layar,
 * supaya tidak ada nomor kembar dan tidak ada laporan yang lahir dengan status
 * selain Menunggu Pemeriksaan.
 */
export function formToLaporanBaru(input: {
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
}): LaporanBaru {
  const { kode, nama } = splitCourse(input.course)

  const hasil: LaporanBaru = {
    id_kategori: input.kategori.trim(),
    nama_tutor: input.tutor.trim(),
    judul_laporan: input.judul.trim(),
  }

  const opsional: [keyof LaporanBaru, string | undefined][] = [
    ['kode_mata_kuliah', kode],
    ['nama_mata_kuliah', nama],
    ['kelas_mata_kuliah', input.kelas.trim()],
    ['jenis_mata_kuliah', input.jenisMataKuliah?.trim()],
    ['perkiraan_durasi', input.durasi?.trim()],
    ['deskripsi', input.deskripsi?.trim()],
    ['prodi_pelapor', input.prodi?.trim()],
    ['fakultas_pelapor', input.fakultas?.trim()],
  ]

  // Field kosong tidak ikut ditulis. Firestore membedakan field yang tidak ada
  // dari field bernilai teks kosong, dan menulis teks kosong membuat dokumen
  // penuh field tak bermakna.
  for (const [kunci, nilai] of opsional) {
    if (nilai !== undefined && nilai !== '') Object.assign(hasil, { [kunci]: nilai })
  }

  return hasil
}

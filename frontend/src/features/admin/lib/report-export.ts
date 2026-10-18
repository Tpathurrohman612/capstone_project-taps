import * as XLSX from 'xlsx'
import type { WorkflowReport } from '../../../shared/types/workflow'
import { splitCourse } from '../../../shared/data/report-mapper'
import { jalurFolderBukti } from './berkas-ekspor'

/**
 * Ekspor data laporan untuk dikirim ke Fakultas/Unit terkait.
 *
 * Subbab 3.5.1 menyebut pengelompokan dan ekspor data sebagai bagian dari
 * penanganan laporan, dan hasil ekspornya dikirim melalui kanal eksternal
 * karena Fakultas/Unit tidak memiliki akses ke dalam sistem.
 *
 * Berkas dihasilkan dalam format Excel karena penerimanya membukanya sebagai
 * lembar kerja, bukan sebagai teks. Berkas CSV sering terbuka berantakan di
 * Excel berpengaturan Indonesia, yang memakai titik koma sebagai pemisah
 * kolom, sehingga seluruh baris menumpuk di satu kolom.
 */

export const EXPORT_HEADERS = [
  'Nomor Laporan',
  'Nama Mahasiswa',
  'NIM',
  'Kategori',
  'Program Studi',
  'Fakultas',
  'Jenis Mata Kuliah',
  'Kode Mata Kuliah',
  'Nama Mata Kuliah',
  'Kelas Mata Kuliah',
  'Nama Tutor',
  'Perkiraan Durasi Tidak Ada Aktivitas/Respons',
  'Judul Laporan',
  'Uraian Permasalahan',
  'Tanggal Laporan',
  'Status',
  'Folder Bukti',
] as const

/** Lebar kolom lembar kerja, dalam satuan karakter. */
const LEBAR_KOLOM = [16, 28, 16, 22, 22, 28, 18, 16, 28, 10, 22, 30, 32, 40, 18, 18, 40]

export type BarisEkspor = (string | number)[]

/** Menyusun satu baris data dari sebuah laporan. */
export function barisLaporan(
  report: WorkflowReport,
  programStudi: string,
  pelapor: { nama: string; nim: string } = { nama: '', nim: '' },
): BarisEkspor {
  const { kode, nama } = splitCourse(report.course)

  return [
    report.id,
    pelapor.nama || '—',
    pelapor.nim || '—',
    report.category || '—',
    programStudi || '—',
    report.studentFaculty ?? '—',
    report.courseType ?? '—',
    kode || '—',
    nama || '—',
    report.className || '—',
    report.tutor || '—',
    report.duration ?? '—',
    report.title,
    report.description ?? '—',
    report.submitted,
    report.status,
    // Menunjuk folder bukti di dalam ZIP yang sama, supaya pembacanya dapat
    // berpindah dari satu baris ke berkas buktinya tanpa menebak.
    jalurFolderBukti({ nomor: report.id, namaPelapor: pelapor.nama }),
  ]
}

/** Menyusun nama berkas yang aman dipakai di seluruh sistem berkas. */
export function namaBerkasEkspor(fakultas: string, tanggal: Date = new Date()): string {
  const bagian = fakultas
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  const tahun = tanggal.getFullYear()
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0')
  const hari = String(tanggal.getDate()).padStart(2, '0')

  return `Data-Laporan-Tutor_${bagian || 'Semua'}_${tahun}${bulan}${hari}.xlsx`
}

/**
 * Membuat lembar kerja Excel dari daftar laporan.
 *
 * Dikembalikan sebagai data mentah, bukan langsung diunduh, agar dapat diuji
 * tanpa peramban dan agar pemanggilnya menentukan sendiri kapan berkas itu
 * diberikan kepada pengguna.
 */
export function buatBukuKerja(baris: readonly BarisEkspor[]): XLSX.WorkBook {
  const lembar = XLSX.utils.aoa_to_sheet([[...EXPORT_HEADERS], ...baris.map((r) => [...r])])

  lembar['!cols'] = LEBAR_KOLOM.map((lebar) => ({ wch: lebar }))
  // Baris tajuk dibekukan supaya nama kolom tetap terlihat saat digulir.
  lembar['!freeze'] = { xSplit: '0', ySplit: '1' }

  const buku = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(buku, lembar, 'Data Laporan')

  return buku
}

/** Mengunduh buku kerja sebagai berkas Excel. */
export function unduhBukuKerja(buku: XLSX.WorkBook, namaBerkas: string): void {
  XLSX.writeFile(buku, namaBerkas, { bookType: 'xlsx', compression: true })
}

/** Buku kerja sebagai bait, untuk dimasukkan ke dalam ZIP alih-alih diunduh. */
export function bukuKerjaKeArrayBuffer(buku: XLSX.WorkBook): ArrayBuffer {
  return XLSX.write(buku, { bookType: 'xlsx', type: 'array', compression: true }) as ArrayBuffer
}

/**
 * Mengunduh berkas apa pun melalui tautan sementara.
 *
 * Objek URL-nya dilepas setelah unduhan dimulai; tanpa itu seluruh isi
 * berkasnya tertahan di memori sampai halaman ditutup, dan berkas ekspor
 * dapat berukuran puluhan megabait.
 */
export function unduhBlob(isi: Blob, namaBerkas: string): void {
  const url = URL.createObjectURL(isi)
  const tautan = document.createElement('a')

  tautan.href = url
  tautan.download = namaBerkas
  document.body.append(tautan)
  tautan.click()
  tautan.remove()

  URL.revokeObjectURL(url)
}

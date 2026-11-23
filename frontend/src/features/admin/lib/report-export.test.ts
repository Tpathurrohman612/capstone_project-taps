import * as XLSX from 'xlsx'
import { describe, expect, it } from 'vitest'
import type { WorkflowReport } from '../../../shared/types/workflow'
import { barisLaporan, buatBukuKerja, EXPORT_HEADERS, namaBerkasEkspor } from './report-export'

/**
 * Ekspor data laporan untuk Fakultas/Unit terkait.
 *
 * Berkas inilah satu-satunya yang dilihat pihak di luar sistem, sehingga
 * kolom yang tertukar atau nilai yang hilang tidak akan ketahuan dari dalam
 * aplikasi. Karena itu isinya diperiksa dengan membaca kembali lembar kerja
 * yang dihasilkan, bukan sekadar memastikan fungsinya berjalan.
 */

const laporan = (ubah: Partial<WorkflowReport> = {}): WorkflowReport => ({
  id: 'LT-2026-0007',
  studentNim: 'uid-mahasiswa',
  title: 'Tugas 1 belum dinilai',
  category: 'Aktivitas tutor',
  course: 'MSIM4301 · Rekayasa Perangkat Lunak',
  className: '01',
  tutor: 'Budi Santoso',
  submitted: '18 Oktober 2026',
  status: 'Lolos Pemeriksaan',
  updates: [],
  courseType: 'Teori/Umum',
  studentFaculty: 'Fakultas Sains dan Teknologi',
  duration: '1 minggu atau lebih',
  description: 'Sudah minggu keenam dan nilai belum keluar.',
  ...ubah,
})

/** Membaca kembali buku kerja menjadi larik baris, seperti yang akan dibuka penerima. */
function bacaKembali(baris: (string | number)[][]): string[][] {
  const buku = buatBukuKerja(baris)
  const lembar = buku.Sheets[buku.SheetNames[0] as string]

  return XLSX.utils.sheet_to_json<string[]>(lembar as XLSX.WorkSheet, {
    header: 1,
    defval: '',
    raw: false,
  })
}

describe('barisLaporan', () => {
  it('menghasilkan nilai sebanyak kolom tajuknya', () => {
    // Jumlah yang tidak sama membuat seluruh kolom bergeser tanpa ada yang
    // mengeluh, dan penerima membaca nilai di bawah nama kolom yang keliru.
    expect(barisLaporan(laporan(), 'Sistem Informasi')).toHaveLength(EXPORT_HEADERS.length)
  })

  it('memecah mata kuliah menjadi kode dan nama pada kolom terpisah', () => {
    const baris = barisLaporan(laporan(), 'Sistem Informasi')

    expect(baris[EXPORT_HEADERS.indexOf('Kode Mata Kuliah')]).toBe('MSIM4301')
    expect(baris[EXPORT_HEADERS.indexOf('Nama Mata Kuliah')]).toBe('Rekayasa Perangkat Lunak')
  })

  it('memakai nomor laporan yang dikenal pengguna', () => {
    expect(barisLaporan(laporan(), 'Sistem Informasi')[0]).toBe('LT-2026-0007')
  })

  it('menulis tanda pisah untuk nilai yang tidak ada, bukan teks kosong', () => {
    // Sel kosong pada lembar kerja sulit dibedakan dari sel yang terlewat
    // diisi, sedangkan tanda pisah menyatakan datanya memang tidak ada.
    const baris = barisLaporan(
      laporan({ courseType: undefined, duration: undefined, description: undefined }),
      '',
    )

    expect(baris[EXPORT_HEADERS.indexOf('Jenis Mata Kuliah')]).toBe('—')
    expect(baris[EXPORT_HEADERS.indexOf('Program Studi')]).toBe('—')
    expect(baris[EXPORT_HEADERS.indexOf('Uraian Permasalahan')]).toBe('—')
  })

  it('memakai fakultas pelapor, bukan fakultas yang diturunkan dari kode mata kuliah', () => {
    // Mahasiswa dapat mengambil mata kuliah lintas fakultas, sehingga kode
    // mata kuliah tidak boleh menentukan fakultas pelapornya.
    const baris = barisLaporan(
      laporan({ course: 'EKMA4111 · Pengantar Bisnis' }),
      'Sistem Informasi',
    )

    expect(baris[EXPORT_HEADERS.indexOf('Fakultas')]).toBe('Fakultas Sains dan Teknologi')
  })
})

describe('buatBukuKerja', () => {
  it('menulis baris tajuk lebih dulu', () => {
    const terbaca = bacaKembali([barisLaporan(laporan(), 'Sistem Informasi')])

    expect(terbaca[0]).toEqual([...EXPORT_HEADERS])
  })

  it('menulis setiap laporan sebagai satu baris', () => {
    const terbaca = bacaKembali([
      barisLaporan(laporan({ id: 'LT-2026-0001' }), 'Sistem Informasi'),
      barisLaporan(laporan({ id: 'LT-2026-0002' }), 'Sistem Informasi'),
    ])

    expect(terbaca).toHaveLength(3)
    expect(terbaca[1]?.[0]).toBe('LT-2026-0001')
    expect(terbaca[2]?.[0]).toBe('LT-2026-0002')
  })

  it('mempertahankan nilai yang memuat koma tanpa memecah kolom', () => {
    // Inilah sebab format Excel dipilih: pada CSV, koma di dalam nilai mudah
    // memecah barisnya menjadi kolom tambahan.
    const terbaca = bacaKembali([
      barisLaporan(laporan({ title: 'Tugas 1, 2, dan 3 belum dinilai' }), 'Sistem Informasi'),
    ])

    expect(terbaca[1]?.[EXPORT_HEADERS.indexOf('Judul Laporan')]).toBe(
      'Tugas 1, 2, dan 3 belum dinilai',
    )
    expect(terbaca[1]).toHaveLength(EXPORT_HEADERS.length)
  })

  it('mempertahankan tanda kutip dan baris baru di dalam uraian', () => {
    const uraian = 'Tutor menulis "akan dinilai"\nnamun belum ada hasilnya.'
    const terbaca = bacaKembali([
      barisLaporan(laporan({ description: uraian }), 'Sistem Informasi'),
    ])

    expect(terbaca[1]?.[EXPORT_HEADERS.indexOf('Uraian Permasalahan')]).toBe(uraian)
  })

  it('tetap menghasilkan lembar bertajuk ketika tidak ada laporan', () => {
    const terbaca = bacaKembali([])

    expect(terbaca).toHaveLength(1)
    expect(terbaca[0]).toEqual([...EXPORT_HEADERS])
  })

  it('memberi nama lembar yang dapat dikenali penerimanya', () => {
    expect(buatBukuKerja([]).SheetNames[0]).toBe('Data Laporan')
  })
})

describe('namaBerkasEkspor', () => {
  it('memakai akhiran xlsx', () => {
    expect(namaBerkasEkspor('Fakultas Sains dan Teknologi')).toMatch(/\.xlsx$/)
  })

  it('mengganti spasi dan tanda baca agar aman sebagai nama berkas', () => {
    const nama = namaBerkasEkspor('Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik')

    expect(nama).not.toMatch(/[,\s/\\:*?"<>|]/)
  })

  it('menyertakan tanggal agar ekspor berbeda tidak saling menimpa', () => {
    const nama = namaBerkasEkspor('Fakultas Sains dan Teknologi', new Date(2026, 9, 18))

    expect(nama).toContain('20261018')
  })

  it('tetap menghasilkan nama yang sah ketika fakultas kosong', () => {
    expect(namaBerkasEkspor('')).toContain('Semua')
  })
})

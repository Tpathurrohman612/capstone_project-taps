import { describe, expect, it } from 'vitest'
import {
  formToLaporanBaru,
  joinCourse,
  laporanToWorkflowReport,
  splitCourse,
} from './report-mapper'
import type { Laporan } from './laporan-repository'

const laporan: Laporan = {
  id_laporan: 'dok-abc',
  nomor_laporan: 'LT-2026-0007',
  uid_pelapor: 'uid-mahasiswa',
  id_kategori: 'Tutor tidak memberikan umpan balik',
  id_status: 'Menunggu Pemeriksaan',
  nama_tutor: 'Budi Santoso',
  judul_laporan: 'Tugas 1 belum dinilai',
  deskripsi: 'Sudah minggu keenam dan nilai belum keluar.',
  jenis_mata_kuliah: 'Teori/Umum',
  kode_mata_kuliah: 'MSIM4301',
  nama_mata_kuliah: 'Rekayasa Perangkat Lunak',
  kelas_mata_kuliah: '01',
  perkiraan_durasi: '1 minggu atau lebih',
  fakultas_pelapor: 'Fakultas Sains dan Teknologi',
  tanggal_laporan: new Date('2026-10-17T08:00:00Z'),
}

describe('splitCourse', () => {
  it('memecah kode dan nama mata kuliah', () => {
    expect(splitCourse('MSIM4301 · Rekayasa Perangkat Lunak')).toEqual({
      kode: 'MSIM4301',
      nama: 'Rekayasa Perangkat Lunak',
    })
  })

  it('mempertahankan pemisah yang muncul di dalam nama', () => {
    // Nama mata kuliah yang memuat titik tengah tidak boleh terpotong.
    expect(splitCourse('MSIM4301 · Basis Data · Lanjut')).toEqual({
      kode: 'MSIM4301',
      nama: 'Basis Data · Lanjut',
    })
  })

  it('memperlakukan teks tanpa pemisah sebagai nama mata kuliah', () => {
    // Memperlakukannya sebagai kode akan menghilangkan nama dari tampilan.
    expect(splitCourse('Rekayasa Perangkat Lunak')).toEqual({
      kode: '',
      nama: 'Rekayasa Perangkat Lunak',
    })
  })

  it('membuang spasi berlebih', () => {
    expect(splitCourse('  MSIM4301 ·  Rekayasa  ')).toEqual({
      kode: 'MSIM4301',
      nama: 'Rekayasa',
    })
  })

  it('menangani teks kosong', () => {
    expect(splitCourse('')).toEqual({ kode: '', nama: '' })
  })
})

describe('joinCourse', () => {
  it('menggabungkan kode dan nama', () => {
    expect(joinCourse('MSIM4301', 'Rekayasa Perangkat Lunak')).toBe(
      'MSIM4301 · Rekayasa Perangkat Lunak',
    )
  })

  it('tidak meninggalkan pemisah menggantung ketika salah satu kosong', () => {
    expect(joinCourse('MSIM4301', undefined)).toBe('MSIM4301')
    expect(joinCourse(undefined, 'Rekayasa')).toBe('Rekayasa')
    expect(joinCourse('', '')).toBe('')
    expect(joinCourse(undefined, undefined)).toBe('')
  })

  it('bolak-balik dengan splitCourse tanpa kehilangan data', () => {
    const asli = 'MSIM4301 · Rekayasa Perangkat Lunak'
    const { kode, nama } = splitCourse(asli)
    expect(joinCourse(kode, nama)).toBe(asli)
  })
})

describe('laporanToWorkflowReport', () => {
  it('memakai nomor laporan sebagai id yang dilihat pengguna', () => {
    const hasil = laporanToWorkflowReport(laporan)
    expect(hasil.id).toBe('LT-2026-0007')
    expect(hasil.docId).toBe('dok-abc')
  })

  it('menggabungkan kode dan nama mata kuliah untuk tampilan', () => {
    expect(laporanToWorkflowReport(laporan).course).toBe('MSIM4301 · Rekayasa Perangkat Lunak')
  })

  it('memetakan seluruh field wajib', () => {
    expect(laporanToWorkflowReport(laporan)).toMatchObject({
      studentNim: 'uid-mahasiswa',
      title: 'Tugas 1 belum dinilai',
      category: 'Tutor tidak memberikan umpan balik',
      className: '01',
      tutor: 'Budi Santoso',
      status: 'Menunggu Pemeriksaan',
    })
  })

  it('memformat tanggal laporan dalam bahasa Indonesia', () => {
    expect(laporanToWorkflowReport(laporan).submitted).toContain('2026')
  })

  it('mengosongkan updates karena riwayat dibaca terpisah', () => {
    expect(laporanToWorkflowReport(laporan).updates).toEqual([])
  })

  it('tidak memuat kunci opsional yang tidak ada', () => {
    const tanpaOpsional: Laporan = {
      id_laporan: 'dok',
      nomor_laporan: 'LT-2026-0001',
      uid_pelapor: 'uid',
      id_kategori: '',
      id_status: 'Menunggu Pemeriksaan',
      nama_tutor: '',
      judul_laporan: 'Judul',
      tanggal_laporan: new Date('2026-01-01T00:00:00Z'),
    }

    const hasil = laporanToWorkflowReport(tanpaOpsional)
    expect('description' in hasil).toBe(false)
    expect('duration' in hasil).toBe(false)
    expect('studentFaculty' in hasil).toBe(false)
    expect(hasil.className).toBe('')
    expect(hasil.course).toBe('')
  })
})

describe('formToLaporanBaru', () => {
  const isian = {
    judul: 'Tugas 1 belum dinilai',
    kategori: 'Tutor tidak memberikan umpan balik',
    course: 'MSIM4301 · Rekayasa Perangkat Lunak',
    kelas: '01',
    tutor: 'Budi Santoso',
    jenisMataKuliah: 'Teori/Umum',
    durasi: '1 minggu atau lebih',
    deskripsi: 'Sudah minggu keenam.',
    fakultas: 'Fakultas Sains dan Teknologi',
  }

  it('memecah mata kuliah menjadi kode dan nama', () => {
    expect(formToLaporanBaru(isian)).toMatchObject({
      kode_mata_kuliah: 'MSIM4301',
      nama_mata_kuliah: 'Rekayasa Perangkat Lunak',
    })
  })

  it('membuang spasi di tepi setiap isian', () => {
    const hasil = formToLaporanBaru({ ...isian, judul: '  Judul berspasi  ' })
    expect(hasil.judul_laporan).toBe('Judul berspasi')
  })

  it('tidak menulis field kosong', () => {
    // Firestore membedakan field yang tidak ada dari field bernilai teks
    // kosong; menulis teks kosong membuat dokumen penuh field tak bermakna.
    const hasil = formToLaporanBaru({
      judul: 'Judul',
      kategori: 'Kategori',
      course: '',
      kelas: '',
      tutor: 'Tutor',
      deskripsi: '   ',
    })

    expect('kelas_mata_kuliah' in hasil).toBe(false)
    expect('deskripsi' in hasil).toBe(false)
    expect('kode_mata_kuliah' in hasil).toBe(false)
    expect('nama_mata_kuliah' in hasil).toBe(false)
  })

  it('tidak pernah memuat field yang ditentukan lapisan data', () => {
    // Nomor, pemilik, status, dan tanggal ditentukan di dalam transaksi.
    const hasil = formToLaporanBaru(isian) as Record<string, unknown>
    for (const terlarang of [
      'nomor_laporan',
      'uid_pelapor',
      'id_status',
      'tanggal_laporan',
      'id_laporan',
    ]) {
      expect(terlarang in hasil).toBe(false)
    }
  })

  it('menghasilkan data yang dapat dikembalikan ke bentuk tampilan', () => {
    const baru = formToLaporanBaru(isian)
    const tersimpan: Laporan = {
      ...baru,
      id_laporan: 'dok',
      nomor_laporan: 'LT-2026-0010',
      uid_pelapor: 'uid',
      id_status: 'Menunggu Pemeriksaan',
      tanggal_laporan: new Date('2026-10-17T08:00:00Z'),
    }

    const tampilan = laporanToWorkflowReport(tersimpan)
    expect(tampilan.course).toBe(isian.course)
    expect(tampilan.title).toBe(isian.judul)
    expect(tampilan.tutor).toBe(isian.tutor)
  })

  it('memetakan program studi pelapor dari laporannya', () => {
    // Program studi tersimpan sejak laporan dibuat, tetapi sempat tidak pernah
    // dipetakan kembali. Layar Administrator karena itu menurunkannya dari
    // kode mata kuliah, dan menampilkan tanda hubung untuk kode yang tidak ada
    // pada daftar bawaan, padahal datanya tersedia.
    const hasil = laporanToWorkflowReport({
      ...laporan,
      prodi_pelapor: 'Sistem Informasi',
    })

    expect(hasil.studentProgram).toBe('Sistem Informasi')
  })

  it('tidak membuat field program studi ketika laporannya tidak mencatatnya', () => {
    expect(laporanToWorkflowReport(laporan).studentProgram).toBeUndefined()
  })
})

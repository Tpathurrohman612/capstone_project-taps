import { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import { tahunLaporan, toLaporan } from './laporan-repository'

/**
 * Pengujian pemetaan dokumen Firestore menjadi Laporan.
 *
 * Bagian inilah yang menentukan apakah satu dokumen rusak dapat menjatuhkan
 * seluruh daftar laporan, sehingga diuji tanpa memerlukan jaringan maupun
 * emulator. Perilaku aturan keamanannya diuji terpisah pada
 * shared/lib/firestore-rules.test.ts.
 */

const tanggal = Timestamp.fromDate(new Date('2026-10-17T08:00:00Z'))

const dokumenLengkap = {
  nomor_laporan: 'LT-2026-0007',
  uid_pelapor: 'uid-mahasiswa',
  id_kategori: 'umpan-balik',
  id_status: 'Menunggu Pemeriksaan',
  nama_tutor: 'Budi Santoso',
  judul_laporan: 'Tutor belum memberi umpan balik',
  deskripsi: 'Tugas 1 belum dinilai sampai minggu keenam.',
  jenis_mata_kuliah: 'Teori/Umum',
  kode_mata_kuliah: 'MSIM4301',
  nama_mata_kuliah: 'Rekayasa Perangkat Lunak',
  kelas_mata_kuliah: '01',
  perkiraan_durasi: '1 minggu atau lebih',
  prodi_pelapor: 'Sistem Informasi',
  fakultas_pelapor: 'Fakultas Sains dan Teknologi',
  tanggal_laporan: tanggal,
}

describe('toLaporan', () => {
  it('memetakan dokumen lengkap beserta seluruh field opsional', () => {
    const hasil = toLaporan('abc123', dokumenLengkap)

    expect(hasil).toBeDefined()
    expect(hasil).toMatchObject({
      id_laporan: 'abc123',
      nomor_laporan: 'LT-2026-0007',
      uid_pelapor: 'uid-mahasiswa',
      id_status: 'Menunggu Pemeriksaan',
      judul_laporan: 'Tutor belum memberi umpan balik',
      kode_mata_kuliah: 'MSIM4301',
      fakultas_pelapor: 'Fakultas Sains dan Teknologi',
    })
    expect(hasil?.tanggal_laporan).toBeInstanceOf(Date)
    expect(hasil?.tanggal_laporan.toISOString()).toBe('2026-10-17T08:00:00.000Z')
  })

  it('memetakan dokumen minimal tanpa field opsional', () => {
    const hasil = toLaporan('minimal', {
      nomor_laporan: 'LT-2026-0001',
      uid_pelapor: 'uid',
      id_status: 'Menunggu Pemeriksaan',
      judul_laporan: 'Judul',
      tanggal_laporan: tanggal,
    })

    expect(hasil).toBeDefined()
    expect(hasil?.deskripsi).toBeUndefined()
    expect(hasil?.kode_mata_kuliah).toBeUndefined()
    // Field wajib yang boleh kosong diisi teks kosong, bukan undefined,
    // supaya layar tidak perlu memeriksa dua kemungkinan.
    expect(hasil?.id_kategori).toBe('')
    expect(hasil?.nama_tutor).toBe('')
  })

  it('tidak memuat kunci opsional yang kosong', () => {
    const hasil = toLaporan('kosong', {
      ...dokumenLengkap,
      deskripsi: '',
    })

    expect(hasil && 'deskripsi' in hasil).toBe(false)
  })

  it('menerima tanggal berupa Date, bukan hanya Timestamp', () => {
    const hasil = toLaporan('date', {
      ...dokumenLengkap,
      tanggal_laporan: new Date('2026-01-02T00:00:00Z'),
    })

    expect(hasil?.tanggal_laporan.toISOString()).toBe('2026-01-02T00:00:00.000Z')
  })

  it('menyertakan tanggal_diperbarui hanya bila ada', () => {
    const tanpa = toLaporan('a', dokumenLengkap)
    expect(tanpa?.tanggal_diperbarui).toBeUndefined()

    const dengan = toLaporan('b', {
      ...dokumenLengkap,
      tanggal_diperbarui: Timestamp.fromDate(new Date('2026-10-18T09:00:00Z')),
    })
    expect(dengan?.tanggal_diperbarui?.toISOString()).toBe('2026-10-18T09:00:00.000Z')
  })

  describe('dokumen yang ditolak', () => {
    it('menolak status yang tidak ada pada Tabel 4.1', () => {
      // "Diproses" adalah nama lama yang tidak lagi sah.
      expect(toLaporan('x', { ...dokumenLengkap, id_status: 'Diproses' })).toBeUndefined()
    })

    it('menolak dokumen tanpa nomor laporan', () => {
      const { nomor_laporan: _buang, ...tanpaNomor } = dokumenLengkap
      expect(toLaporan('x', tanpaNomor)).toBeUndefined()
    })

    it('menolak dokumen tanpa pemilik', () => {
      const { uid_pelapor: _buang, ...tanpaPemilik } = dokumenLengkap
      expect(toLaporan('x', tanpaPemilik)).toBeUndefined()
    })

    it('menolak dokumen tanpa judul', () => {
      const { judul_laporan: _buang, ...tanpaJudul } = dokumenLengkap
      expect(toLaporan('x', tanpaJudul)).toBeUndefined()
    })

    it('menolak dokumen tanpa tanggal laporan', () => {
      const { tanggal_laporan: _buang, ...tanpaTanggal } = dokumenLengkap
      expect(toLaporan('x', tanpaTanggal)).toBeUndefined()
    })

    it('menolak tanggal yang bukan Timestamp maupun Date', () => {
      expect(
        toLaporan('x', { ...dokumenLengkap, tanggal_laporan: '17 Oktober 2026' }),
      ).toBeUndefined()
    })

    it('menolak field wajib yang bertipe salah', () => {
      expect(toLaporan('x', { ...dokumenLengkap, nomor_laporan: 7 })).toBeUndefined()
      expect(toLaporan('x', { ...dokumenLengkap, judul_laporan: null })).toBeUndefined()
    })
  })

  it('menyaring dokumen rusak tanpa menjatuhkan dokumen lain', () => {
    const dokumen = [
      ['baik-1', dokumenLengkap],
      ['rusak', { ...dokumenLengkap, id_status: 'Entah' }],
      ['baik-2', { ...dokumenLengkap, nomor_laporan: 'LT-2026-0008' }],
    ] as const

    const hasil = dokumen
      .map(([id, data]) => toLaporan(id, data))
      .filter((laporan) => laporan !== undefined)

    expect(hasil).toHaveLength(2)
    expect(hasil.map((laporan) => laporan.id_laporan)).toEqual(['baik-1', 'baik-2'])
  })
})

describe('tahunLaporan', () => {
  it('membaca tahun dari nomor laporan', () => {
    expect(tahunLaporan('LT-2026-0007')).toBe(2026)
  })

  it('mengembalikan undefined untuk nomor yang tidak sah', () => {
    expect(tahunLaporan('bukan-nomor')).toBeUndefined()
  })
})

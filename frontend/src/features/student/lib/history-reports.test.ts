import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkflowReport } from '../../../shared/types/workflow'

/**
 * Pengujian keterhubungan laporan dengan pemiliknya.
 *
 * Cacat yang melahirkan berkas ini: laporan berhasil dikirim, tetapi Riwayat
 * Laporan tetap kosong. Penyebabnya laporan disimpan dengan Firebase UID
 * sebagai pemilik, sedangkan riwayat menyaring memakai NIM dari localStorage.
 * Keduanya tidak pernah cocok.
 *
 * Tidak ada modul yang salah bila diuji sendiri-sendiri. Yang salah adalah
 * kesepakatan tentang apa yang dipakai sebagai kunci pemilik, dan kesepakatan
 * semacam itu hanya terlihat bila dua sisinya diuji bersama. Karena itu
 * pengujian di sini selalu menulis laporan dengan satu kunci lalu membacanya
 * dengan kunci yang sama atau berbeda.
 */

const UID = 'uid-firebase-123'
const UID_LAIN = 'uid-firebase-999'

function buatLaporan(pemilik: string, nomor: string): WorkflowReport {
  return {
    id: nomor,
    studentNim: pemilik,
    title: `Laporan ${nomor}`,
    category: 'Aktivitas tutor',
    course: 'MSIM4301 · Rekayasa Perangkat Lunak',
    className: '01',
    tutor: 'Budi Santoso',
    submitted: '17 Oktober 2026',
    status: 'Menunggu Pemeriksaan',
    updates: [],
  }
}

const mockGetWorkflowReports = vi.fn<() => WorkflowReport[]>()

vi.mock('../../../shared/lib/workflow-storage', () => ({
  getWorkflowReports: () => mockGetWorkflowReports(),
}))

const { getStudentHistoryReports } = await import('./history-reports')

describe('getStudentHistoryReports', () => {
  beforeEach(() => {
    mockGetWorkflowReports.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan laporan yang baru dibuat kepada pembuatnya', () => {
    // Inilah pengujian yang akan gagal bila kunci pemilik kembali berbeda
    // antara sisi penyimpanan dan sisi pembacaan.
    mockGetWorkflowReports.mockReturnValue([buatLaporan(UID, 'LT-2026-0001')])

    const riwayat = getStudentHistoryReports(UID)

    expect(riwayat).toHaveLength(1)
    expect(riwayat[0]?.id).toBe('LT-2026-0001')
  })

  it('menyembunyikan laporan milik mahasiswa lain', () => {
    mockGetWorkflowReports.mockReturnValue([
      buatLaporan(UID, 'LT-2026-0001'),
      buatLaporan(UID_LAIN, 'LT-2026-0002'),
    ])

    const riwayat = getStudentHistoryReports(UID)

    expect(riwayat).toHaveLength(1)
    expect(riwayat[0]?.id).toBe('LT-2026-0001')
  })

  it('mengosongkan riwayat ketika pemilik tidak diketahui', () => {
    // Mengembalikan seluruh laporan pada keadaan ini akan membocorkan laporan
    // mahasiswa lain kepada sesi yang belum dikenali.
    mockGetWorkflowReports.mockReturnValue([buatLaporan(UID, 'LT-2026-0001')])

    expect(getStudentHistoryReports(undefined)).toEqual([])
    expect(getStudentHistoryReports('')).toEqual([])
  })

  it('mengosongkan riwayat ketika tidak ada laporan tersimpan', () => {
    mockGetWorkflowReports.mockReturnValue([])
    expect(getStudentHistoryReports(UID)).toEqual([])
  })

  it('tidak mencocokkan pemilik secara sebagian', () => {
    // Pencocokan harus persis. Kunci yang berawalan sama bukan pemilik yang
    // sama.
    mockGetWorkflowReports.mockReturnValue([buatLaporan('uid-firebase-1234', 'LT-2026-0003')])

    expect(getStudentHistoryReports(UID)).toEqual([])
  })

  it('mengurutkan laporan terbaru di atas', () => {
    mockGetWorkflowReports.mockReturnValue([
      buatLaporan(UID, 'LT-2026-0001'),
      buatLaporan(UID, 'LT-2026-0010'),
      buatLaporan(UID, 'LT-2026-0002'),
    ])

    const urutan = getStudentHistoryReports(UID).map((laporan) => laporan.id)

    // Pengurutan numerik, bukan leksikografis: 0010 harus di atas 0002.
    expect(urutan).toEqual(['LT-2026-0010', 'LT-2026-0002', 'LT-2026-0001'])
  })

  it('mempertahankan isi laporan saat dipetakan ke riwayat', () => {
    mockGetWorkflowReports.mockReturnValue([buatLaporan(UID, 'LT-2026-0007')])

    const [riwayat] = getStudentHistoryReports(UID)

    expect(riwayat).toMatchObject({
      title: 'Laporan LT-2026-0007',
      category: 'Aktivitas tutor',
      course: 'MSIM4301 · Rekayasa Perangkat Lunak',
      tutor: 'Budi Santoso',
      status: 'Menunggu Pemeriksaan',
    })
  })

  it('mengisi nilai bawaan untuk field yang tidak ada', () => {
    mockGetWorkflowReports.mockReturnValue([buatLaporan(UID, 'LT-2026-0001')])

    const [riwayat] = getStudentHistoryReports(UID)

    expect(riwayat?.courseType).toBe('Teori/Umum')
    expect(riwayat?.duration).toBe('1 minggu atau lebih')
  })

  it('meneruskan status apa pun tanpa mengubahnya', () => {
    const laporan = buatLaporan(UID, 'LT-2026-0001')
    laporan.status = 'Perlu Dilengkapi'
    mockGetWorkflowReports.mockReturnValue([laporan])

    expect(getStudentHistoryReports(UID)[0]?.status).toBe('Perlu Dilengkapi')
  })
})

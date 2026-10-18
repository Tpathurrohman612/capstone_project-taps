import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkflowReport } from '../../../shared/types/workflow'

/**
 * Pengujian alur Administrator.
 *
 * Yang diuji bukan tampilannya, melainkan keputusannya: apakah kegagalan
 * perubahan status disampaikan sebagai pesan atau menjatuhkan halaman, apakah
 * daftar dibaca ulang setelah perubahan berhasil, dan apakah pencatat selalu
 * diisi dari sesi yang sedang masuk.
 *
 * Pemeriksaan kelayakan perpindahan itu sendiri diuji terhadap basis data
 * sungguhan pada laporan-repository.emulator.test.ts.
 */

const mockFetchAll = vi.fn()
const mockChangeStatus = vi.fn()
const mockAuth = vi.fn()

vi.mock('../../../shared/data/report-store', () => ({
  fetchAllReports: () => mockFetchAll(),
  changeReportStatus: (params: unknown) => mockChangeStatus(params),
}))

vi.mock('../../../shared/lib/auth-context', () => ({
  useAuth: () => mockAuth(),
}))

const { useAdminReports } = await import('./use-admin-reports')

const laporan = (id: string, docId = `dok-${id}`): WorkflowReport => ({
  id,
  docId,
  studentNim: 'uid-mahasiswa',
  title: `Laporan ${id}`,
  category: 'Aktivitas tutor',
  course: 'MSIM4301 · Rekayasa Perangkat Lunak',
  className: '01',
  tutor: 'Budi Santoso',
  submitted: '18 Oktober 2026',
  status: 'Menunggu Pemeriksaan',
  updates: [],
})

let hasilUbah: { berhasil: boolean; alasan?: string } | undefined

function Penampil() {
  const { reports, memuat, galat, ubahStatus } = useAdminReports()

  return (
    <div>
      <span data-testid="memuat">{String(memuat)}</span>
      <span data-testid="jumlah">{reports.length}</span>
      <span data-testid="galat">{galat ?? '-'}</span>
      <button
        type="button"
        onClick={() => {
          void ubahStatus({ report: laporan('LT-2026-0001'), ke: 'Lolos Pemeriksaan' }).then(
            (hasil) => {
              hasilUbah = hasil
            },
          )
        }}
      >
        ubah
      </button>
    </div>
  )
}

describe('useAdminReports', () => {
  beforeEach(() => {
    mockFetchAll.mockReset()
    mockChangeStatus.mockReset()
    mockAuth.mockReset()
    hasilUbah = undefined
    mockAuth.mockReturnValue({ user: { uid: 'uid-admin' } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('membaca seluruh laporan saat dipasang', async () => {
    mockFetchAll.mockResolvedValue([laporan('LT-2026-0001'), laporan('LT-2026-0002')])

    render(<Penampil />)

    await waitFor(() => {
      expect(screen.getByTestId('jumlah').textContent).toBe('2')
    })
    expect(screen.getByTestId('memuat').textContent).toBe('false')
  })

  it('menyatakan sedang memuat sebelum data tiba', () => {
    mockFetchAll.mockReturnValue(new Promise(() => {}))

    render(<Penampil />)

    // Tanpa penanda ini, antrean kosong akan terbaca sebagai tidak ada laporan.
    expect(screen.getByTestId('memuat').textContent).toBe('true')
  })

  it('menyampaikan kegagalan pembacaan sebagai pesan, bukan daftar kosong diam-diam', async () => {
    // Kegagalan aturan keamanan terjadi bila yang masuk ternyata bukan
    // Administrator, dan itu harus terlihat.
    mockFetchAll.mockRejectedValue(new Error('Missing or insufficient permissions.'))

    render(<Penampil />)

    // Pesan bawaan Firestore diterjemahkan menjadi langkah yang dapat
    // ditindaklanjuti, sehingga yang diperiksa penjelasannya, bukan kalimat
    // aslinya.
    await waitFor(() => {
      expect(screen.getByTestId('galat').textContent).toContain('administrator')
    })
    expect(screen.getByTestId('jumlah').textContent).toBe('0')
  })

  it('mencatat perubahan atas nama pengguna yang sedang masuk', async () => {
    mockFetchAll.mockResolvedValue([])
    mockChangeStatus.mockResolvedValue(undefined)

    render(<Penampil />)
    screen.getByRole('button', { name: 'ubah' }).click()

    await waitFor(() => {
      expect(mockChangeStatus).toHaveBeenCalled()
    })

    const dipakai = mockChangeStatus.mock.calls[0]?.[0] as Record<string, unknown>
    expect(dipakai.uidPencatat).toBe('uid-admin')
    expect(dipakai.oleh).toBe('Administrator')
    expect(dipakai.docId).toBe('dok-LT-2026-0001')
  })

  it('membaca ulang daftar setelah perubahan berhasil', async () => {
    // Tanpa pembacaan ulang, tampilan tetap menunjukkan status lama meskipun
    // basis data sudah berubah.
    mockFetchAll.mockResolvedValue([])
    mockChangeStatus.mockResolvedValue(undefined)

    render(<Penampil />)
    await waitFor(() => expect(mockFetchAll).toHaveBeenCalledTimes(1))

    screen.getByRole('button', { name: 'ubah' }).click()

    await waitFor(() => {
      expect(mockFetchAll).toHaveBeenCalledTimes(2)
    })
  })

  it('mengembalikan kegagalan perubahan sebagai alasan, bukan melemparnya', async () => {
    mockFetchAll.mockResolvedValue([])
    mockChangeStatus.mockRejectedValue(
      new Error('Perpindahan ke Selesai membutuhkan tindak_lanjut.'),
    )

    render(<Penampil />)
    screen.getByRole('button', { name: 'ubah' }).click()

    await waitFor(() => {
      expect(hasilUbah?.berhasil).toBe(false)
    })
    expect(hasilUbah?.alasan).toContain('tindak_lanjut')
  })

  it('tidak membaca ulang daftar ketika perubahan gagal', async () => {
    mockFetchAll.mockResolvedValue([])
    mockChangeStatus.mockRejectedValue(new Error('ditolak'))

    render(<Penampil />)
    await waitFor(() => expect(mockFetchAll).toHaveBeenCalledTimes(1))

    screen.getByRole('button', { name: 'ubah' }).click()
    await waitFor(() => expect(hasilUbah?.berhasil).toBe(false))

    expect(mockFetchAll).toHaveBeenCalledTimes(1)
  })

  it('menolak perubahan ketika sesi masuk sudah berakhir', async () => {
    // Tanpa pengguna, pencatat tidak dapat diisi dan aturan keamanan akan
    // menolaknya; menahannya lebih awal memberi pesan yang lebih jelas.
    mockFetchAll.mockResolvedValue([])
    mockAuth.mockReturnValue({ user: null })

    render(<Penampil />)
    screen.getByRole('button', { name: 'ubah' }).click()

    await waitFor(() => {
      expect(hasilUbah?.berhasil).toBe(false)
    })
    expect(hasilUbah?.alasan).toContain('Sesi masuk')
    expect(mockChangeStatus).not.toHaveBeenCalled()
  })
})

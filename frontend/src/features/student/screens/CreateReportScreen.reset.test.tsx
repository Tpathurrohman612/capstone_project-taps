import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

/**
 * Pengosongan formulir Buat Laporan.
 *
 * Menutup pemberitahuan berhasil membuka kembali tombol kirim. Isian yang
 * tertinggal karena itu dapat terkirim untuk kedua kalinya sebagai laporan
 * baru, tanpa mahasiswa menyadari bahwa ia mengirim laporan yang sama dua
 * kali.
 *
 * Penyimpanannya dipalsukan di sini agar pengujian ini menguji satu hal saja:
 * apa yang terjadi pada formulir setelah pengiriman berhasil.
 */

const mockSubmit = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '', pathname: '/buat-laporan' }),
  Link: ({ children }: { children: ReactNode }) => children,
  Navigate: () => null,
}))

vi.mock('../lib/student-identity', () => ({
  useStudentIdentity: () => ({
    ownerKey: 'uid-123',
    nim: '041111111',
    fakultas: 'Fakultas Sains dan Teknologi',
    programStudi: 'Sistem Informasi',
    memuat: false,
    lengkap: true,
  }),
}))

vi.mock('../../../shared/data/report-store', () => ({
  submitReport: (params: unknown) => mockSubmit(params),
}))

const { CreateReportScreen } = await import('./CreateReportScreen')

const ISIAN: Record<string, string> = {
  category: 'Aktivitas tutor',
  courseType: 'Teori/Umum',
  courseCode: 'MSIM4301',
  courseName: 'Rekayasa Perangkat Lunak',
  className: '01',
  tutor: 'Budi Santoso',
  duration: 'Kurang dari 3 hari',
  title: 'Tugas 1 belum dinilai',
  description: 'Sudah minggu keenam dan nilai belum keluar.',
}

function isiLaluKirim(container: HTMLElement) {
  for (const [nama, nilai] of Object.entries(ISIAN)) {
    const elemen = container.querySelector<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(`[name="${nama}"]`)

    if (!elemen) throw new Error(`Isian wajib "${nama}" tidak ditemukan.`)

    const prototipe =
      elemen instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : elemen instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype

    Object.getOwnPropertyDescriptor(prototipe, 'value')?.set?.call(elemen, nilai)
    elemen.dispatchEvent(new Event('input', { bubbles: true }))
    elemen.dispatchEvent(new Event('change', { bubbles: true }))
  }

  container.querySelector('form')?.requestSubmit()
}

describe('pengosongan formulir Buat Laporan', () => {
  beforeEach(() => {
    mockSubmit.mockReset()
    mockSubmit.mockResolvedValue('LT-2026-0009')
    window.sessionStorage.clear()
  })

  it('menampilkan pemberitahuan berhasil setelah laporan tersimpan', async () => {
    const { container } = render(<CreateReportScreen />)
    isiLaluKirim(container)

    expect(await screen.findByText(/LT-2026-0009/, {}, { timeout: 3000 })).toBeTruthy()
    expect(mockSubmit).toHaveBeenCalledTimes(1)
  })

  it('mengosongkan seluruh isian setelah pemberitahuan ditutup', async () => {
    const { container } = render(<CreateReportScreen />)
    isiLaluKirim(container)
    ;(await screen.findByRole('button', { name: 'Tutup' }, { timeout: 3000 })).click()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Tutup' })).toBeNull()
    })

    for (const nama of Object.keys(ISIAN)) {
      const elemen = container.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >(`[name="${nama}"]`)

      expect(elemen?.value, `isian "${nama}" masih berisi nilai lama`).toBe('')
    }
  })

  it('membuka kembali tombol kirim setelah pemberitahuan ditutup', async () => {
    // Tombol yang tetap terkunci membuat mahasiswa mengira halamannya rusak
    // ketika hendak membuat laporan berikutnya.
    const { container } = render(<CreateReportScreen />)
    isiLaluKirim(container)
    ;(await screen.findByRole('button', { name: 'Tutup' }, { timeout: 3000 })).click()

    await waitFor(() => {
      const kirim = container.querySelector<HTMLButtonElement>('button[type="submit"]')
      expect(kirim?.disabled).toBe(false)
    })
  })
})

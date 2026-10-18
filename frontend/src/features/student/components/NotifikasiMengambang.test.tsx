import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Pemberitahuan mengambang.
 *
 * Panel notifikasi hanya ada di dasbor dan harus dibuka sendiri, sehingga
 * mahasiswa yang berada di halaman lain tidak pernah mengetahui laporannya
 * sudah ditangani. Yang dijaga di sini terutama dua hal: pemberitahuan yang
 * sudah ditutup tidak boleh muncul lagi, dan tautannya harus menuju laporan
 * yang benar.
 */

const navigate = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
}))

const { NotifikasiMengambang } = await import('./NotifikasiMengambang')

const notif = (ubah: Partial<Record<string, unknown>> = {}) => ({
  id: 'notif-1',
  nomorLaporan: 'LT-2026-0002',
  pesan: 'LT-2026-0002: Laporan diteruskan ke Fakultas.',
  waktu: new Date('2026-10-18T10:00:00Z'),
  belumDibaca: true,
  ...ubah,
})

describe('NotifikasiMengambang', () => {
  beforeEach(() => {
    navigate.mockReset()
    window.sessionStorage.clear()
  })

  it('menampilkan notifikasi terbaru yang belum dibaca', () => {
    render(<NotifikasiMengambang notifikasi={[notif()]} />)

    expect(screen.getByRole('status').textContent).toContain('Laporan diteruskan ke Fakultas')
  })

  it('tidak menampilkan apa pun ketika seluruhnya sudah dibaca', () => {
    render(<NotifikasiMengambang notifikasi={[notif({ belumDibaca: false })]} />)

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('menampilkan satu notifikasi saja meskipun ada beberapa', () => {
    // Menumpuk seluruhnya akan menutupi halaman yang sedang dibaca, padahal
    // yang mendesak selalu yang terakhir.
    render(
      <NotifikasiMengambang
        notifikasi={[notif(), notif({ id: 'notif-2', pesan: 'Pesan kedua' })]}
      />,
    )

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status').textContent).not.toContain('Pesan kedua')
  })

  it('membuka detail laporan yang disebut notifikasinya', () => {
    render(<NotifikasiMengambang notifikasi={[notif()]} />)

    screen.getByRole('button', { name: 'Lihat Detail' }).click()

    expect(navigate).toHaveBeenCalledWith('/riwayat-laporan/detail-laporan?report=LT-2026-0002')
  })

  it('membuka riwayat ketika nomor laporannya tidak diketahui', () => {
    // Membuka halaman detail tanpa laporan yang dituju hanya akan menampilkan
    // "laporan tidak ditemukan".
    render(<NotifikasiMengambang notifikasi={[notif({ nomorLaporan: undefined })]} />)

    screen.getByRole('button', { name: 'Lihat Detail' }).click()

    expect(navigate).toHaveBeenCalledWith('/riwayat-laporan')
  })

  it('menandai notifikasi sudah dibaca ketika detailnya dibuka', () => {
    const onBaca = vi.fn()
    render(<NotifikasiMengambang notifikasi={[notif()]} onBaca={onBaca} />)

    screen.getByRole('button', { name: 'Lihat Detail' }).click()

    expect(onBaca).toHaveBeenCalledWith('notif-1')
  })

  it('tidak menampilkan kembali notifikasi yang sudah ditutup', async () => {
    const { unmount } = render(<NotifikasiMengambang notifikasi={[notif()]} />)
    screen.getByRole('button', { name: 'Tutup' }).click()

    await waitFor(() => {
      expect(screen.queryByRole('status')).toBeNull()
    })

    // Berpindah halaman memasang ulang komponennya, dan tanpa penyimpanan
    // pemberitahuan yang sama akan muncul lagi pada setiap perpindahan.
    unmount()
    render(<NotifikasiMengambang notifikasi={[notif()]} />)

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('tetap menampilkan notifikasi lain setelah satu ditutup', async () => {
    const daftar = [notif(), notif({ id: 'notif-2', pesan: 'Pesan kedua' })]
    render(<NotifikasiMengambang notifikasi={daftar} />)

    screen.getByRole('button', { name: 'Tutup' }).click()

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('Pesan kedua')
    })
  })

  it('tetap tampil ketika penyimpanan sesi tidak dapat dibaca', () => {
    // Mode penyamaran dan penyimpanan yang diblokir melempar galat, dan itu
    // bukan alasan menyembunyikan pemberitahuannya.
    const asli = window.sessionStorage.getItem
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('ditolak')
    })

    render(<NotifikasiMengambang notifikasi={[notif()]} />)

    expect(screen.getByRole('status')).toBeTruthy()
    vi.mocked(Storage.prototype.getItem).mockRestore()
    expect(asli).toBeTruthy()
  })
})

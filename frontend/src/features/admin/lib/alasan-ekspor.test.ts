import { describe, expect, it } from 'vitest'
import { alasanEksporTertutup, STATUS_EKSPOR } from './alasan-ekspor'

/**
 * Alasan tombol ekspor tertutup.
 *
 * Syaratnya bertingkat, dan yang dijaga di sini adalah urutannya: menyebut
 * syarat yang belakangan selagi syarat sebelumnya belum terpenuhi akan
 * menyesatkan, karena syarat belakangan itu memang mustahil terpenuhi.
 */

const lengkap = {
  fakultas: 'Fakultas Sains dan Teknologi',
  status: STATUS_EKSPOR,
  jumlahSiap: 3,
  jumlahTerpilih: 2,
}

describe('alasanEksporTertutup', () => {
  it('tidak memberi alasan ketika seluruh syaratnya terpenuhi', () => {
    expect(alasanEksporTertutup(lengkap)).toBeUndefined()
  })

  it('meminta memilih fakultas lebih dahulu', () => {
    const alasan = alasanEksporTertutup({ ...lengkap, fakultas: 'Semua' })

    expect(alasan).toContain('Fakultas')
  })

  it('mendahulukan fakultas daripada syarat mana pun yang lain', () => {
    // Selama fakultasnya belum dipilih, tidak ada laporan yang siap maupun
    // terpilih, sehingga menyebut keduanya akan menyesatkan.
    const alasan = alasanEksporTertutup({
      fakultas: 'Semua',
      status: 'Menunggu Pemeriksaan',
      jumlahSiap: 0,
      jumlahTerpilih: 0,
    })

    expect(alasan).toContain('Fakultas')
    expect(alasan).not.toContain('Centang')
    expect(alasan).not.toContain('Status Laporan')
  })

  it('meminta memilih status setelah fakultasnya dipilih', () => {
    const alasan = alasanEksporTertutup({
      ...lengkap,
      status: 'Menunggu Pemeriksaan',
      jumlahSiap: 0,
      jumlahTerpilih: 0,
    })

    expect(alasan).toContain(STATUS_EKSPOR)
    expect(alasan).not.toContain('Centang')
  })

  it('menyatakan tidak ada laporan pada fakultas itu', () => {
    const alasan = alasanEksporTertutup({ ...lengkap, jumlahSiap: 0, jumlahTerpilih: 0 })

    expect(alasan).toContain('Fakultas Sains dan Teknologi')
    expect(alasan).toContain(STATUS_EKSPOR)
  })

  it('meminta mencentang ketika laporannya ada tetapi belum dipilih', () => {
    const alasan = alasanEksporTertutup({ ...lengkap, jumlahTerpilih: 0 })

    expect(alasan).toContain('Centang')
  })
})

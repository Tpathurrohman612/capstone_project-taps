import { describe, expect, it } from 'vitest'
import { alasanEksporTertutup } from './alasan-ekspor'

/**
 * Alasan tombol ekspor tertutup.
 *
 * Yang dijaga di sini: setiap keadaan yang menonaktifkan tombol harus punya
 * penjelasannya, dan keadaan yang mengaktifkannya tidak boleh menyisakan
 * penjelasan yang menggantung.
 */

describe('alasanEksporTertutup', () => {
  it('meminta memilih fakultas ketika masih Semua', () => {
    const alasan = alasanEksporTertutup({ fakultas: 'Semua', jumlahSiap: 5 })

    expect(alasan).toContain('Fakultas')
  })

  it('mendahulukan pemilihan fakultas daripada ketiadaan laporan', () => {
    // Menyebut "belum ada laporan" sebelum fakultasnya dipilih akan menyesatkan,
    // karena jumlahnya memang selalu nol selama belum ada fakultas yang dipilih.
    const alasan = alasanEksporTertutup({ fakultas: 'Semua', jumlahSiap: 0 })

    expect(alasan).toContain('Fakultas')
    expect(alasan).not.toContain('Lolos Pemeriksaan')
  })

  it('menyebut status yang dibutuhkan ketika fakultas sudah dipilih', () => {
    const alasan = alasanEksporTertutup({
      fakultas: 'Fakultas Sains dan Teknologi',
      jumlahSiap: 0,
    })

    expect(alasan).toContain('Lolos Pemeriksaan')
    expect(alasan).toContain('Fakultas Sains dan Teknologi')
  })

  it('tidak memberi alasan ketika ekspor memang dapat dijalankan', () => {
    expect(
      alasanEksporTertutup({ fakultas: 'Fakultas Sains dan Teknologi', jumlahSiap: 3 }),
    ).toBeUndefined()
  })
})

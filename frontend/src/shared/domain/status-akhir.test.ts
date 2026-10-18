import { describe, expect, it } from 'vitest'
import { isTerminal, nextStatuses, REPORT_STATUSES } from './report-status'

/**
 * Status akhir dan status yang menunggu mahasiswa.
 *
 * Layar Administrator menurunkan tombol tindakannya dari status laporan.
 * Sebelumnya status Ditolak jatuh ke cabang terakhir rantai pemilihnya dan
 * tetap menawarkan Perbarui Status, padahal laporan yang ditolak tidak dapat
 * dipindahkan ke mana pun. Yang diuji di sini adalah sifat status itu sendiri,
 * karena dari sifat itulah tombolnya diturunkan.
 */

describe('status akhir', () => {
  it('menyatakan Ditolak dan Selesai sebagai status akhir', () => {
    expect(isTerminal('Ditolak')).toBe(true)
    expect(isTerminal('Selesai')).toBe(true)
  })

  it('tidak menyatakan status jalur utama sebagai akhir', () => {
    for (const status of [
      'Menunggu Pemeriksaan',
      'Lolos Pemeriksaan',
      'Diteruskan ke Fakultas',
      'Ditindaklanjuti',
    ] as const) {
      expect(isTerminal(status), `${status} bukan status akhir`).toBe(false)
    }
  })

  it('tidak menyediakan perpindahan apa pun dari status akhir', () => {
    // Inilah sebabnya tombol tindakan tidak boleh muncul: tidak ada tujuan
    // yang dapat dipilihnya.
    for (const status of REPORT_STATUSES) {
      if (!isTerminal(status)) continue
      expect(nextStatuses(status), `${status} tidak boleh memiliki lanjutan`).toEqual([])
    }
  })

  it('tidak mengizinkan Administrator memindahkan laporan yang menunggu mahasiswa', () => {
    // Perlu Dilengkapi hanya dapat dipindahkan mahasiswa yang
    // melengkapinya, sehingga Administrator tidak boleh ditawari tindakan.
    expect(nextStatuses('Perlu Dilengkapi', 'Administrator')).toEqual([])
    expect(nextStatuses('Perlu Dilengkapi', 'Mahasiswa').length).toBeGreaterThan(0)
  })

  it('menyediakan lanjutan bagi setiap status yang bukan akhir dan bukan menunggu mahasiswa', () => {
    for (const status of REPORT_STATUSES) {
      if (isTerminal(status) || status === 'Perlu Dilengkapi') continue
      expect(
        nextStatuses(status, 'Administrator').length,
        `${status} harus memiliki lanjutan bagi Administrator`,
      ).toBeGreaterThan(0)
    }
  })
})

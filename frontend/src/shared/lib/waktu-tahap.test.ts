import { describe, expect, it } from 'vitest'
import { judulRiwayat, waktuTahap } from './waktu-tahap'

/**
 * Waktu tahap pada lini status.
 *
 * Pengujian ini menjaga satu kesepakatan: judul yang ditulis ketika riwayat
 * disimpan harus sama dengan judul yang dicari ketika lini status dibaca.
 * Ketika keduanya berbeda, tidak ada yang gagal — lini status hanya diam-diam
 * menyatakan belum ada catatan waktu.
 */

const catatan = (title: string, time: string) => ({ title, time, text: '' })

describe('waktuTahap', () => {
  it('mengambil waktu dari catatan riwayat yang sesuai', () => {
    const riwayat = [catatan(judulRiwayat('Lolos Pemeriksaan'), '18 Oktober 2026, 10:00')]

    expect(waktuTahap({ riwayat, status: 'Lolos Pemeriksaan', indeks: 1, tahapSekarang: 1 })).toBe(
      '18 Oktober 2026, 10:00',
    )
  })

  it('memakai judul yang sama dengan yang ditulis saat menyimpan riwayat', () => {
    // Inilah kesepakatan yang pernah putus: riwayat ditulis sebagai
    // "Status menjadi Menunggu Pemeriksaan", sedangkan lini status mencari "Laporan
    // diterima", sehingga tidak pernah cocok.
    expect(judulRiwayat('Menunggu Pemeriksaan')).toBe('Status menjadi Menunggu Pemeriksaan')
  })

  it('menyatakan menunggu pembaruan untuk tahap yang belum dilalui', () => {
    expect(waktuTahap({ riwayat: [], status: 'Selesai', indeks: 4, tahapSekarang: 1 })).toBe(
      'Menunggu pembaruan',
    )
  })

  it('menyatakan belum ada catatan waktu untuk tahap yang sudah dilalui tanpa riwayat', () => {
    // Laporan lama dibuat sebelum riwayatnya tersimpan, dan itu berbeda dari
    // tahap yang memang belum tercapai.
    expect(
      waktuTahap({ riwayat: [], status: 'Menunggu Pemeriksaan', indeks: 0, tahapSekarang: 1 }),
    ).toBe('Belum ada catatan waktu')
  })

  it('tidak tertukar antartahap', () => {
    const riwayat = [
      catatan(judulRiwayat('Menunggu Pemeriksaan'), '18 Oktober 2026, 09:00'),
      catatan(judulRiwayat('Lolos Pemeriksaan'), '18 Oktober 2026, 10:00'),
    ]

    expect(
      waktuTahap({ riwayat, status: 'Menunggu Pemeriksaan', indeks: 0, tahapSekarang: 1 }),
    ).toBe('18 Oktober 2026, 09:00')
    expect(waktuTahap({ riwayat, status: 'Lolos Pemeriksaan', indeks: 1, tahapSekarang: 1 })).toBe(
      '18 Oktober 2026, 10:00',
    )
  })

  it('mengabaikan catatan yang waktunya kosong', () => {
    const riwayat = [catatan(judulRiwayat('Menunggu Pemeriksaan'), '')]

    expect(
      waktuTahap({ riwayat, status: 'Menunggu Pemeriksaan', indeks: 0, tahapSekarang: 0 }),
    ).toBe('Belum ada catatan waktu')
  })
})

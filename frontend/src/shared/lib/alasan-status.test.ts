import { describe, expect, it } from 'vitest'
import { alasanStatus } from './alasan-status'

/**
 * Pengambil alasan Administrator.
 *
 * Alasan penolakan dan permintaan kelengkapan hanya tersimpan sebagai
 * keterangan riwayat. Yang diuji di sini adalah apakah alasan yang benar yang
 * terambil ketika laporan beberapa kali berpindah status, dan apakah
 * ketiadaan alasan dinyatakan sebagai tidak ada, bukan sebagai teks kosong.
 */

const catatan = (title: string, text: string, time = '18 Oktober 2026, 10:00') => ({
  time,
  title,
  text,
})

describe('alasanStatus', () => {
  it('mengambil alasan permintaan kelengkapan', () => {
    const riwayat = [
      catatan(
        'Status menjadi Perlu Informasi Tambahan',
        'Administrator meminta kelengkapan. Alasan: Bukti belum terbaca',
      ),
    ]

    expect(alasanStatus(riwayat, 'Perlu Informasi Tambahan')).toBe('Bukti belum terbaca')
  })

  it('mengambil alasan penolakan', () => {
    const riwayat = [catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan: Di luar lingkup')]

    expect(alasanStatus(riwayat, 'Ditolak')).toBe('Di luar lingkup')
  })

  it('mengambil permintaan terbaru ketika laporan dua kali diminta dilengkapi', () => {
    // Laporan dapat berulang kali dikembalikan; yang berlaku selalu permintaan
    // terakhir, bukan yang pertama.
    const riwayat = [
      catatan(
        'Status menjadi Perlu Informasi Tambahan',
        'Administrator meminta kelengkapan. Alasan: Permintaan kedua',
      ),
      catatan('Status menjadi Diterima', 'Mahasiswa melengkapi laporan. Sudah saya tambahkan.'),
      catatan(
        'Status menjadi Perlu Informasi Tambahan',
        'Administrator meminta kelengkapan. Alasan: Permintaan pertama',
      ),
    ]

    expect(alasanStatus(riwayat, 'Perlu Informasi Tambahan')).toBe('Permintaan kedua')
  })

  it('tidak mengambil alasan dari status yang berbeda', () => {
    const riwayat = [catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan: Di luar lingkup')]

    expect(alasanStatus(riwayat, 'Perlu Informasi Tambahan')).toBeUndefined()
  })

  it('mengembalikan keterangan apa adanya bila tidak berpola Alasan', () => {
    // Catatan lama ditulis tanpa pola itu, dan menghilangkannya sama saja
    // menyembunyikan satu-satunya penjelasan yang ada.
    const riwayat = [catatan('Status menjadi Ditolak', 'Laporan tidak memenuhi syarat')]

    expect(alasanStatus(riwayat, 'Ditolak')).toBe('Laporan tidak memenuhi syarat')
  })

  it('mempertahankan kata Alasan yang muncul di dalam alasannya sendiri', () => {
    const riwayat = [
      catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan: Alasan: tidak jelas'),
    ]

    expect(alasanStatus(riwayat, 'Ditolak')).toBe('Alasan: tidak jelas')
  })

  it('menyatakan tidak ada alasan ketika keterangannya kosong', () => {
    expect(alasanStatus([catatan('Status menjadi Ditolak', '   ')], 'Ditolak')).toBeUndefined()
    expect(alasanStatus([], 'Ditolak')).toBeUndefined()
  })

  it('menyatakan tidak ada alasan ketika hanya berisi kata Alasan tanpa isi', () => {
    const riwayat = [catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan:   ')]

    expect(alasanStatus(riwayat, 'Ditolak')).toBeUndefined()
  })
})

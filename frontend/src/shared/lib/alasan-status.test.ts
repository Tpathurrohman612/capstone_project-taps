import { describe, expect, it } from 'vitest'
import { alasanStatus, catatanKelengkapan, kelengkapanTerakhir } from './alasan-status'

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
        'Status menjadi Perlu Dilengkapi',
        'Administrator meminta kelengkapan. Alasan: Bukti belum terbaca',
      ),
    ]

    expect(alasanStatus(riwayat, 'Perlu Dilengkapi')).toBe('Bukti belum terbaca')
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
        'Status menjadi Perlu Dilengkapi',
        'Administrator meminta kelengkapan. Alasan: Permintaan kedua',
      ),
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Sudah saya tambahkan.',
      ),
      catatan(
        'Status menjadi Perlu Dilengkapi',
        'Administrator meminta kelengkapan. Alasan: Permintaan pertama',
      ),
    ]

    expect(alasanStatus(riwayat, 'Perlu Dilengkapi')).toBe('Permintaan kedua')
  })

  it('tidak mengambil alasan dari status yang berbeda', () => {
    const riwayat = [catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan: Di luar lingkup')]

    expect(alasanStatus(riwayat, 'Perlu Dilengkapi')).toBeUndefined()
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

describe('catatanKelengkapan', () => {
  it('mengambil kelengkapan yang dikirim mahasiswa', () => {
    const riwayat = [
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Tangkapan layar sudah saya lampirkan.',
      ),
    ]

    expect(catatanKelengkapan(riwayat)).toEqual([
      { waktu: '18 Oktober 2026, 10:00', penjelasan: 'Tangkapan layar sudah saya lampirkan.' },
    ])
  })

  it('tidak mencampurnya dengan catatan Administrator', () => {
    // Keduanya tersimpan pada koleksi yang sama, dan tanpa pemisahan ini
    // alasan penolakan akan ikut terbaca sebagai kelengkapan mahasiswa.
    const riwayat = [
      catatan(
        'Status menjadi Perlu Dilengkapi',
        'Administrator meminta kelengkapan. Alasan: Kurang bukti',
      ),
      catatan('Status menjadi Menunggu Pemeriksaan', 'Mahasiswa melengkapi laporan. Ini buktinya.'),
      catatan('Status menjadi Lolos Pemeriksaan', 'Laporan diverifikasi.'),
    ]

    expect(catatanKelengkapan(riwayat)).toEqual([
      { waktu: '18 Oktober 2026, 10:00', penjelasan: 'Ini buktinya.' },
    ])
  })

  it('mengembalikan seluruh kelengkapan ketika laporan dua kali dilengkapi', () => {
    const riwayat = [
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Kedua',
        '18 Oktober 2026, 11:00',
      ),
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Pertama',
        '18 Oktober 2026, 09:00',
      ),
    ]

    expect(catatanKelengkapan(riwayat).map((item) => item.penjelasan)).toEqual(['Kedua', 'Pertama'])
  })

  it('mengabaikan kelengkapan yang penjelasannya kosong', () => {
    const riwayat = [
      catatan('Status menjadi Menunggu Pemeriksaan', 'Mahasiswa melengkapi laporan.   '),
    ]

    expect(catatanKelengkapan(riwayat)).toEqual([])
  })

  it('mengembalikan daftar kosong ketika laporan belum pernah dilengkapi', () => {
    expect(catatanKelengkapan([])).toEqual([])
  })
})

describe('kelengkapanTerakhir', () => {
  it('mengambil kelengkapan terbaru saja', () => {
    // Isian mahasiswa diisi lebih dahulu dengan keterangan terakhirnya, maka
    // keterangan terakhir itu sudah memuat seluruh keterangan sebelumnya.
    // Menampilkan setiap pengiriman akan mengulang isi yang sama.
    const riwayat = [
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Pertama\n\nKedua',
        '18 Oktober 2026, 11:00',
      ),
      catatan(
        'Status menjadi Menunggu Pemeriksaan',
        'Mahasiswa melengkapi laporan. Pertama',
        '18 Oktober 2026, 09:00',
      ),
    ]

    expect(kelengkapanTerakhir(riwayat)).toEqual({
      waktu: '18 Oktober 2026, 11:00',
      penjelasan: 'Pertama\n\nKedua',
    })
  })

  it('menyatakan tidak ada ketika laporan belum pernah dilengkapi', () => {
    expect(kelengkapanTerakhir([])).toBeUndefined()
    expect(
      kelengkapanTerakhir([catatan('Status menjadi Ditolak', 'Laporan ditolak. Alasan: X')]),
    ).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import { notificationMessage, type ReportNotification } from './notification-repository'

/**
 * Penyusunan kalimat notifikasi.
 *
 * Pembacaan dan penandaan sudah dibaca diuji terhadap basis data sungguhan
 * pada notification-repository.emulator.test.ts. Berkas ini menguji bagian
 * yang tidak memerlukan jaringan.
 */

const notifikasi = (ubah: Partial<ReportNotification> = {}): ReportNotification => ({
  id: 'riwayat-1',
  idLaporan: 'dok-laporan-1',
  status: 'Diverifikasi',
  keterangan: '',
  waktu: new Date('2026-10-18T03:00:00Z'),
  dibacaPada: undefined,
  belumDibaca: true,
  ...ubah,
})

describe('notificationMessage', () => {
  it('menyebut nomor laporan yang dilihat pengguna, bukan pengenal dokumen', () => {
    const pesan = notificationMessage(notifikasi(), 'LT-2026-0007')

    expect(pesan).toContain('LT-2026-0007')
    expect(pesan).not.toContain('dok-laporan-1')
  })

  it('memakai keterangan dari riwayat bila ada', () => {
    const pesan = notificationMessage(
      notifikasi({ keterangan: 'Bukti pendukung telah diperiksa' }),
      'LT-2026-0007',
    )

    expect(pesan).toBe('LT-2026-0007: Bukti pendukung telah diperiksa')
  })

  it('menyusun kalimat dari statusnya ketika keterangan kosong', () => {
    const pesan = notificationMessage(notifikasi({ status: 'Selesai' }), 'LT-2026-0007')

    expect(pesan).toBe('Status LT-2026-0007 diperbarui menjadi Selesai.')
  })

  it('tetap dapat dibaca ketika nomor laporan belum diketahui', () => {
    // Nomor belum diketahui bila daftar laporan sedang dimuat. Kalimatnya
    // tidak boleh berubah menjadi "undefined".
    const pesan = notificationMessage(notifikasi(), undefined)

    expect(pesan).not.toContain('undefined')
    expect(pesan).toContain('Laporan')
  })

  it('menyusun kalimat untuk setiap status tanpa menyisakan nilai kosong', () => {
    for (const status of [
      'Perlu Informasi Tambahan',
      'Ditolak',
      'Menunggu Validasi',
      'Sedang Diproses',
    ] as const) {
      const pesan = notificationMessage(notifikasi({ status }), 'LT-2026-0001')
      expect(pesan).toContain(status)
      expect(pesan).not.toContain('undefined')
    }
  })
})

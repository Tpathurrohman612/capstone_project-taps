import { describe, expect, it } from 'vitest'
import {
  checkTransition,
  findTransition,
  HASIL_VALIDASI,
  isHasilValidasi,
  isReportStatus,
  isTerminal,
  nextStatuses,
  REPORT_STATUSES,
  STATUS_META,
  STATUS_TRANSITIONS,
  statusesInOrder,
  type ReportStatus,
} from './report-status'

describe('daftar status (Tabel 4.1)', () => {
  it('memuat tepat tujuh status sesuai proposal', () => {
    expect(REPORT_STATUSES).toHaveLength(7)
    expect([...REPORT_STATUSES]).toEqual([
      'Menunggu Pemeriksaan',
      'Perlu Dilengkapi',
      'Ditolak',
      'Lolos Pemeriksaan',
      'Diteruskan ke Fakultas',
      'Ditindaklanjuti',
      'Selesai',
    ])
  })

  it('memakai nama "Ditindaklanjuti", bukan "Diproses"', () => {
    // Prototipe awal memakai "Diproses" sehingga tidak cocok dengan Tabel 4.1.
    expect(REPORT_STATUSES).toContain('Ditindaklanjuti')
    expect(REPORT_STATUSES as readonly string[]).not.toContain('Diproses')
  })

  it('memberi setiap status metadata dengan urutan unik dan berurutan', () => {
    const urutan = REPORT_STATUSES.map((status) => STATUS_META[status].urutan)
    expect(urutan).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(new Set(urutan).size).toBe(urutan.length)
  })

  it('menandai hanya Ditolak dan Selesai sebagai status akhir', () => {
    const terminal = REPORT_STATUSES.filter(isTerminal)
    expect(terminal).toEqual(['Ditolak', 'Selesai'])
  })

  it('mengurutkan status sesuai kolom urutan', () => {
    expect(statusesInOrder()[0]).toBe('Menunggu Pemeriksaan')
    expect(statusesInOrder().at(-1)).toBe('Selesai')
  })
})

describe('pengenal nilai', () => {
  it('menerima status yang sah dan menolak selainnya', () => {
    expect(isReportStatus('Diteruskan ke Fakultas')).toBe(true)
    expect(isReportStatus('Diproses')).toBe(false)
    expect(isReportStatus('')).toBe(false)
    expect(isReportStatus(undefined)).toBe(false)
  })

  it('menerima tiga nilai hasil validasi termasuk Tidak Ada Tanggapan', () => {
    expect([...HASIL_VALIDASI]).toEqual(['Terbukti', 'Tidak Terbukti', 'Tidak Ada Tanggapan'])
    expect(isHasilValidasi('Tidak Ada Tanggapan')).toBe(true)
    expect(isHasilValidasi('Entah')).toBe(false)
  })
})

describe('aturan perpindahan status (Tabel 4.2)', () => {
  it('memuat delapan aturan sesuai tabel', () => {
    expect(STATUS_TRANSITIONS).toHaveLength(8)
  })

  it('hanya mengenal satu aturan pembuatan laporan baru', () => {
    const baru = STATUS_TRANSITIONS.filter((transition) => transition.dari === null)
    expect(baru).toHaveLength(1)
    expect(baru[0]).toMatchObject({ ke: 'Menunggu Pemeriksaan', dipicuOleh: 'Mahasiswa' })
  })

  it('tidak memuat aturan duplikat untuk pasangan dari-ke yang sama', () => {
    const pasangan = STATUS_TRANSITIONS.map((t) => `${t.dari}->${t.ke}`)
    expect(new Set(pasangan).size).toBe(pasangan.length)
  })

  it('tidak pernah berpindah ke status yang sama', () => {
    expect(STATUS_TRANSITIONS.every((t) => t.dari !== t.ke)).toBe(true)
  })

  it('hanya merujuk status yang terdaftar', () => {
    for (const transition of STATUS_TRANSITIONS) {
      if (transition.dari !== null) expect(isReportStatus(transition.dari)).toBe(true)
      expect(isReportStatus(transition.ke)).toBe(true)
    }
  })

  it('membuat setiap status dapat dicapai dari laporan baru', () => {
    const tercapai = new Set<ReportStatus>()
    const antre: (ReportStatus | null)[] = [null]

    while (antre.length > 0) {
      const sekarang = antre.shift() as ReportStatus | null
      for (const berikut of nextStatuses(sekarang)) {
        if (!tercapai.has(berikut)) {
          tercapai.add(berikut)
          antre.push(berikut)
        }
      }
    }

    expect([...tercapai].sort()).toEqual([...REPORT_STATUSES].sort())
  })
})

describe('cacat alur yang disoroti dosen', () => {
  it('tidak mengizinkan laporan Ditolak kembali menjadi Menunggu Pemeriksaan', () => {
    // Activity Diagram lama memungkinkan laporan yang ditolak masuk kembali ke
    // alur verifikasi. Hanya Perlu Dilengkapi yang boleh kembali.
    const hasil = checkTransition({
      dari: 'Ditolak',
      ke: 'Menunggu Pemeriksaan',
      oleh: 'Mahasiswa',
    })
    expect(hasil.diizinkan).toBe(false)
    expect(nextStatuses('Ditolak')).toEqual([])
  })

  it('tidak mengizinkan laporan Selesai berpindah ke mana pun', () => {
    expect(nextStatuses('Selesai')).toEqual([])
    for (const status of REPORT_STATUSES) {
      expect(findTransition('Selesai', status)).toBeUndefined()
    }
  })

  it('mengizinkan Perlu Dilengkapi kembali menjadi Menunggu Pemeriksaan oleh Mahasiswa', () => {
    const hasil = checkTransition({
      dari: 'Perlu Dilengkapi',
      ke: 'Menunggu Pemeriksaan',
      oleh: 'Mahasiswa',
    })
    expect(hasil.diizinkan).toBe(true)
  })

  it('menyediakan jalur Tidak Ada Tanggapan tanpa status tambahan', () => {
    // Fakultas yang tidak menjawab tetap berakhir di Ditindaklanjuti, dengan
    // ketiadaan tanggapan dicatat pada hasil_validasi.
    const hasil = checkTransition({
      dari: 'Diteruskan ke Fakultas',
      ke: 'Ditindaklanjuti',
      oleh: 'Administrator',
      data: { hasil_validasi: 'Tidak Ada Tanggapan', unit_validator: 'FST' },
    })
    expect(hasil.diizinkan).toBe(true)
  })
})

describe('pemeriksaan peran pemicu', () => {
  it('menolak Mahasiswa memverifikasi laporannya sendiri', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Lolos Pemeriksaan',
      oleh: 'Mahasiswa',
    })
    expect(hasil).toEqual({
      diizinkan: false,
      alasan: 'Perpindahan ke Lolos Pemeriksaan hanya dapat dilakukan oleh Administrator.',
    })
  })

  it('menolak Administrator melengkapi laporan menggantikan Mahasiswa', () => {
    const hasil = checkTransition({
      dari: 'Perlu Dilengkapi',
      ke: 'Menunggu Pemeriksaan',
      oleh: 'Administrator',
    })
    expect(hasil.diizinkan).toBe(false)
  })

  it('menolak perpindahan yang tidak ada di tabel', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Selesai',
      oleh: 'Administrator',
    })
    expect(hasil.diizinkan).toBe(false)
    if (!hasil.diizinkan) expect(hasil.alasan).toContain('tidak diizinkan')
  })
})

describe('syarat wajib tiap perpindahan', () => {
  it('menolak penolakan tanpa alasan', () => {
    const tanpa = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Ditolak',
      oleh: 'Administrator',
    })
    expect(tanpa.diizinkan).toBe(false)
    if (!tanpa.diizinkan) expect(tanpa.alasan).toContain('alasan')

    const dengan = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Ditolak',
      oleh: 'Administrator',
      data: { alasan: 'Bukti tidak relevan' },
    })
    expect(dengan.diizinkan).toBe(true)
  })

  it('menolak permintaan kelengkapan tanpa alasan', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Perlu Dilengkapi',
      oleh: 'Administrator',
      data: {},
    })
    expect(hasil.diizinkan).toBe(false)
  })

  it('memperlakukan teks berisi spasi saja sebagai kosong', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Ditolak',
      oleh: 'Administrator',
      data: { alasan: '   ' },
    })
    expect(hasil.diizinkan).toBe(false)
  })

  it('memperlakukan null sebagai kosong', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Ditolak',
      oleh: 'Administrator',
      data: { alasan: null },
    })
    expect(hasil.diizinkan).toBe(false)
  })

  it('menuntut unit tujuan dan kanal pengiriman sebelum Diteruskan ke Fakultas', () => {
    const kurang = checkTransition({
      dari: 'Lolos Pemeriksaan',
      ke: 'Diteruskan ke Fakultas',
      oleh: 'Administrator',
      data: { unit_tujuan: 'FST' },
    })
    expect(kurang.diizinkan).toBe(false)
    if (!kurang.diizinkan) expect(kurang.alasan).toContain('kanal_pengiriman')

    const lengkap = checkTransition({
      dari: 'Lolos Pemeriksaan',
      ke: 'Diteruskan ke Fakultas',
      oleh: 'Administrator',
      data: { unit_tujuan: 'FST', kanal_pengiriman: 'Email' },
    })
    expect(lengkap.diizinkan).toBe(true)
  })

  it('menuntut hasil validasi dan unit validator sebelum Ditindaklanjuti', () => {
    const kurang = checkTransition({
      dari: 'Diteruskan ke Fakultas',
      ke: 'Ditindaklanjuti',
      oleh: 'Administrator',
      data: { hasil_validasi: 'Terbukti' },
    })
    expect(kurang.diizinkan).toBe(false)
    if (!kurang.diizinkan) expect(kurang.alasan).toContain('unit_validator')
  })

  it('menuntut tindak lanjut sebelum Selesai', () => {
    const kurang = checkTransition({
      dari: 'Ditindaklanjuti',
      ke: 'Selesai',
      oleh: 'Administrator',
      data: {},
    })
    expect(kurang.diizinkan).toBe(false)

    const lengkap = checkTransition({
      dari: 'Ditindaklanjuti',
      ke: 'Selesai',
      oleh: 'Administrator',
      data: { tindak_lanjut: 'Teguran tertulis kepada tutor' },
    })
    expect(lengkap.diizinkan).toBe(true)
  })

  it('tidak menuntut syarat tambahan pada verifikasi', () => {
    const hasil = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Lolos Pemeriksaan',
      oleh: 'Administrator',
    })
    expect(hasil.diizinkan).toBe(true)
  })
})

describe('alur penuh sesuai Activity Diagram', () => {
  it('menempuh jalur utama dari pengiriman sampai selesai', () => {
    const langkah: {
      ke: ReportStatus
      oleh: 'Mahasiswa' | 'Administrator'
      data?: Record<string, unknown>
    }[] = [
      { ke: 'Menunggu Pemeriksaan', oleh: 'Mahasiswa' },
      { ke: 'Lolos Pemeriksaan', oleh: 'Administrator' },
      {
        ke: 'Diteruskan ke Fakultas',
        oleh: 'Administrator',
        data: { unit_tujuan: 'FST', kanal_pengiriman: 'Email' },
      },
      {
        ke: 'Ditindaklanjuti',
        oleh: 'Administrator',
        data: { hasil_validasi: 'Terbukti', unit_validator: 'FST' },
      },
      { ke: 'Selesai', oleh: 'Administrator', data: { tindak_lanjut: 'Pembinaan tutor' } },
    ]

    let sekarang: ReportStatus | null = null

    for (const { ke, oleh, data } of langkah) {
      const hasil = checkTransition({ dari: sekarang, ke, oleh, data })
      expect(hasil.diizinkan, `gagal pada perpindahan ke ${ke}`).toBe(true)
      sekarang = ke
    }

    expect(sekarang).toBe('Selesai')
    expect(isTerminal('Selesai')).toBe(true)
  })

  it('menempuh jalur kelengkapan lalu kembali ke alur utama', () => {
    const minta = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Perlu Dilengkapi',
      oleh: 'Administrator',
      data: { alasan: 'Tangkapan layar tidak terbaca' },
    })
    expect(minta.diizinkan).toBe(true)

    const lengkapi = checkTransition({
      dari: 'Perlu Dilengkapi',
      ke: 'Menunggu Pemeriksaan',
      oleh: 'Mahasiswa',
    })
    expect(lengkapi.diizinkan).toBe(true)

    const verifikasi = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Lolos Pemeriksaan',
      oleh: 'Administrator',
    })
    expect(verifikasi.diizinkan).toBe(true)
  })

  it('mengakhiri alur pada penolakan', () => {
    const tolak = checkTransition({
      dari: 'Menunggu Pemeriksaan',
      ke: 'Ditolak',
      oleh: 'Administrator',
      data: { alasan: 'Bukan permasalahan layanan tutor' },
    })
    expect(tolak.diizinkan).toBe(true)
    expect(nextStatuses('Ditolak')).toEqual([])
  })
})

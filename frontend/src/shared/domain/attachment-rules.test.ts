import { describe, expect, it } from 'vitest'
import {
  checkAttachments,
  formatFileSize,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  MAX_UNCOMPRESSIBLE_BYTES,
  MAX_UNCOMPRESSIBLE_LABEL,
} from './attachment-rules'

const MB = 1024 * 1024

/**
 * Berkas uji. Tipe gambar dipakai sebagai bawaan karena sebagian besar bukti
 * pendukung berupa tangkapan layar, dan hanya gambar yang tunduk pada batas
 * 5 MB; berkas lain dibatasi lebih ketat karena tidak dapat dimampatkan.
 */
const berkas = (name: string, size = 1024, type = 'image/png') => ({ name, size, type })

describe('formatFileSize', () => {
  it('menulis ukuran kecil dalam byte', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('menulis ukuran menengah dalam kilobyte', () => {
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('membulatkan kilobyte ke atas sehingga tidak pernah menulis 0 KB', () => {
    expect(formatFileSize(1025)).toBe('1 KB')
  })

  it('menulis ukuran besar dalam megabyte dengan koma desimal', () => {
    expect(formatFileSize(5 * MB)).toBe('5,0 MB')
    expect(formatFileSize(Math.round(1.5 * MB))).toBe('1,5 MB')
  })
})

describe('batas ukuran berkas', () => {
  it('menerima berkas tepat pada batas', () => {
    // Batasnya inklusif: 5 MB pas harus diterima, bukan ditolak.
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('pas.pdf', MAX_FILE_SIZE_BYTES)],
    })

    expect(hasil.diterima).toBe(true)
  })

  it('menolak berkas satu byte di atas batas', () => {
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('lebih.pdf', MAX_FILE_SIZE_BYTES + 1)],
    })

    expect(hasil.diterima).toBe(false)
    if (!hasil.diterima) {
      expect(hasil.alasan).toContain('5 MB')
      expect(hasil.alasan).toContain('lebih.pdf')
    }
  })

  it('menyebut seluruh berkas yang melebihi batas, bukan hanya yang pertama', () => {
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('a.pdf', 6 * MB), berkas('b.pdf', 7 * MB)],
    })

    if (!hasil.diterima) {
      expect(hasil.alasan).toContain('a.pdf')
      expect(hasil.alasan).toContain('b.pdf')
    }
  })

  it('tidak menerima sebagian ketika ada satu berkas yang terlalu besar', () => {
    // Menerima sebagiannya diam-diam membuat pengguna mengira seluruh
    // berkasnya terkirim.
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('kecil.png', 1024), berkas('besar.pdf', 9 * MB)],
    })

    expect(hasil.diterima).toBe(false)
    expect(hasil.berkas).toEqual([])
  })
})

describe('keterangan batas sama dengan batas sesungguhnya', () => {
  it('menuliskan batas gambar persis seperti nilainya', () => {
    // Keterangan di layar dan pemeriksaan di kode harus menyebut angka yang
    // sama. Perbedaan di antara keduanya membuat penolakan terasa sewenang
    // wenang bagi pengguna.
    expect(MAX_FILE_SIZE_LABEL).toBe(`${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`)
  })

  it('menuliskan batas berkas tak-termampatkan persis seperti nilainya', () => {
    expect(MAX_UNCOMPRESSIBLE_LABEL).toBe(`${MAX_UNCOMPRESSIBLE_BYTES / 1024} KB`)
  })

  it('menjaga batas tak-termampatkan tetap muat di dalam satu dokumen', () => {
    // Base64 memperbesar sekitar sepertiga; hasilnya harus tetap di bawah
    // batas keras satu megabyte per dokumen Firestore.
    expect(Math.ceil((MAX_UNCOMPRESSIBLE_BYTES * 4) / 3)).toBeLessThan(1024 * 1024)
  })
})

describe('batas berkas yang tidak dapat dimampatkan', () => {
  it('menolak PDF yang melebihi batas penyimpanan', () => {
    // PDF tidak dapat dimampatkan, sehingga ukurannya tidak akan berubah
    // sebelum disimpan sebagai base64 di dalam dokumen Firestore.
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('besar.pdf', MAX_UNCOMPRESSIBLE_BYTES + 1, 'application/pdf')],
    })

    expect(hasil.diterima).toBe(false)
    if (!hasil.diterima) {
      expect(hasil.alasan).toContain('tidak dapat dimampatkan')
      expect(hasil.alasan).toContain('besar.pdf')
    }
  })

  it('menerima PDF yang masih di bawah batas', () => {
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('kecil.pdf', 200 * 1024, 'application/pdf')],
    })

    expect(hasil.diterima).toBe(true)
  })

  it('tetap menerima gambar besar karena akan dimampatkan', () => {
    // Pengguna tidak perlu memperkecil tangkapan layarnya sendiri.
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [berkas('tangkapan.png', 4 * MB, 'image/png')],
    })

    expect(hasil.diterima).toBe(true)
  })

  it('memperlakukan berkas tanpa tipe sebagai tidak dapat dimampatkan', () => {
    // Tanpa tipe, tidak ada dasar untuk menjanjikan pemampatan berhasil.
    const hasil = checkAttachments({
      sudahAda: [],
      tambahan: [{ name: 'entah.bin', size: MAX_UNCOMPRESSIBLE_BYTES + 1 }],
    })

    expect(hasil.diterima).toBe(false)
  })
})

describe('batas jumlah berkas', () => {
  const lima = Array.from({ length: MAX_FILE_COUNT }, (_, i) => berkas(`berkas-${i}.pdf`))

  it('menerima tepat lima berkas', () => {
    const hasil = checkAttachments({ sudahAda: [], tambahan: lima })

    expect(hasil.diterima).toBe(true)
    expect(hasil.berkas).toHaveLength(MAX_FILE_COUNT)
  })

  it('menolak berkas keenam', () => {
    const hasil = checkAttachments({ sudahAda: lima, tambahan: [berkas('keenam.pdf')] })

    expect(hasil.diterima).toBe(false)
    if (!hasil.diterima) expect(hasil.alasan).toContain('batas 5 berkas')
  })

  it('menyebut sisa kuota ketika penambahan melebihi batas', () => {
    const hasil = checkAttachments({
      sudahAda: lima.slice(0, 3),
      tambahan: [berkas('x.pdf'), berkas('y.pdf'), berkas('z.pdf')],
    })

    expect(hasil.diterima).toBe(false)
    if (!hasil.diterima) expect(hasil.alasan).toContain('Tersisa 2')
  })

  it('mempertahankan daftar lama ketika penambahan ditolak', () => {
    const hasil = checkAttachments({ sudahAda: lima, tambahan: [berkas('keenam.pdf')] })

    expect(hasil.berkas).toHaveLength(MAX_FILE_COUNT)
    expect(hasil.berkas.map((item) => item.name)).not.toContain('keenam.pdf')
  })
})

describe('berkas kosong', () => {
  it('menolak berkas berukuran nol', () => {
    const hasil = checkAttachments({ sudahAda: [], tambahan: [berkas('rusak.pdf', 0)] })

    expect(hasil.diterima).toBe(false)
    if (!hasil.diterima) expect(hasil.alasan).toContain('kosong')
  })
})

describe('berkas berulang', () => {
  it('tidak menambahkan berkas dengan nama yang sudah ada', () => {
    const hasil = checkAttachments({
      sudahAda: [berkas('sama.pdf')],
      tambahan: [berkas('sama.pdf')],
    })

    expect(hasil.diterima).toBe(true)
    expect(hasil.berkas).toHaveLength(1)
  })

  it('tidak menghitung berkas berulang terhadap batas jumlah', () => {
    // Memilih ulang berkas yang sama tidak boleh menghabiskan kuota.
    const lima = Array.from({ length: MAX_FILE_COUNT }, (_, i) => berkas(`b-${i}.pdf`))
    const hasil = checkAttachments({ sudahAda: lima, tambahan: [berkas('b-0.pdf')] })

    expect(hasil.diterima).toBe(true)
    expect(hasil.berkas).toHaveLength(MAX_FILE_COUNT)
  })
})

describe('penambahan bertahap', () => {
  it('menggabungkan berkas baru dengan yang sudah ada', () => {
    const hasil = checkAttachments({
      sudahAda: [berkas('satu.png')],
      tambahan: [berkas('dua.png')],
    })

    expect(hasil.berkas.map((item) => item.name)).toEqual(['satu.png', 'dua.png'])
  })

  it('menerima daftar tambahan kosong tanpa mengubah apa pun', () => {
    const hasil = checkAttachments({ sudahAda: [berkas('satu.png')], tambahan: [] })

    expect(hasil.diterima).toBe(true)
    expect(hasil.berkas).toHaveLength(1)
  })
})

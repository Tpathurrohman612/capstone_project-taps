import { describe, expect, it } from 'vitest'
import {
  hitungDimensi,
  isCompressibleImage,
  langkahPemampatan,
  MAX_BASE64_BYTES,
  MAX_IMAGE_SIDE,
  MAX_STORED_FILE_BYTES,
  MIN_IMAGE_SIDE,
  muatDalamDokumen,
  perkiraanByteBase64,
  QUALITY_STEPS,
} from './image-compression'

/**
 * Bagian pemampatan yang dapat diuji tanpa kanvas.
 *
 * Penggambaran ke kanvas memerlukan peramban sungguhan dan tidak diuji di
 * sini. Yang diuji adalah keputusannya: berapa dimensi hasilnya, urutan
 * percobaan mana yang ditempuh, dan apakah hasilnya masih muat di dalam satu
 * dokumen Firestore.
 */

describe('batas penyimpanan', () => {
  it('menyisakan ruang terhadap batas satu megabyte Firestore', () => {
    // Batas keras Firestore 1 MiB per dokumen. Memakai seluruhnya berisiko,
    // karena field lain pada dokumen yang sama juga memakan tempat.
    expect(MAX_BASE64_BYTES).toBeLessThan(1024 * 1024)
    expect(MAX_BASE64_BYTES).toBeGreaterThan(500 * 1024)
  })

  it('menurunkan batas berkas asli sesuai pembengkakan base64', () => {
    // base64 memperbesar sekitar sepertiga, sehingga berkas asli harus lebih
    // kecil daripada batas base64-nya.
    expect(MAX_STORED_FILE_BYTES).toBeLessThan(MAX_BASE64_BYTES)
    expect(Math.round((MAX_BASE64_BYTES * 3) / 4)).toBeCloseTo(MAX_STORED_FILE_BYTES, -1)
  })

  it('menerima data yang muat dan menolak yang melewati batas', () => {
    expect(muatDalamDokumen('a'.repeat(MAX_BASE64_BYTES))).toBe(true)
    expect(muatDalamDokumen('a'.repeat(MAX_BASE64_BYTES + 1))).toBe(false)
  })
})

describe('hitungDimensi', () => {
  it('tidak mengubah gambar yang sudah lebih kecil dari batas', () => {
    // Memperbesar hanya menambah ukuran berkas tanpa menambah informasi.
    expect(hitungDimensi({ lebar: 800, tinggi: 600 }, 1600)).toEqual({
      lebar: 800,
      tinggi: 600,
    })
  })

  it('mengecilkan sisi terpanjang tepat ke batas', () => {
    expect(hitungDimensi({ lebar: 3200, tinggi: 2400 }, 1600)).toEqual({
      lebar: 1600,
      tinggi: 1200,
    })
  })

  it('mempertahankan rasio pada gambar tegak', () => {
    const hasil = hitungDimensi({ lebar: 1200, tinggi: 3600 }, 1200)

    expect(hasil.tinggi).toBe(1200)
    expect(hasil.lebar).toBe(400)
    expect(hasil.tinggi / hasil.lebar).toBeCloseTo(3, 1)
  })

  it('tidak menghasilkan sisi nol pada gambar yang sangat memanjang', () => {
    // Pembulatan ke bawah pada rasio ekstrem dapat menghasilkan nol, dan
    // kanvas berukuran nol melempar galat.
    const hasil = hitungDimensi({ lebar: 10000, tinggi: 3 }, 640)

    expect(hasil.lebar).toBeGreaterThan(0)
    expect(hasil.tinggi).toBeGreaterThan(0)
  })

  it('menangani dimensi tidak sah tanpa melempar galat', () => {
    expect(hitungDimensi({ lebar: 0, tinggi: 0 }, 1600)).toEqual({ lebar: 0, tinggi: 0 })
    expect(hitungDimensi({ lebar: -5, tinggi: 100 }, 1600)).toEqual({ lebar: 0, tinggi: 0 })
  })

  it('memperlakukan gambar tepat pada batas sebagai sudah pas', () => {
    expect(hitungDimensi({ lebar: 1600, tinggi: 900 }, 1600)).toEqual({
      lebar: 1600,
      tinggi: 900,
    })
  })
})

describe('perkiraanByteBase64', () => {
  it('menghitung ukuran dari teks base64 polos', () => {
    // "AAAA" adalah empat karakter base64 yang mewakili tiga byte.
    expect(perkiraanByteBase64('AAAA')).toBe(3)
  })

  it('memperhitungkan padding', () => {
    expect(perkiraanByteBase64('AAA=')).toBe(2)
    expect(perkiraanByteBase64('AA==')).toBe(1)
  })

  it('mengabaikan awalan data URL', () => {
    expect(perkiraanByteBase64('data:image/jpeg;base64,AAAA')).toBe(3)
  })

  it('mengembalikan nol untuk teks kosong', () => {
    expect(perkiraanByteBase64('')).toBe(0)
  })
})

describe('isCompressibleImage', () => {
  it('menerima tipe gambar yang dapat digambar ke kanvas', () => {
    expect(isCompressibleImage('image/jpeg')).toBe(true)
    expect(isCompressibleImage('image/png')).toBe(true)
    expect(isCompressibleImage('IMAGE/PNG')).toBe(true)
  })

  it('menolak berkas yang tidak dapat dimampatkan', () => {
    expect(isCompressibleImage('application/pdf')).toBe(false)
    expect(isCompressibleImage('')).toBe(false)
  })
})

describe('langkahPemampatan', () => {
  const langkah = langkahPemampatan()

  it('mencoba mutu tertinggi lebih dulu pada dimensi terbesar', () => {
    expect(langkah[0]).toEqual({ sisi: MAX_IMAGE_SIDE, mutu: QUALITY_STEPS[0] })
  })

  it('menurunkan mutu sebelum mengecilkan dimensi', () => {
    // Mengecilkan dimensi lebih merusak keterbacaan daripada menurunkan mutu,
    // sehingga seluruh mutu dicoba lebih dulu pada dimensi yang sama.
    const sisiPertama = langkah.slice(0, QUALITY_STEPS.length)

    expect(sisiPertama.every((item) => item.sisi === MAX_IMAGE_SIDE)).toBe(true)
    expect(sisiPertama.map((item) => item.mutu)).toEqual([...QUALITY_STEPS])
  })

  it('tidak pernah mengecilkan di bawah batas keterbacaan', () => {
    expect(langkah.every((item) => item.sisi >= MIN_IMAGE_SIDE)).toBe(true)
  })

  it('menurunkan dimensi secara bertahap, bukan sekaligus', () => {
    const sisiUnik = [...new Set(langkah.map((item) => item.sisi))]

    expect(sisiUnik.length).toBeGreaterThan(1)
    for (let i = 1; i < sisiUnik.length; i += 1) {
      const sebelumnya = sisiUnik[i - 1] as number
      const sekarang = sisiUnik[i] as number
      expect(sekarang).toBeLessThan(sebelumnya)
      // Penurunan tidak boleh lebih dari separuh, agar tidak melompat jauh.
      expect(sekarang).toBeGreaterThan(sebelumnya / 2)
    }
  })

  it('berakhir, tidak menghasilkan percobaan tanpa batas', () => {
    expect(langkah.length).toBeGreaterThan(0)
    expect(langkah.length).toBeLessThan(100)
  })

  it('mengurut mutu menurun di dalam setiap dimensi', () => {
    const perSisi = new Map<number, number[]>()
    for (const { sisi, mutu } of langkah) {
      perSisi.set(sisi, [...(perSisi.get(sisi) ?? []), mutu])
    }

    for (const mutu of perSisi.values()) {
      expect([...mutu].sort((a, b) => b - a)).toEqual(mutu)
    }
  })
})

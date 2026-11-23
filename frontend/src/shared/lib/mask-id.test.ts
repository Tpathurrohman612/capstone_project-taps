import { describe, expect, it } from 'vitest'
import { maskId, MASK_PREFIX_LENGTH, MASK_SUFFIX_LENGTH } from './mask-id'

const UID = 'H4BFf63TqZUIhuWLP9jXRcYVvwk2'

describe('maskId', () => {
  it('memendekkan Firebase UID menjadi awal dan akhirnya', () => {
    expect(maskId(UID)).toBe('H4B…vwk2')
  })

  it('tidak menampilkan bagian tengah pengenal', () => {
    const hasil = maskId(UID) as string

    expect(hasil).not.toContain('Ff63TqZUIhuWLP9jXRcY')
    expect(hasil.length).toBeLessThan(UID.length)
  })

  it('mempertahankan awal dan akhir apa adanya', () => {
    // Keduanya dipakai mencocokkan satu akun dengan catatan lain, sehingga
    // tidak boleh ikut berubah.
    const hasil = maskId(UID) as string

    expect(hasil.startsWith(UID.slice(0, MASK_PREFIX_LENGTH))).toBe(true)
    expect(hasil.endsWith(UID.slice(-MASK_SUFFIX_LENGTH))).toBe(true)
  })

  it('mengembalikan pengenal pendek apa adanya', () => {
    // Memendekkannya justru menghasilkan teks yang lebih panjang daripada
    // aslinya dan tidak menyembunyikan apa pun.
    expect(maskId('abc123')).toBe('abc123')
    expect(maskId('abcd1234')).toBe('abcd1234')
  })

  it('memendekkan begitu pengenal cukup panjang', () => {
    expect(maskId('abcd12345')).toBe('abc…2345')
  })

  it('membuang spasi di tepi sebelum memendekkan', () => {
    expect(maskId(`  ${UID}  `)).toBe('H4B…vwk2')
  })

  it('mengembalikan undefined untuk nilai yang tidak ada', () => {
    // Layar menampilkan "Belum diisi" untuk nilai yang tidak ada, sehingga
    // teks kosong tidak boleh dikembalikan sebagai pengenal yang sah.
    expect(maskId(null)).toBeUndefined()
    expect(maskId(undefined)).toBeUndefined()
    expect(maskId('')).toBeUndefined()
    expect(maskId('   ')).toBeUndefined()
  })

  it('memakai satu karakter elipsis, bukan tiga titik', () => {
    // Tiga titik berurutan mudah terbaca sebagai bagian dari pengenalnya.
    const hasil = maskId(UID) as string

    expect(hasil).toContain('…')
    expect(hasil).not.toContain('...')
  })
})

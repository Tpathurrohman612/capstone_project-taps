import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Penyelarasan foto profil.
 *
 * Foto hanya tersimpan saat identitas pertama kali didaftarkan, sehingga akun
 * lama tidak akan pernah memilikinya. Yang dijaga di sini terutama satu hal:
 * penyelarasan ini berjalan pada setiap kali masuk, sehingga menulis ketika
 * fotonya tidak berubah akan menghabiskan kuota tulis harian tanpa mengubah
 * apa pun.
 */

const mockSetDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => ({ args }),
  getDoc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: () => 'waktu-server',
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}))

vi.mock('../../../shared/lib/firebase', () => ({
  db: {},
  isFirebaseConfigured: () => true,
}))

const { selaraskanFotoProfil } = await import('./user-profile')

const profil = {
  uid: 'uid-mahasiswa',
  email: 'mahasiswa@contoh.ac.id',
  nim: '12345678900',
  faculty: 'Fakultas Sains dan Teknologi' as const,
}

describe('selaraskanFotoProfil', () => {
  beforeEach(() => {
    mockSetDoc.mockReset()
    mockSetDoc.mockResolvedValue(undefined)
  })

  it('menyimpan foto ketika profil lama belum memilikinya', async () => {
    const hasil = await selaraskanFotoProfil({
      uid: profil.uid,
      fotoUrl: 'https://contoh/foto.jpg',
      profil,
    })

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    expect(hasil?.fotoUrl).toBe('https://contoh/foto.jpg')
  })

  it('tidak menulis apa pun ketika fotonya sudah sama', async () => {
    // Penyelarasan berjalan pada setiap kali masuk. Menulis tanpa perubahan
    // akan menghabiskan kuota tulis harian.
    const hasil = await selaraskanFotoProfil({
      uid: profil.uid,
      fotoUrl: 'https://contoh/foto.jpg',
      profil: { ...profil, fotoUrl: 'https://contoh/foto.jpg' },
    })

    expect(mockSetDoc).not.toHaveBeenCalled()
    expect(hasil?.fotoUrl).toBe('https://contoh/foto.jpg')
  })

  it('memperbarui ketika pengguna mengganti foto akun Google-nya', async () => {
    const hasil = await selaraskanFotoProfil({
      uid: profil.uid,
      fotoUrl: 'https://contoh/baru.jpg',
      profil: { ...profil, fotoUrl: 'https://contoh/lama.jpg' },
    })

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    expect(hasil?.fotoUrl).toBe('https://contoh/baru.jpg')
  })

  it('tidak menghapus foto yang ada ketika akun Google tidak memberikannya', async () => {
    // Akun tanpa foto mengirim null, dan itu bukan alasan membuang foto yang
    // sudah tersimpan.
    const lama = { ...profil, fotoUrl: 'https://contoh/lama.jpg' }

    const hasil = await selaraskanFotoProfil({ uid: profil.uid, fotoUrl: null, profil: lama })

    expect(mockSetDoc).not.toHaveBeenCalled()
    expect(hasil?.fotoUrl).toBe('https://contoh/lama.jpg')
  })

  it('tidak menulis ketika penggunanya belum memiliki profil', async () => {
    // Pengguna baru belum melengkapi identitas; fotonya ikut tersimpan nanti
    // bersama NIM dan fakultasnya.
    const hasil = await selaraskanFotoProfil({
      uid: profil.uid,
      fotoUrl: 'https://contoh/foto.jpg',
      profil: null,
    })

    expect(mockSetDoc).not.toHaveBeenCalled()
    expect(hasil).toBeNull()
  })
})

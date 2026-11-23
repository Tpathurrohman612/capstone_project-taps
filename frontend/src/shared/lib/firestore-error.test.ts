import { describe, expect, it } from 'vitest'
import { isPermissionDenied, jelaskanGalatFirestore } from './firestore-error'

/**
 * Penerjemah galat Firestore.
 *
 * Pesan bawaan "Missing or insufficient permissions" benar tetapi tidak
 * membantu: ia tidak menyebutkan izin mana yang kurang maupun apa yang harus
 * dilakukan. Yang diuji di sini adalah apakah penjelasannya memang dapat
 * ditindaklanjuti, dan apakah keterangan asli tetap terjaga ketika galatnya
 * tidak dikenali.
 */

const galatKode = (code: string, message = '') => Object.assign(new Error(message), { code })

describe('isPermissionDenied', () => {
  it('mengenali kode permission-denied dari SDK', () => {
    expect(isPermissionDenied(galatKode('permission-denied'))).toBe(true)
  })

  it('mengenali bentuk huruf besar dari REST', () => {
    expect(isPermissionDenied(galatKode('PERMISSION_DENIED'))).toBe(true)
  })

  it('mengenali dari pesannya ketika kode tidak tersedia', () => {
    expect(isPermissionDenied(new Error('Missing or insufficient permissions.'))).toBe(true)
  })

  it('tidak salah mengenali galat lain', () => {
    expect(isPermissionDenied(galatKode('unavailable'))).toBe(false)
    expect(isPermissionDenied(new Error('jaringan putus'))).toBe(false)
    expect(isPermissionDenied(null)).toBe(false)
    expect(isPermissionDenied(undefined)).toBe(false)
  })
})

describe('jelaskanGalatFirestore', () => {
  const ditolak = galatKode('permission-denied', 'Missing or insufficient permissions.')

  it('menyebutkan langkah yang harus diambil saat Administrator belum terdaftar', () => {
    const pesan = jelaskanGalatFirestore(ditolak, 'daftar-laporan-administrator')

    expect(pesan).toContain('administrator')
    expect(pesan).toContain('UID')
    expect(pesan).not.toContain('insufficient')
  })

  it('menyebutkan larangan menangani laporan sendiri saat perubahan status ditolak', () => {
    const pesan = jelaskanGalatFirestore(ditolak, 'ubah-status')

    expect(pesan).toContain('dibuatnya sendiri')
  })

  it('mengarahkan mahasiswa untuk masuk kembali', () => {
    expect(jelaskanGalatFirestore(ditolak, 'daftar-laporan-mahasiswa')).toContain('masuk kembali')
  })

  it('memberi penjelasan umum ketika konteksnya tidak disebut', () => {
    expect(jelaskanGalatFirestore(ditolak)).toContain('peran akun')
  })

  it('menerjemahkan galat jaringan menjadi langkah yang jelas', () => {
    expect(jelaskanGalatFirestore(galatKode('unavailable'))).toContain('koneksi internet')
  })

  it('menyebut kuota ketika basis data menolak karena habis', () => {
    expect(jelaskanGalatFirestore(galatKode('resource-exhausted'))).toContain('Kuota')
  })

  it('menyebut indeks ketika pemeriksaan awal gagal', () => {
    // Kueri yang menuntut composite index gagal dengan kode ini, dan itu
    // persoalan yang pernah membuat laporan tidak pernah terbaca.
    expect(jelaskanGalatFirestore(galatKode('failed-precondition'))).toContain('indeks')
  })

  it('mempertahankan keterangan asli untuk galat yang tidak dikenali', () => {
    // Mengganti galat asing dengan kalimat umum menghilangkan satu-satunya
    // petunjuk justru ketika paling dibutuhkan.
    const pesan = jelaskanGalatFirestore(new Error('Dokumen melebihi ukuran maksimum'))

    expect(pesan).toBe('Dokumen melebihi ukuran maksimum')
  })

  it('tetap memberi kalimat yang dapat dibaca untuk galat tanpa pesan', () => {
    expect(jelaskanGalatFirestore({})).toBeTruthy()
    expect(jelaskanGalatFirestore(null)).toBeTruthy()
  })

  it('mengabaikan awalan firestore pada kodenya', () => {
    expect(jelaskanGalatFirestore(galatKode('firestore/unavailable'))).toContain('koneksi internet')
  })
})

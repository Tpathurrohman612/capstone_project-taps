import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

/**
 * Pengujian alur identitas mahasiswa.
 *
 * Pengujian unit sebelumnya menguji modul satu per satu dan tidak menemukan
 * cacat berikut: setelah autentikasi berpindah ke Firebase, layar masih
 * membaca NIM dari localStorage, sehingga mahasiswa yang identitasnya sudah
 * lengkap terus dialihkan ke halaman lengkapi identitas dan laporan tidak
 * pernah dapat dibuat.
 *
 * Cacat itu hidup di sambungan antara autentikasi dan layar, bukan di dalam
 * salah satu modulnya. Berkas ini menguji sambungan tersebut: pertanyaannya
 * bukan "apakah fungsi ini benar" melainkan "ke mana aplikasi membawa
 * pengguna pada keadaan ini".
 */

const mockAuth = vi.fn()

vi.mock('../../../shared/lib/auth-context', () => ({
  useAuth: () => mockAuth(),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('../../auth/lib/google-account', () => ({
  getActiveStudentNim: () => undefined,
  getActiveStudentFaculty: () => undefined,
  getActiveGoogleAccountEmail: () => 'simulasi@contoh.ac.id',
}))

const { useStudentIdentity } = await import('./student-identity')

/** Komponen kecil yang menampilkan keputusan hook agar dapat diperiksa. */
function Penampil() {
  const identity = useStudentIdentity()

  return (
    <dl>
      <dt>memuat</dt>
      <dd data-testid="memuat">{String(identity.memuat)}</dd>
      <dt>lengkap</dt>
      <dd data-testid="lengkap">{String(identity.lengkap)}</dd>
      <dt>nim</dt>
      <dd data-testid="nim">{identity.nim ?? '-'}</dd>
      <dt>ownerKey</dt>
      <dd data-testid="owner">{identity.ownerKey ?? '-'}</dd>
      <dt>fakultas</dt>
      <dd data-testid="fakultas">{identity.fakultas ?? '-'}</dd>
    </dl>
  )
}

const bacaan = () => ({
  memuat: screen.getByTestId('memuat').textContent,
  lengkap: screen.getByTestId('lengkap').textContent,
  nim: screen.getByTestId('nim').textContent,
  owner: screen.getByTestId('owner').textContent,
  fakultas: screen.getByTestId('fakultas').textContent,
})

describe('useStudentIdentity pada mode firebase', () => {
  beforeEach(() => {
    mockAuth.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('menyatakan identitas lengkap ketika profil sudah tersimpan', () => {
    // Inilah keadaan yang dulu salah dibaca: pengguna sudah melengkapi
    // identitas, tetapi layar menganggapnya belum.
    mockAuth.mockReturnValue({
      mode: 'firebase',
      loading: false,
      user: { uid: 'uid-123', email: 'mhs@ecampus.ut.ac.id', displayName: 'Sidiq' },
      profile: {
        uid: 'uid-123',
        email: 'mhs@ecampus.ut.ac.id',
        nim: '041111111',
        faculty: 'Fakultas Sains dan Teknologi',
      },
    })

    render(<Penampil />)

    expect(bacaan()).toMatchObject({
      memuat: 'false',
      lengkap: 'true',
      nim: '041111111',
      owner: 'uid-123',
      fakultas: 'Fakultas Sains dan Teknologi',
    })
  })

  it('memakai Firebase UID sebagai kunci pemilik laporan, bukan NIM', () => {
    // Kepemilikan laporan diperiksa aturan keamanan lewat uid_pelapor, sehingga
    // kunci pemilik wajib UID. Memakai NIM membuat setiap pembuatan laporan
    // ditolak server.
    mockAuth.mockReturnValue({
      mode: 'firebase',
      loading: false,
      user: { uid: 'uid-123', email: 'a@b.c' },
      profile: {
        uid: 'uid-123',
        email: 'a@b.c',
        nim: '041111111',
        faculty: 'Fakultas Sains dan Teknologi',
      },
    })

    render(<Penampil />)

    expect(bacaan().owner).toBe('uid-123')
    expect(bacaan().owner).not.toBe('041111111')
  })

  it('menyatakan masih memuat ketika status masuk belum diketahui', () => {
    // Selama memuat, layar harus menunggu. Mengalihkan halaman pada saat ini
    // justru yang menyebabkan mahasiswa terlempar ke lengkapi identitas.
    mockAuth.mockReturnValue({ mode: 'firebase', loading: true, user: null, profile: null })

    render(<Penampil />)

    expect(bacaan().memuat).toBe('true')
    expect(bacaan().lengkap).toBe('false')
  })

  it('menyatakan identitas belum lengkap ketika profil belum ada', () => {
    mockAuth.mockReturnValue({
      mode: 'firebase',
      loading: false,
      user: { uid: 'uid-baru', email: 'baru@ecampus.ut.ac.id' },
      profile: null,
    })

    render(<Penampil />)

    expect(bacaan()).toMatchObject({ memuat: 'false', lengkap: 'false', nim: '-' })
  })

  it('menyatakan belum lengkap ketika pengguna belum masuk', () => {
    mockAuth.mockReturnValue({ mode: 'firebase', loading: false, user: null, profile: null })

    render(<Penampil />)

    expect(bacaan()).toMatchObject({ lengkap: 'false', owner: '-' })
  })

  it('tidak membaca identitas dari localStorage pada mode firebase', () => {
    // Tiruan google-account mengembalikan undefined untuk NIM. Bila hook masih
    // memakainya, identitas akan terbaca belum lengkap padahal profil ada.
    mockAuth.mockReturnValue({
      mode: 'firebase',
      loading: false,
      user: { uid: 'uid-123', email: 'a@b.c' },
      profile: {
        uid: 'uid-123',
        email: 'a@b.c',
        nim: '041111111',
        faculty: 'Fakultas Sains dan Teknologi',
      },
    })

    render(<Penampil />)

    expect(bacaan().lengkap).toBe('true')
  })

  it('meneruskan program studi dan UT daerah dari profil', () => {
    mockAuth.mockReturnValue({
      mode: 'firebase',
      loading: false,
      user: { uid: 'uid-123', email: 'a@b.c' },
      profile: {
        uid: 'uid-123',
        email: 'a@b.c',
        nim: '041111111',
        faculty: 'Fakultas Sains dan Teknologi',
        programStudi: 'Sistem Informasi',
        utDaerah: 'UT Jakarta',
      },
    })

    function Tambahan() {
      const identity = useStudentIdentity()
      return (
        <>
          <span data-testid="prodi">{identity.programStudi ?? '-'}</span>
          <span data-testid="daerah">{identity.utDaerah ?? '-'}</span>
        </>
      )
    }

    render(<Tambahan />)

    expect(screen.getByTestId('prodi').textContent).toBe('Sistem Informasi')
    expect(screen.getByTestId('daerah').textContent).toBe('UT Jakarta')
  })
})

describe('useStudentIdentity pada mode simulasi', () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockAuth.mockReturnValue({ mode: 'simulasi', loading: false, user: null, profile: null })
  })

  it('tidak pernah menyatakan sedang memuat', () => {
    // Mode simulasi membaca peramban secara serentak, sehingga layar tidak
    // boleh menunggu sesuatu yang tidak akan pernah tiba.
    render(<Penampil />)
    expect(bacaan().memuat).toBe('false')
  })

  it('menyatakan belum lengkap ketika peramban tidak menyimpan NIM', () => {
    render(<Penampil />)
    expect(bacaan().lengkap).toBe('false')
  })
})

import { useAuth } from '../../../shared/lib/auth-context'
import {
  getActiveGoogleAccountEmail,
  getActiveStudentFaculty,
  getActiveStudentNim,
} from '../../auth/lib/google-account'

/**
 * Identitas mahasiswa yang sedang masuk.
 *
 * Sebelumnya setiap layar memanggil getActiveStudentNim() yang membaca
 * localStorage. Setelah autentikasi berpindah ke Firebase, NIM tersimpan pada
 * koleksi `pengguna` di Firestore dan bukan lagi di peramban, sehingga
 * pemanggilan lama selalu mengembalikan undefined. Akibatnya mahasiswa yang
 * identitasnya sudah lengkap tetap dilempar ke halaman lengkapi identitas, dan
 * laporan tidak pernah dapat dibuat.
 *
 * Hook ini menjadi satu-satunya sumber identitas bagi layar, dan memilih
 * sumbernya sesuai mode yang sedang aktif.
 */

export type StudentIdentity = {
  /** Pengenal pemilik laporan. Firebase UID pada mode firebase. */
  ownerKey: string | undefined
  nim: string | undefined
  nama: string | undefined
  email: string | undefined
  fakultas: string | undefined
  programStudi: string | undefined
  utDaerah: string | undefined
  /** Benar selama identitas masih dimuat, sehingga layar tidak salah menyimpulkan. */
  memuat: boolean
  /** Benar bila identitas sudah lengkap dan laporan boleh dibuat. */
  lengkap: boolean
}

export function useStudentIdentity(): StudentIdentity {
  const { mode, loading, user, profile } = useAuth()

  if (mode === 'firebase') {
    return {
      ownerKey: user?.uid,
      nim: profile?.nim,
      nama: profile?.displayName ?? user?.displayName ?? undefined,
      email: user?.email ?? undefined,
      fakultas: profile?.faculty,
      programStudi: profile?.programStudi,
      utDaerah: profile?.utDaerah,
      memuat: loading,
      // Identitas dianggap lengkap hanya bila profil benar-benar terbaca.
      // Selama masih memuat, jawabannya belum lengkap tetapi `memuat` bernilai
      // benar, sehingga layar menunggu alih-alih mengalihkan halaman.
      lengkap: Boolean(user && profile?.nim),
    }
  }

  const nim = getActiveStudentNim()

  return {
    ownerKey: nim,
    nim,
    nama: undefined,
    email: getActiveGoogleAccountEmail(),
    fakultas: getActiveStudentFaculty(),
    programStudi: undefined,
    utDaerah: undefined,
    memuat: false,
    lengkap: nim !== undefined,
  }
}

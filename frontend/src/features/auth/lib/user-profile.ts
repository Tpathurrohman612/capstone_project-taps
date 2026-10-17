import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../../shared/lib/firebase'
import { FACULTIES, type Faculty } from '../../../shared/data/faculties'

/**
 * Profil pengguna di Cloud Firestore.
 *
 * Dokumen `pengguna/{uid}` memakai Firebase UID sebagai pengenal, sesuai
 * pemetaan ERD pada subbab 3.3.3 proposal. Field `role` sengaja tidak pernah
 * ditulis dari sini: peran Administrator ditentukan oleh koleksi
 * `administrator` yang diperiksa firestore.rules, bukan oleh data kiriman
 * klien.
 */

export const USERS_COLLECTION = 'pengguna'
export const NIM_INDEX_COLLECTION = 'nim_terpakai'

export type UserProfile = {
  uid: string
  email: string
  nim: string
  faculty: Faculty
  displayName?: string
  // Dua field berikut ada pada entitas pengguna di ERD Gambar 3.3 dan dipakai
  // pada halaman Profil. Keduanya opsional karena akun lama belum mengisinya.
  programStudi?: string
  utDaerah?: string
}

export class ProfileNotConfiguredError extends Error {
  constructor() {
    super('Firebase belum dikonfigurasi, profil tidak dapat dibaca atau disimpan.')
    this.name = 'ProfileNotConfiguredError'
  }
}

/** Dilempar saat NIM sudah terkunci pada akun Google lain. */
export class NimAlreadyLinkedError extends Error {
  constructor() {
    super(
      'NIM sudah terdaftar pada akun lain. Silakan gunakan akun Google yang ' +
        'telah terhubung dengan NIM tersebut.',
    )
    this.name = 'NimAlreadyLinkedError'
  }
}

/** Dilempar saat akun Google ini sudah terkunci pada NIM yang berbeda. */
export class AccountAlreadyLinkedError extends Error {
  constructor(existingNim: string) {
    super(`Akun Google ini sudah terhubung dengan NIM ${existingNim}.`)
    this.name = 'AccountAlreadyLinkedError'
  }
}

const isFaculty = (value: unknown): value is Faculty =>
  typeof value === 'string' && (FACULTIES as readonly string[]).includes(value)

/** Membaca profil milik uid. Mengembalikan undefined bila belum pernah dibuat. */
export async function readUserProfile(uid: string): Promise<UserProfile | undefined> {
  if (!isFirebaseConfigured()) throw new ProfileNotConfiguredError()

  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snapshot.exists()) return undefined

  const data = snapshot.data()

  // Dokumen yang tidak lengkap diperlakukan sebagai belum ada, supaya alur
  // lengkapi identitas berjalan lagi dan tidak ada layar yang menerima profil
  // setengah jadi.
  if (typeof data.nim !== 'string' || data.nim === '' || !isFaculty(data.faculty)) {
    return undefined
  }

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : '',
    nim: data.nim,
    faculty: data.faculty,
    ...(typeof data.displayName === 'string' ? { displayName: data.displayName } : {}),
    ...(typeof data.program_studi === 'string' && data.program_studi !== ''
      ? { programStudi: data.program_studi }
      : {}),
    ...(typeof data.ut_daerah === 'string' && data.ut_daerah !== ''
      ? { utDaerah: data.ut_daerah }
      : {}),
  }
}

/**
 * Menautkan satu akun Google dengan satu NIM.
 *
 * Keunikan NIM tidak dapat diperiksa dengan kueri biasa, karena firestore.rules
 * hanya mengizinkan seorang pengguna membaca dokumen `pengguna` miliknya
 * sendiri. Karena itu dipakai koleksi indeks `nim_terpakai/{nim}` yang menyimpan
 * uid pemiliknya. Pembuatan dokumen indeks dan penulisan profil dijalankan
 * dalam satu transaksi, sehingga dua pendaftaran bersamaan atas NIM yang sama
 * tidak mungkin keduanya berhasil.
 */
export async function linkNimToAccount(params: {
  uid: string
  email: string
  nim: string
  faculty: Faculty
  displayName?: string
  programStudi?: string
  utDaerah?: string
}): Promise<UserProfile> {
  if (!isFirebaseConfigured()) throw new ProfileNotConfiguredError()

  const nim = params.nim.trim()
  const profileRef = doc(db, USERS_COLLECTION, params.uid)
  const nimRef = doc(db, NIM_INDEX_COLLECTION, nim)

  await runTransaction(db, async (transaction) => {
    const [existingProfile, existingNim] = await Promise.all([
      transaction.get(profileRef),
      transaction.get(nimRef),
    ])

    const lockedNim = existingProfile.exists() ? existingProfile.data().nim : undefined
    if (typeof lockedNim === 'string' && lockedNim !== '' && lockedNim !== nim) {
      throw new AccountAlreadyLinkedError(lockedNim)
    }

    if (existingNim.exists() && existingNim.data().uid !== params.uid) {
      throw new NimAlreadyLinkedError()
    }

    if (!existingNim.exists()) {
      transaction.set(nimRef, { uid: params.uid, dibuatPada: serverTimestamp() })
    }

    transaction.set(
      profileRef,
      {
        email: params.email,
        nim,
        faculty: params.faculty,
        ...(params.displayName ? { displayName: params.displayName } : {}),
        ...(params.programStudi ? { program_studi: params.programStudi } : {}),
        ...(params.utDaerah ? { ut_daerah: params.utDaerah } : {}),
        diperbaruiPada: serverTimestamp(),
      },
      { merge: true },
    )
  })

  return {
    uid: params.uid,
    email: params.email,
    nim,
    faculty: params.faculty,
    ...(params.displayName ? { displayName: params.displayName } : {}),
    ...(params.programStudi ? { programStudi: params.programStudi } : {}),
    ...(params.utDaerah ? { utDaerah: params.utDaerah } : {}),
  }
}

/** Memperbarui fakultas tanpa menyentuh tautan NIM. */
export async function updateFaculty(uid: string, faculty: Faculty): Promise<void> {
  if (!isFirebaseConfigured()) throw new ProfileNotConfiguredError()

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    { faculty, diperbaruiPada: serverTimestamp() },
    { merge: true },
  )
}

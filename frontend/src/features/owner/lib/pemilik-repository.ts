import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../../shared/lib/firebase'

/**
 * Perkakas Pemilik, di luar lingkup proposal.
 *
 * Seluruh kewenangannya diperiksa ulang oleh aturan keamanan; yang di sini
 * hanya menyusun permintaannya. Aturan itulah yang menentukan apa yang boleh,
 * sehingga tidak ada kewenangan baru yang lahir dari berkas ini.
 */

const PENGGUNA = 'pengguna'
const ADMINISTRATOR = 'administrator'
const NIM_TERPAKAI = 'nim_terpakai'
const LAPORAN = 'laporan'
const PEMILIK = 'pemilik'

/** Koleksi yang menyimpan anakan satu laporan, ditandai field id_laporan. */
const ANAKAN_LAPORAN = [
  'lampiran',
  'riwayat_status_laporan',
  'pengiriman_validasi',
  'validasi',
  'tindak_lanjut',
] as const

export class PemilikTidakSiapError extends Error {
  constructor() {
    super('Firebase belum dikonfigurasi, perkakas Pemilik tidak dapat dipakai.')
    this.name = 'PemilikTidakSiapError'
  }
}

const pastikanSiap = () => {
  if (!isFirebaseConfigured()) throw new PemilikTidakSiapError()
}

/** Apakah akun ini terdaftar sebagai Pemilik. */
export async function isPemilik(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured() || uid === '') return false

  try {
    return (await getDoc(doc(db, 'pemilik', uid))).exists()
  } catch {
    // Aturan menolak pembacaan dokumen milik orang lain, dan penolakan itu
    // berarti bukan Pemilik. Melemparnya akan menjatuhkan seluruh aplikasi.
    return false
  }
}

export type AkunPengguna = {
  uid: string
  nama: string
  email: string
  nim: string
  fakultas: string
  programStudi: string
  administrator: boolean
  pemilik: boolean
}

/** Seluruh akun beserta perannya. */
export async function listAkun(): Promise<AkunPengguna[]> {
  pastikanSiap()

  const [pengguna, administrator, pemilik] = await Promise.all([
    getDocs(collection(db, PENGGUNA)),
    getDocs(collection(db, ADMINISTRATOR)),
    getDocs(collection(db, PEMILIK)),
  ])

  const peranAdmin = new Set(administrator.docs.map((d) => d.id))
  const peranPemilik = new Set(pemilik.docs.map((d) => d.id))
  const teks = (nilai: unknown): string => (typeof nilai === 'string' ? nilai : '')

  return pengguna.docs
    .map((snapshot) => {
      const data = snapshot.data()
      return {
        uid: snapshot.id,
        nama: teks(data.displayName),
        email: teks(data.email),
        nim: teks(data.nim),
        fakultas: teks(data.faculty),
        programStudi: teks(data.program_studi),
        administrator: peranAdmin.has(snapshot.id),
        pemilik: peranPemilik.has(snapshot.id),
      }
    })
    .sort((kiri, kanan) => kiri.nama.localeCompare(kanan.nama, 'id'))
}

/** Mengangkat atau mencabut peran Administrator. */
export async function setAdministrator(uid: string, jadikan: boolean): Promise<void> {
  pastikanSiap()

  if (jadikan) {
    await setDoc(doc(db, ADMINISTRATOR, uid), { uid, dicatatPada: serverTimestamp() })
    return
  }

  await deleteDoc(doc(db, ADMINISTRATOR, uid))
}

/**
 * Menghapus akun beserta jejak perannya dan tautan NIM-nya.
 *
 * Tautan NIM harus ikut dilepas. Tanpa itu NIM tersebut terkunci permanen
 * pada akun yang sudah tidak ada, dan pemiliknya tidak akan pernah dapat
 * mendaftar ulang.
 *
 * Laporan yang pernah dibuatnya sengaja tidak ikut terhapus: laporan adalah
 * catatan penanganan yang berdiri sendiri, dan menghapusnya bersama akun akan
 * menghilangkan jejak penanganan yang mungkin masih dirujuk.
 */
export async function hapusAkun(params: { uid: string; nim: string }): Promise<void> {
  pastikanSiap()

  const tulis = writeBatch(db)
  tulis.delete(doc(db, PENGGUNA, params.uid))
  tulis.delete(doc(db, ADMINISTRATOR, params.uid))
  if (params.nim !== '') tulis.delete(doc(db, NIM_TERPAKAI, params.nim))

  await tulis.commit()
}

/**
 * Menghapus satu laporan beserta seluruh anakannya.
 *
 * Anakan yang tertinggal tidak terlihat di mana pun, tetapi tetap memakan
 * kuota penyimpanan, dan lampiran base64 berukuran ratusan kilobait per
 * berkas. Penghapusannya dilakukan sebelum induknya, sehingga laporan yang
 * masih terlihat selalu berarti anakannya juga masih ada.
 */
export async function hapusLaporan(docId: string): Promise<void> {
  pastikanSiap()

  const anakan = await Promise.all(
    ANAKAN_LAPORAN.map((koleksi) =>
      getDocs(query(collection(db, koleksi), where('id_laporan', '==', docId))),
    ),
  )

  const tulis = writeBatch(db)
  for (const hasil of anakan) {
    for (const snapshot of hasil.docs) tulis.delete(snapshot.ref)
  }
  tulis.delete(doc(db, LAPORAN, docId))

  await tulis.commit()
}

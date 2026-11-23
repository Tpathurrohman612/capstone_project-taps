import { doc, getDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../../shared/lib/firebase'

/**
 * Penentuan peran Administrator.
 *
 * Peran tidak pernah berasal dari data yang dikirim klien. Sumbernya adalah
 * koleksi `administrator`, yang hanya dapat diisi pengelola lewat Firebase
 * Console. firestore.rules mengizinkan seorang pengguna membaca dokumen
 * miliknya sendiri agar antarmuka tahu harus menampilkan halaman yang mana,
 * tetapi menutup `list` dan seluruh penulisan.
 *
 * Hasil pembacaan di sini hanya menentukan tampilan. Setiap akses data tetap
 * diperiksa ulang oleh isAdmin() di dalam rules, yang dievaluasi server pada
 * setiap permintaan, sehingga memanipulasi hasil fungsi ini di peramban tidak
 * memberi akses apa pun.
 */

export const ADMINISTRATOR_COLLECTION = 'administrator'

export async function isAdministrator(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false

  try {
    const snapshot = await getDoc(doc(db, ADMINISTRATOR_COLLECTION, uid))
    return snapshot.exists()
  } catch {
    // Permission denied berarti bukan administrator. Galat jaringan juga
    // diperlakukan sebagai bukan administrator, karena menaikkan peran saat
    // ragu jauh lebih berbahaya daripada menurunkannya.
    return false
  }
}

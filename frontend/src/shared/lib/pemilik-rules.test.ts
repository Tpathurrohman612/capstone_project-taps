import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, deleteDoc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

/**
 * Aturan keamanan peran Pemilik.
 *
 * Peran ini berada di luar lingkup proposal dan hanya dipakai pengembang,
 * tetapi justru karena itu kewenangannya paling luas: menata peran,
 * menghapus akun, dan menghapus laporan. Yang dijaga di sini adalah batas
 * kewenangannya, bukan tampilannya.
 */

/**
 * Emulator tidak selalu berjalan, misalnya pada mesin tanpa JDK. Tanpa
 * pemeriksaan ini seluruh berkas gagal alih-alih dilewati, sehingga
 * `pnpm test` biasa ikut merah.
 */
const emulatorTersedia = async () => {
  try {
    const controller = new AbortController()
    const batas = setTimeout(() => controller.abort(), 1500)
    const jawaban = await fetch('http://127.0.0.1:8080/', { signal: controller.signal })
    clearTimeout(batas)
    return jawaban.ok || jawaban.status === 200 || jawaban.status === 404
  } catch {
    return false
  }
}

const aktif = await emulatorTersedia()

const PEMILIK = 'uid-pemilik'
const ADMIN = 'uid-administrator'
const MAHASISWA = 'uid-mahasiswa'

let env: RulesTestEnvironment

const db = (uid?: string) =>
  (uid === undefined ? env.unauthenticatedContext() : env.authenticatedContext(uid)).firestore()

beforeAll(async () => {
  if (!aktif) return
  env = await initializeTestEnvironment({
    projectId: 'demo-taps',
    firestore: { rules: readFileSync('../firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await env?.cleanup()
})

beforeEach(async () => {
  if (!aktif) return
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (konteks) => {
    const bebas = konteks.firestore()
    await setDoc(doc(bebas, 'pemilik', PEMILIK), { dicatatPada: new Date() })
    await setDoc(doc(bebas, 'administrator', ADMIN), { uid: ADMIN })
    await setDoc(doc(bebas, 'pengguna', MAHASISWA), { nim: '041', email: 'a@b.c' })
    await setDoc(doc(bebas, 'pengguna', PEMILIK), { nim: '042', email: 'p@b.c' })
    await setDoc(doc(bebas, 'nim_terpakai', '041'), { uid: MAHASISWA })
    await setDoc(doc(bebas, 'laporan', 'lap-1'), {
      nomor_laporan: 'LT-2026-0001',
      uid_pelapor: MAHASISWA,
      judul_laporan: 'Judul',
      id_status: 'Menunggu Pemeriksaan',
      tanggal_laporan: new Date(),
    })
  })
})

describe.skipIf(!aktif)('koleksi pemilik', () => {
  it('tidak dapat ditulis siapa pun, termasuk Pemilik sendiri', async () => {
    // Pemilik yang dapat menghapus dokumennya sendiri akan mengunci dirinya
    // keluar, dan yang dapat menambah Pemilik lain memindahkan kendali
    // tertinggi keluar dari Firebase Console.
    await assertFails(setDoc(doc(db(PEMILIK), 'pemilik', 'uid-lain'), { x: 1 }))
    await assertFails(deleteDoc(doc(db(PEMILIK), 'pemilik', PEMILIK)))
    await assertFails(setDoc(doc(db(ADMIN), 'pemilik', ADMIN), { x: 1 }))
  })

  it('hanya dapat dibaca oleh pemiliknya sendiri atau sesama Pemilik', async () => {
    await assertSucceeds(getDoc(doc(db(PEMILIK), 'pemilik', PEMILIK)))
    await assertFails(getDoc(doc(db(ADMIN), 'pemilik', PEMILIK)))
  })

  it('daftarnya terbuka bagi Pemilik, tertutup bagi peran lain', async () => {
    // Konsol perlu menyatakan siapa saja yang memegang peran ini. Menutupnya
    // membuat konsol hanya mampu menandai dirinya sendiri, dan itu
    // menyesatkan ketika Pemiliknya lebih dari satu.
    await assertSucceeds(getDocs(collection(db(PEMILIK), 'pemilik')))
    await assertFails(getDocs(collection(db(ADMIN), 'pemilik')))
    await assertFails(getDocs(collection(db(MAHASISWA), 'pemilik')))
    await assertFails(getDocs(collection(db(), 'pemilik')))
  })
})

describe.skipIf(!aktif)('penataan peran Administrator', () => {
  it('mengizinkan Pemilik mengangkat dan mencabut Administrator', async () => {
    await assertSucceeds(
      setDoc(doc(db(PEMILIK), 'administrator', MAHASISWA), {
        uid: MAHASISWA,
        dicatatPada: new Date(),
      }),
    )
    await assertSucceeds(deleteDoc(doc(db(PEMILIK), 'administrator', ADMIN)))
  })

  it('menolak Administrator mengangkat Administrator lain', async () => {
    // Tanpa ini seorang Administrator dapat memperbanyak dirinya sendiri.
    await assertFails(
      setDoc(doc(db(ADMIN), 'administrator', MAHASISWA), {
        uid: MAHASISWA,
        dicatatPada: new Date(),
      }),
    )
  })

  it('menolak mahasiswa mengangkat dirinya sendiri', async () => {
    await assertFails(
      setDoc(doc(db(MAHASISWA), 'administrator', MAHASISWA), {
        uid: MAHASISWA,
        dicatatPada: new Date(),
      }),
    )
  })

  it('menolak dokumen peran yang memuat field lain', async () => {
    // Dokumennya hanya penanda peran; membiarkannya memuat apa saja
    // menjadikan koleksi peran sebagai tempat penyimpanan bebas.
    await assertFails(
      setDoc(doc(db(PEMILIK), 'administrator', MAHASISWA), {
        uid: MAHASISWA,
        catatan: 'x'.repeat(50),
      }),
    )
  })

  it('mengizinkan Pemilik membaca daftarnya, tetapi tidak yang lain', async () => {
    await assertSucceeds(getDocs(collection(db(PEMILIK), 'administrator')))
    await assertFails(getDocs(collection(db(ADMIN), 'administrator')))
    await assertFails(getDocs(collection(db(MAHASISWA), 'administrator')))
  })
})

describe.skipIf(!aktif)('penghapusan akun', () => {
  it('mengizinkan Pemilik menghapus akun lain beserta tautan NIM-nya', async () => {
    await assertSucceeds(deleteDoc(doc(db(PEMILIK), 'pengguna', MAHASISWA)))
    await assertSucceeds(deleteDoc(doc(db(PEMILIK), 'nim_terpakai', '041')))
  })

  it('menolak Pemilik menghapus akunnya sendiri', async () => {
    // Menghapus profil sendiri membuat aplikasi memperlakukannya sebagai
    // pengguna yang belum melengkapi identitas, sedangkan NIM-nya tetap
    // terkunci pada akun itu.
    await assertFails(deleteDoc(doc(db(PEMILIK), 'pengguna', PEMILIK)))
  })

  it('menolak Administrator maupun mahasiswa menghapus akun', async () => {
    await assertFails(deleteDoc(doc(db(ADMIN), 'pengguna', MAHASISWA)))
    await assertFails(deleteDoc(doc(db(MAHASISWA), 'pengguna', MAHASISWA)))
  })
})

describe.skipIf(!aktif)('penghapusan laporan', () => {
  it('mengizinkan Pemilik menghapus laporan', async () => {
    await assertSucceeds(deleteDoc(doc(db(PEMILIK), 'laporan', 'lap-1')))
  })

  it('menolak Administrator maupun pelapornya sendiri menghapus laporan', async () => {
    // Laporan adalah catatan penanganan; menghapusnya menghilangkan jejak
    // yang justru menjadi tujuan sistem ini.
    await assertFails(deleteDoc(doc(db(ADMIN), 'laporan', 'lap-1')))
    await assertFails(deleteDoc(doc(db(MAHASISWA), 'laporan', 'lap-1')))
  })

  it('menolak pengguna yang tidak masuk melakukan apa pun', async () => {
    await assertFails(deleteDoc(doc(db(), 'laporan', 'lap-1')))
    await assertFails(getDoc(doc(db(), 'pemilik', PEMILIK)))
  })
})

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/**
 * Pengujian aturan keamanan Cloud Firestore.
 *
 * Subbab 3.7 proposal meminta aturan keamanan diuji terpisah menggunakan
 * Firebase Emulator Suite, termasuk skenario penolakan akses baca dan tulis
 * terhadap laporan milik pengguna lain. Berkas ini memenuhi permintaan itu.
 *
 * Menjalankannya memerlukan emulator Firestore yang aktif:
 *
 *   firebase emulators:exec --only firestore \
 *     "corepack pnpm@10.34.3 --dir frontend run test:rules"
 *
 * Emulator Firestore memerlukan JDK 21 atau lebih baru. Bila emulator tidak
 * terdeteksi, seluruh pengujian di berkas ini dilewati dengan pesan yang
 * jelas, bukan gagal, supaya `pnpm test` tetap dapat dijalankan tanpa Java.
 */

const PROJECT_ID = 'lapor-tutor-rules-test'
const HOST = '127.0.0.1'
const PORT = 8080

const UID_MAHASISWA = 'mahasiswa-satu'
const UID_MAHASISWA_LAIN = 'mahasiswa-dua'
const UID_ADMIN = 'administrator-satu'

/** Benar bila emulator Firestore menjawab pada porta yang ditentukan. */
async function emulatorTersedia(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const batas = setTimeout(() => controller.abort(), 1500)
    const jawaban = await fetch(`http://${HOST}:${PORT}/`, { signal: controller.signal })
    clearTimeout(batas)
    return jawaban.ok || jawaban.status === 200 || jawaban.status === 404
  } catch {
    return false
  }
}

const aktif = await emulatorTersedia()

describe.skipIf(!aktif)('aturan keamanan Firestore', () => {
  let env: RulesTestEnvironment

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: HOST,
        port: PORT,
        rules: readFileSync(resolve(__dirname, '../../../../firestore.rules'), 'utf8'),
      },
    })
  })

  afterAll(async () => {
    await env?.cleanup()
  })

  beforeEach(async () => {
    await env.clearFirestore()

    // Data awal ditulis dengan aturan dilewati, supaya penyiapan tidak
    // bergantung pada aturan yang justru sedang diuji.
    await env.withSecurityRulesDisabled(async (konteks) => {
      const db = konteks.firestore()

      await setDoc(doc(db, 'administrator', UID_ADMIN), { catatan: 'penguji' })

      await setDoc(doc(db, 'pengguna', UID_MAHASISWA), {
        email: 'satu@example.ac.id',
        nim: '041111111',
        faculty: 'Fakultas Sains dan Teknologi',
      })

      await setDoc(doc(db, 'laporan', 'laporan-milik-satu'), {
        nomor_laporan: 'LT-2026-0001',
        uid_pelapor: UID_MAHASISWA,
        id_status: 'Menunggu Pemeriksaan',
        judul_laporan: 'Tutor belum memberi umpan balik',
      })

      await setDoc(doc(db, 'nim_terpakai', '041111111'), { uid: UID_MAHASISWA })
    })
  })

  const dbMahasiswa = () => env.authenticatedContext(UID_MAHASISWA).firestore()
  const dbMahasiswaLain = () => env.authenticatedContext(UID_MAHASISWA_LAIN).firestore()
  const dbAdmin = () => env.authenticatedContext(UID_ADMIN).firestore()
  const dbTamu = () => env.unauthenticatedContext().firestore()

  describe('laporan milik pengguna lain', () => {
    it('menolak mahasiswa lain membaca laporan yang bukan miliknya', async () => {
      await assertFails(getDoc(doc(dbMahasiswaLain(), 'laporan', 'laporan-milik-satu')))
    })

    it('menolak mahasiswa lain mengubah laporan yang bukan miliknya', async () => {
      await assertFails(
        updateDoc(doc(dbMahasiswaLain(), 'laporan', 'laporan-milik-satu'), {
          judul_laporan: 'Disunting orang lain',
        }),
      )
    })

    it('mengizinkan pemiliknya membaca laporannya sendiri', async () => {
      await assertSucceeds(getDoc(doc(dbMahasiswa(), 'laporan', 'laporan-milik-satu')))
    })

    it('mengizinkan Administrator membaca laporan siapa pun', async () => {
      await assertSucceeds(getDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-satu')))
    })

    it('menolak pengguna yang belum masuk membaca laporan', async () => {
      await assertFails(getDoc(doc(dbTamu(), 'laporan', 'laporan-milik-satu')))
    })
  })

  describe('Administrator membaca seluruh laporan', () => {
    it('membaca laporan milik mahasiswa lain', async () => {
      await assertSucceeds(getDocs(collection(dbAdmin(), 'laporan')))
    })

    it('tetap berhasil meskipun ada dokumen tanpa uid_pelapor', async () => {
      // Aturan yang memeriksa kepemilikan lebih dulu akan galat pada dokumen
      // semacam ini, dan galat pada aturan menolak seluruh kueri, bukan hanya
      // dokumen itu. Administrator karena itu diperiksa lebih dulu.
      await env.withSecurityRulesDisabled(async (konteks) => {
        await setDoc(doc(konteks.firestore(), 'laporan', 'laporan-rusak'), {
          nomor_laporan: 'LT-2026-9999',
          id_status: 'Menunggu Pemeriksaan',
          judul_laporan: 'Dokumen tanpa pemilik',
        })
      })

      await assertSucceeds(getDocs(collection(dbAdmin(), 'laporan')))
    })

    it('menolak mahasiswa membaca seluruh laporan', async () => {
      await assertFails(getDocs(collection(dbMahasiswa(), 'laporan')))
    })
  })

  describe('pembuatan laporan', () => {
    it('mengizinkan mahasiswa membuat laporan atas namanya sendiri', async () => {
      await assertSucceeds(
        setDoc(doc(dbMahasiswa(), 'laporan', 'laporan-baru'), {
          nomor_laporan: 'LT-2026-0002',
          uid_pelapor: UID_MAHASISWA,
          id_status: 'Menunggu Pemeriksaan',
          judul_laporan: 'Diskusi tidak ditanggapi',
        }),
      )
    })

    it('menolak laporan yang dibuat atas nama orang lain', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'laporan', 'laporan-palsu'), {
          nomor_laporan: 'LT-2026-0003',
          uid_pelapor: UID_MAHASISWA_LAIN,
          id_status: 'Menunggu Pemeriksaan',
          judul_laporan: 'Atas nama orang lain',
        }),
      )
    })

    it('menolak laporan yang lahir dengan status selain Menunggu Pemeriksaan', async () => {
      // Baris pertama Tabel 4.2 menetapkan laporan baru selalu berstatus
      // Menunggu Pemeriksaan, sehingga tidak ada laporan yang melompati verifikasi.
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'laporan', 'laporan-lompat'), {
          nomor_laporan: 'LT-2026-0004',
          uid_pelapor: UID_MAHASISWA,
          id_status: 'Selesai',
          judul_laporan: 'Langsung selesai',
        }),
      )
    })
  })

  describe('perubahan status', () => {
    it('mengizinkan Administrator mengubah status laporan', async () => {
      await assertSucceeds(
        updateDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Lolos Pemeriksaan',
        }),
      )
    })

    it('menolak mahasiswa memverifikasi laporannya sendiri', async () => {
      await assertFails(
        updateDoc(doc(dbMahasiswa(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Lolos Pemeriksaan',
        }),
      )
    })

    it('mengizinkan mahasiswa melengkapi laporan yang diminta kelengkapannya', async () => {
      await env.withSecurityRulesDisabled(async (konteks) => {
        await updateDoc(doc(konteks.firestore(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Perlu Dilengkapi',
        })
      })

      await assertSucceeds(
        updateDoc(doc(dbMahasiswa(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Menunggu Pemeriksaan',
          nomor_laporan: 'LT-2026-0001',
          uid_pelapor: UID_MAHASISWA,
        }),
      )
    })

    it('menolak mahasiswa memindahkan kepemilikan laporannya', async () => {
      await env.withSecurityRulesDisabled(async (konteks) => {
        await updateDoc(doc(konteks.firestore(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Perlu Dilengkapi',
        })
      })

      await assertFails(
        updateDoc(doc(dbMahasiswa(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Menunggu Pemeriksaan',
          nomor_laporan: 'LT-2026-0001',
          uid_pelapor: UID_MAHASISWA_LAIN,
        }),
      )
    })

    it('menolak penghapusan laporan oleh siapa pun', async () => {
      await assertFails(deleteDoc(doc(dbMahasiswa(), 'laporan', 'laporan-milik-satu')))
      await assertFails(deleteDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-satu')))
    })
  })

  describe('Administrator tidak boleh menangani laporan sendiri', () => {
    beforeEach(async () => {
      // Laporan milik Administrator sendiri, mewakili mahasiswa yang kemudian
      // diangkat menjadi Administrator sementara laporan lamanya tetap ada.
      await env.withSecurityRulesDisabled(async (konteks) => {
        await setDoc(doc(konteks.firestore(), 'laporan', 'laporan-milik-admin'), {
          nomor_laporan: 'LT-2026-0500',
          uid_pelapor: UID_ADMIN,
          id_status: 'Menunggu Pemeriksaan',
          judul_laporan: 'Laporan yang dibuat sebelum diangkat',
        })
      })
    })

    it('menolak Administrator memverifikasi laporannya sendiri', async () => {
      await assertFails(
        updateDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-admin'), {
          id_status: 'Lolos Pemeriksaan',
        }),
      )
    })

    it('tetap mengizinkan Administrator memverifikasi laporan orang lain', async () => {
      await assertSucceeds(
        updateDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-satu'), {
          id_status: 'Lolos Pemeriksaan',
        }),
      )
    })

    it('mengizinkan Administrator membaca laporannya sendiri', async () => {
      // Membaca tetap boleh; yang dilarang adalah menanganinya.
      await assertSucceeds(getDoc(doc(dbAdmin(), 'laporan', 'laporan-milik-admin')))
    })

    it('menolak pencatatan hasil validasi atas laporannya sendiri', async () => {
      await assertFails(
        setDoc(doc(dbAdmin(), 'validasi', 'validasi-sendiri'), {
          id_laporan: 'laporan-milik-admin',
          id_pengiriman: 'kirim-1',
          uid_pencatat: UID_ADMIN,
          unit_validator: 'FST',
          hasil_validasi: 'Terbukti',
        }),
      )
    })

    it('menolak pencatatan tindak lanjut atas laporannya sendiri', async () => {
      await assertFails(
        setDoc(doc(dbAdmin(), 'tindak_lanjut', 'tindak-sendiri'), {
          id_laporan: 'laporan-milik-admin',
          uid_pencatat: UID_ADMIN,
          keterangan: 'Selesai sendiri',
        }),
      )
    })
  })

  describe('batas ukuran isian', () => {
    const laporanDasar = {
      nomor_laporan: 'LT-2026-0600',
      uid_pelapor: UID_MAHASISWA,
      id_status: 'Menunggu Pemeriksaan',
      judul_laporan: 'Judul wajar',
    }

    it('menolak judul yang melampaui batas panjang', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'laporan', 'judul-panjang'), {
          ...laporanDasar,
          judul_laporan: 'A'.repeat(201),
        }),
      )
    })

    it('menolak uraian sepanjang hampir satu megabyte', async () => {
      // Tanpa batas, pengiriman semacam ini sah menurut aturan dan dapat
      // diulang sampai kuota basis data habis.
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'laporan', 'uraian-raksasa'), {
          ...laporanDasar,
          deskripsi: 'A'.repeat(900000),
        }),
      )
    })

    it('menolak judul kosong', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'laporan', 'judul-kosong'), {
          ...laporanDasar,
          judul_laporan: '',
        }),
      )
    })

    it('menolak dokumen dengan field berlebihan', async () => {
      const berlebihan: Record<string, unknown> = { ...laporanDasar }
      for (let i = 0; i < 30; i += 1) berlebihan[`tambahan_${i}`] = 'x'

      await assertFails(setDoc(doc(dbMahasiswa(), 'laporan', 'field-banyak'), berlebihan))
    })

    it('tetap menerima laporan berukuran wajar', async () => {
      await assertSucceeds(
        setDoc(doc(dbMahasiswa(), 'laporan', 'wajar'), {
          ...laporanDasar,
          deskripsi: 'Uraian permasalahan yang panjangnya masuk akal.',
          nama_tutor: 'Budi Santoso',
        }),
      )
    })
  })

  describe('allowlist administrator', () => {
    it('menolak pengguna mengangkat dirinya menjadi Administrator', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'administrator', UID_MAHASISWA), { catatan: 'saya admin' }),
      )
    })

    it('mengizinkan pengguna memeriksa status dirinya sendiri', async () => {
      await assertSucceeds(getDoc(doc(dbMahasiswa(), 'administrator', UID_MAHASISWA)))
    })

    it('menolak pengguna mengintip dokumen administrator milik orang lain', async () => {
      await assertFails(getDoc(doc(dbMahasiswa(), 'administrator', UID_ADMIN)))
    })
  })

  describe('profil pengguna', () => {
    it('menolak pembacaan profil milik orang lain', async () => {
      await assertFails(getDoc(doc(dbMahasiswaLain(), 'pengguna', UID_MAHASISWA)))
    })

    it('menolak pengguna menuliskan field role pada profilnya', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswa(), 'pengguna', UID_MAHASISWA), {
          email: 'satu@example.ac.id',
          nim: '041111111',
          faculty: 'Fakultas Sains dan Teknologi',
          role: 'Administrator',
        }),
      )
    })
  })

  describe('penguncian NIM', () => {
    it('menolak penulisan ulang NIM yang sudah dipakai akun lain', async () => {
      await assertFails(
        setDoc(doc(dbMahasiswaLain(), 'nim_terpakai', '041111111'), {
          uid: UID_MAHASISWA_LAIN,
        }),
      )
    })

    it('menolak pelepasan tautan NIM oleh klien', async () => {
      await assertFails(deleteDoc(doc(dbMahasiswa(), 'nim_terpakai', '041111111')))
    })
  })
})

describe.skipIf(aktif)('aturan keamanan Firestore (dilewati)', () => {
  it('memberi tahu cara menjalankannya', () => {
    expect(aktif).toBe(false)
    console.info(
      'Pengujian aturan dilewati: emulator Firestore tidak terdeteksi pada ' +
        `${HOST}:${PORT}. Jalankan "firebase emulators:exec --only firestore ` +
        '\\"corepack pnpm@10.34.3 --dir frontend run test:rules\\"" dengan JDK 21.',
    )
  })
})

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Pengujian notifikasi pada Firebase Emulator Suite.
 *
 * FR-07 menuntut mahasiswa diberi tahu setiap kali status laporannya berubah.
 * Sebelumnya daftar notifikasi berupa dua rekaman yang ditulis di dalam kode,
 * dan penanda sudah dibaca hanya hidup di state React sehingga kembali belum
 * dibaca setiap kali halaman dimuat ulang. Yang diuji di sini justru hal itu:
 * apakah penandaan benar-benar bertahan di basis data.
 */

const PROJECT_ID = 'lapor-tutor-notif-test'
const HOST = '127.0.0.1'
const PORT = 8080

const UID = 'mahasiswa-notif'
const UID_LAIN = 'mahasiswa-lain'

const sebagaiFirestore = (konteks: { firestore: () => unknown }): Firestore =>
  konteks.firestore() as Firestore

async function emulatorTersedia(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const batas = setTimeout(() => controller.abort(), 1500)
    const jawaban = await fetch(`http://${HOST}:${PORT}/`, { signal: controller.signal })
    clearTimeout(batas)
    return jawaban.status < 500
  } catch {
    return false
  }
}

const aktif = await emulatorTersedia()

describe.skipIf(!aktif)('notification-repository pada emulator', () => {
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
    vi.resetModules()
  })

  beforeEach(async () => {
    await env.clearFirestore()
    vi.resetModules()
  })

  async function muatRepo(konteksDb: Firestore) {
    vi.doMock('../lib/firebase', () => ({
      db: konteksDb,
      isFirebaseConfigured: () => true,
      auth: {},
      storage: {},
      firebaseApp: {},
      isUsingEmulator: true,
      isAppCheckEnabled: false,
    }))

    return await import('./notification-repository')
  }

  /** Menyiapkan satu laporan beserta beberapa catatan riwayatnya. */
  async function siapkanRiwayat(idLaporan: string, pemilik: string) {
    await env.withSecurityRulesDisabled(async (konteks) => {
      const db = sebagaiFirestore(konteks)

      await setDoc(doc(db, 'laporan', idLaporan), {
        nomor_laporan: 'LT-2026-0001',
        uid_pelapor: pemilik,
        id_status: 'Diverifikasi',
        judul_laporan: 'Laporan uji',
        tanggal_laporan: new Date('2026-10-18T01:00:00Z'),
      })

      await setDoc(doc(db, 'riwayat_status_laporan', 'riwayat-kirim'), {
        id_laporan: idLaporan,
        id_status: 'Diterima',
        uid_pencatat: pemilik,
        keterangan: '',
        tanggal_riwayat: new Date('2026-10-18T01:00:00Z'),
      })

      await setDoc(doc(db, 'riwayat_status_laporan', 'riwayat-verifikasi'), {
        id_laporan: idLaporan,
        id_status: 'Diverifikasi',
        uid_pencatat: 'administrator',
        keterangan: 'Laporan telah diverifikasi',
        tanggal_riwayat: new Date('2026-10-18T02:00:00Z'),
      })
    })
  }

  it('membaca notifikasi dari riwayat laporan', async () => {
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    const hasil = await repo.listNotifications(['laporan-1'])

    expect(hasil.length).toBeGreaterThan(0)
    expect(hasil[0]?.keterangan).toBe('Laporan telah diverifikasi')
  })

  it('mengurutkan notifikasi terbaru di atas', async () => {
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    const hasil = await repo.listNotifications(['laporan-1'])
    const waktu = hasil.map((item) => item.waktu?.getTime() ?? 0)

    expect([...waktu].sort((a, b) => b - a)).toEqual(waktu)
  })

  it('menandai notifikasi baru sebagai belum dibaca', async () => {
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    const hasil = await repo.listNotifications(['laporan-1'])

    expect(hasil.every((item) => item.belumDibaca)).toBe(true)
  })

  it('menyimpan penandaan sudah dibaca sehingga bertahan setelah dibaca ulang', async () => {
    // Inilah yang dulu tidak terjadi: penandaan hanya ada di state React dan
    // hilang setiap kali halaman dimuat ulang.
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    await repo.markNotificationRead('riwayat-verifikasi')

    const setelah = await repo.listNotifications(['laporan-1'])
    const ditandai = setelah.find((item) => item.id === 'riwayat-verifikasi')

    expect(ditandai?.belumDibaca).toBe(false)
    expect(ditandai?.dibacaPada).toBeInstanceOf(Date)
  })

  it('menandai beberapa notifikasi sekaligus', async () => {
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    const sebelum = await repo.listNotifications(['laporan-1'])
    await repo.markAllNotificationsRead(sebelum.map((item) => item.id))

    const setelah = await repo.listNotifications(['laporan-1'])
    expect(setelah.every((item) => item.belumDibaca)).toBe(false)
  })

  it('tidak mengubah isi riwayat saat menandai sudah dibaca', async () => {
    // Aturan keamanan hanya mengizinkan field dibaca_pada berubah, sehingga
    // penandaan tidak dapat dipakai menyunting catatan penanganan.
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))

    await repo.markNotificationRead('riwayat-verifikasi')

    // withSecurityRulesDisabled tidak meneruskan nilai kembalian, sehingga
    // isinya ditampung ke variabel luar.
    let isi: Record<string, unknown> | undefined

    await env.withSecurityRulesDisabled(async (konteks) => {
      const snapshot = await getDoc(
        doc(sebagaiFirestore(konteks), 'riwayat_status_laporan', 'riwayat-verifikasi'),
      )
      isi = snapshot.data()
    })

    expect(isi?.keterangan).toBe('Laporan telah diverifikasi')
    expect(isi?.id_status).toBe('Diverifikasi')
  })

  it('mengembalikan daftar kosong ketika pengguna belum punya laporan', async () => {
    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID)))
    expect(await repo.listNotifications([])).toEqual([])
  })

  it('menolak penandaan oleh pengguna yang belum masuk', async () => {
    await siapkanRiwayat('laporan-1', UID)
    const repo = await muatRepo(sebagaiFirestore(env.unauthenticatedContext()))

    await expect(repo.markNotificationRead('riwayat-verifikasi')).rejects.toThrow()
  })

  it('tetap membaca notifikasi untuk lebih dari sepuluh laporan', async () => {
    // Operator `in` pada Firestore dibatasi sepuluh nilai, sehingga kueri
    // dipecah. Tanpa pemecahan itu mahasiswa dengan sebelas laporan tidak akan
    // menerima notifikasi sama sekali.
    const idLaporan = Array.from({ length: 12 }, (_, i) => `laporan-${i}`)

    await env.withSecurityRulesDisabled(async (konteks) => {
      const db = sebagaiFirestore(konteks)
      for (const id of idLaporan) {
        await setDoc(doc(db, 'riwayat_status_laporan', `riwayat-${id}`), {
          id_laporan: id,
          id_status: 'Diverifikasi',
          uid_pencatat: 'administrator',
          keterangan: `Pembaruan ${id}`,
          tanggal_riwayat: new Date('2026-10-18T02:00:00Z'),
        })
      }
    })

    const repo = await muatRepo(sebagaiFirestore(env.authenticatedContext(UID_LAIN)))
    const hasil = await repo.listNotifications(idLaporan)

    expect(hasil).toHaveLength(12)
  })
})

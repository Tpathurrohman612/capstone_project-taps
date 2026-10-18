import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

/**
 * @firebase/rules-unit-testing mengembalikan Firestore versi compat, sedangkan
 * kode aplikasi memakai SDK modular. Keduanya menunjuk sambungan yang sama,
 * tetapi tipenya berbeda, sehingga konversi dilakukan sekali di sini saja
 * daripada menyebar di setiap pemanggilan.
 */
const sebagaiFirestore = (konteks: { firestore: () => unknown }): Firestore =>
  konteks.firestore() as Firestore
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Pengujian jalur tulis laporan pada Firebase Emulator Suite.
 *
 * Pemetaan dokumen diuji tanpa jaringan di laporan-repository.test.ts. Berkas
 * ini menguji yang tidak dapat dibuktikan tanpa basis data sungguhan: apakah
 * penomoran benar-benar berurutan, apakah transaksi perubahan status menolak
 * perpindahan yang tidak sah, dan apakah riwayat ikut tercatat.
 *
 * Menjalankan:
 *
 *   JAVA_HOME=$(brew --prefix openjdk@21) \
 *     corepack pnpm@10.34.3 --dir frontend run test:rules:emulator
 *
 * Tanpa emulator seluruh pengujian di sini dilewati, bukan gagal.
 */

const PROJECT_ID = 'lapor-tutor-repo-test'
const HOST = '127.0.0.1'
const PORT = 8080

const UID = 'mahasiswa-penguji'
const UID_ADMIN = 'administrator-penguji'

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

describe.skipIf(!aktif)('laporan-repository pada emulator', () => {
  let env: RulesTestEnvironment
  let db: Firestore

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

    await env.withSecurityRulesDisabled(async (konteks) => {
      await setDoc(doc(sebagaiFirestore(konteks), 'administrator', UID_ADMIN), {
        catatan: 'penguji',
      })
    })
  })

  /**
   * Memuat repository dengan db emulator disuntikkan menggantikan modul
   * firebase, sehingga kode yang diuji benar-benar kode produksi.
   */
  async function muatRepository(konteksDb: Firestore) {
    db = konteksDb
    vi.doMock('../lib/firebase', () => ({
      db: konteksDb,
      isFirebaseConfigured: () => true,
      auth: {},
      storage: {},
      firebaseApp: {},
      isUsingEmulator: true,
    }))

    return await import('./laporan-repository')
  }

  const dataLaporan = {
    id_kategori: 'Tutor tidak memberikan umpan balik',
    nama_tutor: 'Budi Santoso',
    judul_laporan: 'Tugas 1 belum dinilai',
    kode_mata_kuliah: 'MSIM4301',
    nama_mata_kuliah: 'Rekayasa Perangkat Lunak',
  }

  describe('createLaporan', () => {
    it('menyimpan laporan dengan status awal Diterima', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const hasil = await repo.createLaporan({ uid: UID, data: dataLaporan })

      expect(hasil.id_status).toBe('Diterima')
      expect(hasil.uid_pelapor).toBe(UID)
      expect(hasil.nomor_laporan).toBe('LT-2026-0001')

      const tersimpan = await repo.getLaporan(hasil.id_laporan)
      expect(tersimpan?.judul_laporan).toBe('Tugas 1 belum dinilai')
      expect(tersimpan?.id_status).toBe('Diterima')
    })

    it('menomori laporan berikutnya secara berurutan', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const pertama = await repo.createLaporan({ uid: UID, data: dataLaporan })
      const kedua = await repo.createLaporan({ uid: UID, data: dataLaporan })
      const ketiga = await repo.createLaporan({ uid: UID, data: dataLaporan })

      expect([pertama.nomor_laporan, kedua.nomor_laporan, ketiga.nomor_laporan]).toEqual([
        'LT-2026-0001',
        'LT-2026-0002',
        'LT-2026-0003',
      ])
    })

    it('tidak menghasilkan nomor kembar', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const nomor: string[] = []
      for (let i = 0; i < 5; i += 1) {
        nomor.push((await repo.createLaporan({ uid: UID, data: dataLaporan })).nomor_laporan)
      }

      expect(new Set(nomor).size).toBe(nomor.length)
    })

    it('mencatat riwayat status pertama', async () => {
      const konteks = sebagaiFirestore(env.authenticatedContext(UID))
      const repo = await muatRepository(konteks)

      const hasil = await repo.createLaporan({ uid: UID, data: dataLaporan })

      const riwayat = await getDocs(
        query(
          collection(konteks, 'riwayat_status_laporan'),
          where('id_laporan', '==', hasil.id_laporan),
        ),
      )

      expect(riwayat.size).toBe(1)
      expect(riwayat.docs[0]?.data()).toMatchObject({
        id_status: 'Diterima',
        uid_pencatat: UID,
      })
    })
  })

  describe('lampiran', () => {
    it('menyimpan metadata bukti pendukung bersama laporannya', async () => {
      const konteks = sebagaiFirestore(env.authenticatedContext(UID))
      const repo = await muatRepository(konteks)

      const dibuat = await repo.createLaporan({
        uid: UID,
        data: dataLaporan,
        lampiran: [{ nama_file: 'tangkapan-layar.png', tipe_file: 'PNG', ukuran_file: '84 KB' }],
      })

      const berkas = await repo.listLampiran(dibuat.id_laporan)

      expect(berkas).toHaveLength(1)
      expect(berkas[0]).toMatchObject({
        nama_file: 'tangkapan-layar.png',
        tipe_file: 'PNG',
        ukuran_file: '84 KB',
      })
    })

    it('menyimpan tepat sebanyak berkas yang diunggah', async () => {
      // Pengguna mengunggah satu berkas tetapi melihat dua, karena layar
      // menampilkan daftar contoh ketika lampiran kosong. Jumlahnya kini
      // mengikuti apa yang benar-benar tersimpan.
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const satu = await repo.createLaporan({
        uid: UID,
        data: dataLaporan,
        lampiran: [{ nama_file: 'satu.pdf', tipe_file: 'PDF' }],
      })

      expect(await repo.listLampiran(satu.id_laporan)).toHaveLength(1)
    })

    it('menyimpan isi berkas sehingga dapat ditampilkan kembali', async () => {
      // Tanpa Cloud Storage, isi berkas disimpan sebagai data base64 di dalam
      // dokumen lampiran. Bila tidak tersimpan, layar hanya dapat menampilkan
      // nama berkas tanpa ada yang dapat dibuka.
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))
      const isi = 'data:image/jpeg;base64,' + 'A'.repeat(2000)

      const dibuat = await repo.createLaporan({
        uid: UID,
        data: dataLaporan,
        lampiran: [{ nama_file: 'bukti.jpg', tipe_file: 'JPG', isi_base64: isi }],
      })

      const berkas = await repo.listLampiran(dibuat.id_laporan)
      expect(berkas[0]?.isi_base64).toBe(isi)
    })

    it('menolak isi berkas yang melewati batas dokumen', async () => {
      // Batas keras Firestore satu megabyte per dokumen. Aturan menolak lebih
      // dulu agar kegagalannya jelas, bukan berupa galat ukuran dokumen.
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      await expect(
        repo.createLaporan({
          uid: UID,
          data: dataLaporan,
          lampiran: [
            { nama_file: 'raksasa.jpg', tipe_file: 'JPG', isi_base64: 'A'.repeat(800000) },
          ],
        }),
      ).rejects.toThrow()
    })

    it('mengembalikan daftar kosong untuk laporan tanpa bukti pendukung', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))
      const tanpa = await repo.createLaporan({ uid: UID, data: dataLaporan })

      expect(await repo.listLampiran(tanpa.id_laporan)).toEqual([])
    })

    it('tidak mencampur lampiran antarlaporan', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const pertama = await repo.createLaporan({
        uid: UID,
        data: dataLaporan,
        lampiran: [{ nama_file: 'pertama.png', tipe_file: 'PNG' }],
      })
      const kedua = await repo.createLaporan({
        uid: UID,
        data: dataLaporan,
        lampiran: [{ nama_file: 'kedua.png', tipe_file: 'PNG' }],
      })

      expect((await repo.listLampiran(pertama.id_laporan))[0]?.nama_file).toBe('pertama.png')
      expect((await repo.listLampiran(kedua.id_laporan))[0]?.nama_file).toBe('kedua.png')
    })
  })

  describe('listLaporanMilik', () => {
    it('hanya mengembalikan laporan milik pemanggil', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))
      await repo.createLaporan({ uid: UID, data: dataLaporan })

      // Laporan milik orang lain ditulis dengan aturan dilewati.
      await env.withSecurityRulesDisabled(async (konteks) => {
        await setDoc(doc(sebagaiFirestore(konteks), 'laporan', 'punya-orang-lain'), {
          nomor_laporan: 'LT-2026-9001',
          uid_pelapor: 'mahasiswa-lain',
          id_status: 'Diterima',
          judul_laporan: 'Laporan orang lain',
          tanggal_laporan: new Date(),
        })
      })

      const milikku = await repo.listLaporanMilik(UID)

      expect(milikku).toHaveLength(1)
      expect(milikku[0]?.uid_pelapor).toBe(UID)
    })

    it('mengembalikan daftar kosong untuk pengguna tanpa laporan', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))
      expect(await repo.listLaporanMilik(UID)).toEqual([])
    })
  })

  describe('ubahStatusLaporan', () => {
    it('memindahkan laporan mengikuti Tabel 4.2 dan mencatat riwayat', async () => {
      const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
      const repoMhs = await muatRepository(konteksMhs)
      const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

      vi.resetModules()
      const konteksAdmin = sebagaiFirestore(env.authenticatedContext(UID_ADMIN))
      const repoAdmin = await muatRepository(konteksAdmin)

      await repoAdmin.ubahStatusLaporan({
        idLaporan: dibuat.id_laporan,
        ke: 'Diverifikasi',
        oleh: 'Administrator',
        uidPencatat: UID_ADMIN,
      })

      const setelah = await repoAdmin.getLaporan(dibuat.id_laporan)
      expect(setelah?.id_status).toBe('Diverifikasi')

      const riwayat = await getDocs(
        query(
          collection(konteksAdmin, 'riwayat_status_laporan'),
          where('id_laporan', '==', dibuat.id_laporan),
        ),
      )
      expect(riwayat.size).toBe(2)
    })

    it('menolak perpindahan yang tidak ada pada Tabel 4.2', async () => {
      const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
      const repoMhs = await muatRepository(konteksMhs)
      const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

      vi.resetModules()
      const repoAdmin = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID_ADMIN)))

      // Diterima tidak dapat langsung menjadi Selesai.
      await expect(
        repoAdmin.ubahStatusLaporan({
          idLaporan: dibuat.id_laporan,
          ke: 'Selesai',
          oleh: 'Administrator',
          uidPencatat: UID_ADMIN,
        }),
      ).rejects.toThrow(/tidak diizinkan/)

      const tetap = await repoAdmin.getLaporan(dibuat.id_laporan)
      expect(tetap?.id_status).toBe('Diterima')
    })

    it('menolak perpindahan yang syarat wajibnya belum terpenuhi', async () => {
      const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
      const repoMhs = await muatRepository(konteksMhs)
      const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

      vi.resetModules()
      const repoAdmin = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID_ADMIN)))

      await expect(
        repoAdmin.ubahStatusLaporan({
          idLaporan: dibuat.id_laporan,
          ke: 'Ditolak',
          oleh: 'Administrator',
          uidPencatat: UID_ADMIN,
        }),
      ).rejects.toThrow(/alasan/)
    })

    it('menerima penolakan yang disertai alasan', async () => {
      const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
      const repoMhs = await muatRepository(konteksMhs)
      const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

      vi.resetModules()
      const repoAdmin = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID_ADMIN)))

      await repoAdmin.ubahStatusLaporan({
        idLaporan: dibuat.id_laporan,
        ke: 'Ditolak',
        oleh: 'Administrator',
        uidPencatat: UID_ADMIN,
        data: { alasan: 'Bukan permasalahan layanan tutor' },
      })

      expect((await repoAdmin.getLaporan(dibuat.id_laporan))?.id_status).toBe('Ditolak')
    })

    it('menolak mahasiswa memverifikasi laporannya sendiri', async () => {
      const konteks = sebagaiFirestore(env.authenticatedContext(UID))
      const repo = await muatRepository(konteks)
      const dibuat = await repo.createLaporan({ uid: UID, data: dataLaporan })

      await expect(
        repo.ubahStatusLaporan({
          idLaporan: dibuat.id_laporan,
          ke: 'Diverifikasi',
          oleh: 'Mahasiswa',
          uidPencatat: UID,
        }),
      ).rejects.toThrow(/hanya dapat dilakukan oleh Administrator/)
    })

    it('menolak laporan yang tidak ada', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID_ADMIN)))

      await expect(
        repo.ubahStatusLaporan({
          idLaporan: 'tidak-ada',
          ke: 'Diverifikasi',
          oleh: 'Administrator',
          uidPencatat: UID_ADMIN,
        }),
      ).rejects.toThrow(/tidak ditemukan/)
    })
  })

  describe('entitas penanganan pada ERD', () => {
    async function sampaiStatus(ke: string, data?: Record<string, unknown>) {
      const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
      const repoMhs = await muatRepository(konteksMhs)
      const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

      vi.resetModules()
      const konteksAdmin = sebagaiFirestore(env.authenticatedContext(UID_ADMIN))
      const repoAdmin = await muatRepository(konteksAdmin)

      const langkah: { ke: string; data?: Record<string, unknown> }[] = [
        { ke: 'Diverifikasi' },
        { ke: 'Menunggu Validasi', data: { unit_tujuan: 'FST', kanal_pengiriman: 'Surel' } },
        {
          ke: 'Sedang Diproses',
          data: { hasil_validasi: 'Terbukti', unit_validator: 'FST', catatan_validasi: 'Catatan' },
        },
        { ke: 'Selesai', data: { tindak_lanjut: 'Pembinaan tutor' } },
      ]

      for (const l of langkah) {
        await repoAdmin.ubahStatusLaporan({
          idLaporan: dibuat.id_laporan,
          ke: l.ke as never,
          oleh: 'Administrator',
          uidPencatat: UID_ADMIN,
          ...(l.data ? { data: l.data } : {}),
        })
        if (l.ke === ke) break
      }

      return { idLaporan: dibuat.id_laporan, db: konteksAdmin, data }
    }

    it('mencatat pengiriman validasi saat laporan menuju Menunggu Validasi', async () => {
      // Riwayat mencatat bahwa statusnya berpindah; entitas inilah yang
      // menyimpan unit tujuan dan kanal pengirimannya.
      const { idLaporan, db } = await sampaiStatus('Menunggu Validasi')

      const hasil = await getDocs(
        query(collection(db, 'pengiriman_validasi'), where('id_laporan', '==', idLaporan)),
      )

      expect(hasil.size).toBe(1)
      expect(hasil.docs[0]?.data()).toMatchObject({
        unit_tujuan: 'FST',
        kanal_pengiriman: 'Surel',
        uid_pengirim: UID_ADMIN,
      })
    })

    it('mencatat hasil validasi saat laporan menuju Sedang Diproses', async () => {
      const { idLaporan, db } = await sampaiStatus('Sedang Diproses')

      const hasil = await getDocs(
        query(collection(db, 'validasi'), where('id_laporan', '==', idLaporan)),
      )

      expect(hasil.size).toBe(1)
      expect(hasil.docs[0]?.data()).toMatchObject({
        hasil_validasi: 'Terbukti',
        unit_validator: 'FST',
        keterangan: 'Catatan',
      })
    })

    it('mencatat tindak lanjut saat laporan menuju Selesai', async () => {
      const { idLaporan, db } = await sampaiStatus('Selesai')

      const hasil = await getDocs(
        query(collection(db, 'tindak_lanjut'), where('id_laporan', '==', idLaporan)),
      )

      expect(hasil.size).toBe(1)
      expect(hasil.docs[0]?.data()).toMatchObject({
        keterangan: 'Pembinaan tutor',
        uid_pencatat: UID_ADMIN,
      })
    })

    it('membaca kembali catatan penanganan untuk ditampilkan kepada mahasiswa', async () => {
      // Inilah yang dibaca halaman detail laporan. Tanpa pembacaan ini,
      // mahasiswa hanya dapat melihat hasil penanganan pada panel notifikasi.
      const { idLaporan } = await sampaiStatus('Selesai')
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))

      const penanganan = await repo.listPenanganan(idLaporan)

      expect(penanganan.validasi).toHaveLength(1)
      expect(penanganan.validasi[0]).toMatchObject({
        hasil_validasi: 'Terbukti',
        unit_validator: 'FST',
        keterangan: 'Catatan',
      })
      expect(penanganan.tindakLanjut[0]?.keterangan).toBe('Pembinaan tutor')
      expect(penanganan.pengiriman[0]?.unit_tujuan).toBe('FST')
    })

    it('mengembalikan catatan kosong untuk laporan yang belum ditangani', async () => {
      const repo = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID)))
      const dibuat = await repo.createLaporan({ uid: UID, data: dataLaporan })

      const penanganan = await repo.listPenanganan(dibuat.id_laporan)

      expect(penanganan.validasi).toEqual([])
      expect(penanganan.tindakLanjut).toEqual([])
      expect(penanganan.pengiriman).toEqual([])
    })

    it('tidak mencatat entitas penanganan pada perpindahan yang tidak terkait', async () => {
      // Verifikasi hanya memindahkan status; tidak ada pengiriman, validasi,
      // maupun tindak lanjut yang terjadi pada langkah itu.
      const { idLaporan, db } = await sampaiStatus('Diverifikasi')

      for (const koleksi of ['pengiriman_validasi', 'validasi', 'tindak_lanjut']) {
        const hasil = await getDocs(
          query(collection(db, koleksi), where('id_laporan', '==', idLaporan)),
        )
        expect(hasil.size, `${koleksi} tidak seharusnya terisi`).toBe(0)
      }
    })
  })

  it('menempuh alur penuh sampai Selesai', async () => {
    const konteksMhs = sebagaiFirestore(env.authenticatedContext(UID))
    const repoMhs = await muatRepository(konteksMhs)
    const dibuat = await repoMhs.createLaporan({ uid: UID, data: dataLaporan })

    vi.resetModules()
    const repoAdmin = await muatRepository(sebagaiFirestore(env.authenticatedContext(UID_ADMIN)))

    const langkah = [
      { ke: 'Diverifikasi' as const, data: undefined },
      {
        ke: 'Menunggu Validasi' as const,
        data: { unit_tujuan: 'FST', kanal_pengiriman: 'Surel' },
      },
      {
        ke: 'Sedang Diproses' as const,
        data: { hasil_validasi: 'Terbukti', unit_validator: 'FST' },
      },
      { ke: 'Selesai' as const, data: { tindak_lanjut: 'Pembinaan tutor' } },
    ]

    for (const { ke, data } of langkah) {
      await repoAdmin.ubahStatusLaporan({
        idLaporan: dibuat.id_laporan,
        ke,
        oleh: 'Administrator',
        uidPencatat: UID_ADMIN,
        ...(data ? { data } : {}),
      })
    }

    expect((await repoAdmin.getLaporan(dibuat.id_laporan))?.id_status).toBe('Selesai')

    const riwayat = await getDocs(
      query(collection(db, 'riwayat_status_laporan'), where('id_laporan', '==', dibuat.id_laporan)),
    )
    // Satu catatan saat dibuat ditambah empat perpindahan.
    expect(riwayat.size).toBe(5)
  })
})

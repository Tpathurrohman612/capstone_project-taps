import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Kesepakatan antara layar Administrator dan lapisan data.
 *
 * Lapisan data menyusun entitas penanganan pada ERD dari objek `data` yang
 * dikirim layar. Kunci yang tidak dikirim tidak membuat apa pun gagal: field
 * yang bersangkutan hanya tersimpan kosong, dan catatannya hilang tanpa ada
 * yang menyadarinya. Itulah yang terjadi pada catatan validasi, yang sempat
 * hanya hidup sebagai kalimat di dalam keterangan riwayat.
 *
 * Kesepakatan ini tidak dapat dijaga pemeriksa tipe, karena `data` bertipe
 * Record<string, unknown>. Yang tersisa hanyalah memeriksa sumbernya.
 */

const baca = (jalur: string) => readFileSync(join(__dirname, jalur), 'utf8')

/** Kunci yang memang tidak memiliki isian pada antarmuka mana pun. */
const TANPA_ISIAN = new Set(['catatan'])

describe('kunci data penanganan', () => {
  it('mengirim setiap kunci yang dibaca lapisan data', () => {
    const repositori = baca('../../../shared/data/laporan-repository.ts')
    const layar =
      baca('../screens/AdminWorkflowDetailScreen.tsx') +
      baca('../screens/AdminWorkflowQueueScreen.tsx')

    const dibaca = Array.from(repositori.matchAll(/teks\('([a-z_]+)'\)/g)).map((cocok) => cocok[1])

    expect(dibaca.length, 'tidak ada kunci yang terbaca; polanya mungkin berubah').toBeGreaterThan(
      0,
    )

    for (const kunci of dibaca) {
      if (kunci === undefined || TANPA_ISIAN.has(kunci)) continue

      expect(
        layar,
        `lapisan data membaca "${kunci}" tetapi layar tidak pernah mengirimnya`,
      ).toMatch(new RegExp(`\\b${kunci}:`))
    }
  })

  it('menyebut catatan validasi secara khusus', () => {
    // Inilah kunci yang pernah hilang, dan hilangnya tidak terlihat karena
    // catatannya tetap muncul pada lini masa lewat keterangan riwayat.
    expect(baca('../screens/AdminWorkflowDetailScreen.tsx')).toMatch(/catatan_validasi:/)
  })
})

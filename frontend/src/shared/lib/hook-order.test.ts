import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Penjaga urutan hook.
 *
 * Aplikasi dua kali berhenti dengan "Rendered more hooks than during the
 * previous render", keduanya karena sebuah return bersyarat ditambahkan di
 * atas hook yang sudah ada. React menuntut setiap hook dipanggil tanpa syarat
 * dan dalam urutan yang sama pada setiap render, sehingga return yang
 * mendahului sebuah hook membuat jumlah hook berubah-ubah.
 *
 * Kesalahan itu tidak terlihat oleh pemeriksa tipe maupun oleh pengujian
 * komponen yang hanya merender satu keadaan, dan baru muncul ketika keadaan
 * berpindah. Pemeriksaan ini membacanya langsung dari berkas sumber.
 *
 * Pemeriksaan sengaja sederhana: ia hanya melihat return di tingkat teratas
 * badan komponen, yaitu yang berindentasi dua spasi, karena itulah bentuk yang
 * menyebabkan persoalan. Return di dalam fungsi bersarang tidak diperiksa.
 */

const HOOK =
  /^\s*(?:const|let)\s*[[{]?[^=]*=\s*(useState|useEffect|useMemo|useCallback|useRef|useReducer|useContext|use[A-Z]\w*)\s*[(<]/

/**
 * Titik keluar lebih awal.
 *
 * Bentuk yang dicari adalah return di badan komponen itu sendiri, maupun
 * return di dalam blok if pada tingkat yang sama. Bentuk keduanya yang dua
 * kali menyebabkan aplikasi berhenti, dan indentasinya empat spasi sehingga
 * pemeriksaan yang hanya melihat dua spasi melewatkannya.
 */
const RETURN_BADAN = /^ {2}return[\s(]/
const AWAL_IF = /^ {2}if\s*\(/
const RETURN_DALAM_IF = /^ {4}return[\s(]/
const AKHIR_BLOK = /^ {2}\}/

/** Menelusuri seluruh berkas komponen tanpa bergantung pustaka tambahan. */
function berkasKomponen(dir = 'src'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entri) => {
    const jalur = join(dir, entri.name)

    if (entri.isDirectory()) return berkasKomponen(jalur)
    if (!entri.name.endsWith('.tsx') || entri.name.endsWith('.test.tsx')) return []

    return [jalur]
  })
}

/**
 * Awal sebuah fungsi di tingkat berkas, baik komponen maupun hook kustom.
 *
 * Keduanya diperlakukan sama karena aturan urutan hook berlaku bagi keduanya,
 * dan return milik fungsi sebelumnya tidak ada hubungannya dengan hook pada
 * fungsi berikutnya.
 */
const AWAL_FUNGSI =
  /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w|^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?\(/

/**
 * Mencari hook yang berada setelah return tingkat teratas di dalam komponen
 * yang sama.
 *
 * Penelusuran diulang dari awal pada setiap komponen baru, karena satu berkas
 * dapat memuat beberapa komponen dan return milik komponen sebelumnya tidak
 * ada hubungannya dengan hook pada komponen berikutnya.
 */
function hookSetelahReturn(isi: string): { baris: number; teks: string }[] {
  const temuan: { baris: number; teks: string }[] = []
  let sudahReturn = false

  const lines = isi.split('\n')
  let dalamIf = false

  lines.forEach((teks, i) => {
    if (AWAL_FUNGSI.test(teks)) {
      sudahReturn = false
      dalamIf = false
      return
    }

    if (AWAL_IF.test(teks)) {
      dalamIf = true
      return
    }

    if (dalamIf && AKHIR_BLOK.test(teks)) {
      dalamIf = false
      return
    }

    if (RETURN_BADAN.test(teks) || (dalamIf && RETURN_DALAM_IF.test(teks))) {
      sudahReturn = true
      return
    }

    if (sudahReturn && HOOK.test(teks)) temuan.push({ baris: i + 1, teks })
  })

  return temuan
}

describe('urutan pemanggilan hook', () => {
  const berkas = berkasKomponen()

  it('menemukan berkas komponen untuk diperiksa', () => {
    // Tanpa ini, pola glob yang keliru akan membuat seluruh pemeriksaan lolos
    // karena tidak ada yang diperiksa.
    expect(berkas.length).toBeGreaterThan(10)
  })

  it('tidak memanggil hook setelah return bersyarat', () => {
    const pelanggaran: string[] = []

    for (const jalur of berkas) {
      for (const { baris, teks } of hookSetelahReturn(readFileSync(jalur, 'utf8'))) {
        pelanggaran.push(`${jalur}:${baris} → ${teks.trim()}`)
      }
    }

    expect(
      pelanggaran,
      'Hook berikut dipanggil setelah return bersyarat, sehingga jumlah hook ' +
        'dapat berubah antarrender. Pindahkan seluruh hook ke atas setiap ' +
        'return.\n' +
        pelanggaran.join('\n'),
    ).toEqual([])
  })
})

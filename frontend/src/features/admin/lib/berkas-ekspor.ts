import JSZip from 'jszip'

/**
 * Penyusun berkas ekspor.
 *
 * Tim meminta Excel, sedangkan laporan membawa bukti berupa gambar dan PDF.
 * Berkas .xlsx sebenarnya dapat memuat gambar, tetapi pustaka yang dipakai di
 * sini tidak dapat menulisnya, dan gambar yang disisipkan ke dalam lembar
 * kerja pun mengambang di atas sel: tinggi barisnya membengkak dan berkasnya
 * tidak dapat dibuka satu per satu.
 *
 * Ekspornya karena itu berupa ZIP yang memuat keduanya: satu berkas Excel di
 * akar untuk datanya, dan satu folder bukti untuk setiap laporan.
 */

/** Nama folder yang aman dipakai di Windows, macOS, maupun Linux. */
export function namaFolderAman(teks: string): string {
  const bersih = teks
    // Karakter yang dilarang Windows, beserta kendali dan titik di ujung.
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')

  // Pemotongan menjaga agar jalur di dalam ZIP tidak melampaui batas Windows.
  return bersih.slice(0, 80).trim() || 'Tanpa Nama'
}

/** Satu laporan beserta buktinya, siap dimasukkan ke dalam ZIP. */
export type LaporanEkspor = {
  nomor: string
  namaPelapor: string
  lampiran: { nama: string; isiBase64?: string }[]
}

/** Jalur folder bukti milik satu laporan, juga dipakai sebagai kolom Excel. */
export function jalurFolderBukti(laporan: { nomor: string; namaPelapor: string }): string {
  const nama = laporan.namaPelapor.trim()
  const label = nama === '' ? laporan.nomor : `${laporan.nomor} - ${nama}`

  return `Bukti Pendukung/${namaFolderAman(label)}`
}

/** Memisahkan data URL menjadi data base64-nya saja. */
export function pisahDataUrl(isi: string): string | undefined {
  const cocok = /^data:[^;]*;base64,(.+)$/s.exec(isi.trim())
  if (cocok?.[1]) return cocok[1]

  // Sebagian lampiran lama tersimpan tanpa awalan data URL.
  return /^[A-Za-z0-9+/=\s]+$/.test(isi.trim()) && isi.trim() !== '' ? isi.trim() : undefined
}

export async function susunZipEkspor(params: {
  excel: ArrayBuffer
  namaExcel: string
  laporan: LaporanEkspor[]
}): Promise<Blob> {
  const zip = new JSZip()
  zip.file(params.namaExcel, params.excel)

  for (const laporan of params.laporan) {
    const folder = jalurFolderBukti(laporan)

    if (laporan.lampiran.length === 0) {
      // Folder kosong tidak tersimpan di dalam ZIP, sehingga ketiadaan bukti
      // dinyatakan sebagai berkas keterangan. Tanpa itu, laporan tanpa bukti
      // tidak dapat dibedakan dari bukti yang gagal ikut terbawa.
      zip.file(
        `${folder}/TIDAK ADA BUKTI.txt`,
        `Laporan ${laporan.nomor} dikirim tanpa bukti pendukung.\n`,
      )
      continue
    }

    const terpakai = new Set<string>()

    for (const berkas of laporan.lampiran) {
      const isi = berkas.isiBase64 ? pisahDataUrl(berkas.isiBase64) : undefined
      if (!isi) continue

      // Dua lampiran dapat memiliki nama yang sama, dan yang terakhir akan
      // menimpa yang pertama tanpa ada yang menyadarinya.
      let nama = namaFolderAman(berkas.nama)
      let urutan = 2
      while (terpakai.has(nama)) {
        const titik = nama.lastIndexOf('.')
        nama =
          titik > 0
            ? `${nama.slice(0, titik)} (${urutan})${nama.slice(titik)}`
            : `${nama} (${urutan})`
        urutan += 1
      }
      terpakai.add(nama)

      zip.file(`${folder}/${nama}`, isi, { base64: true })
    }
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

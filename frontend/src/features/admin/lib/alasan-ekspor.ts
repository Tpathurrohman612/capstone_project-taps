/**
 * Mengapa tombol ekspor belum dapat ditekan.
 *
 * Syaratnya sudah dijelaskan, tetapi hanya setelah tombolnya ditekan. Karena
 * tombol itu justru dinonaktifkan ketika syaratnya belum terpenuhi,
 * penjelasannya tidak pernah terbaca siapa pun. Administrator hanya melihat
 * tombol kelabu tanpa tahu apa yang kurang.
 */
export function alasanEksporTertutup(params: {
  fakultas: string
  jumlahSiap: number
}): string | undefined {
  if (params.fakultas === 'Semua') {
    return 'Pilih satu Fakultas terlebih dahulu. Data dikirim ke satu unit, sehingga ekspor gabungan beberapa fakultas tidak dapat dilakukan.'
  }

  if (params.jumlahSiap === 0) {
    return `Belum ada laporan berstatus Lolos Pemeriksaan pada ${params.fakultas}. Loloskan pemeriksaan laporannya terlebih dahulu.`
  }

  return undefined
}

import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { jalurFolderBukti, namaFolderAman, pisahDataUrl, susunZipEkspor } from './berkas-ekspor'

/**
 * Penyusun berkas ekspor.
 *
 * Berkas ini dikirim ke Fakultas dan dibuka di komputer orang lain, sehingga
 * yang dijaga di sini adalah hal-hal yang baru ketahuan setelah berkasnya
 * sampai: nama folder yang ditolak sistem berkas, lampiran yang saling
 * menimpa, dan laporan tanpa bukti yang tidak dapat dibedakan dari bukti yang
 * hilang.
 */

const excel = new TextEncoder().encode('bukan excel sungguhan').buffer
const gambar = `data:image/jpeg;base64,${btoa('isi gambar')}`

const bacaZip = async (blob: Blob) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  return Object.keys(zip.files).filter((nama) => !zip.files[nama]?.dir)
}

describe('namaFolderAman', () => {
  it('membuang karakter yang ditolak Windows', () => {
    expect(namaFolderAman('LT/2026:0001?*<>|"\\')).not.toMatch(/[<>:"/\\|?*]/)
  })

  it('membuang titik di ujung yang ditolak Windows', () => {
    expect(namaFolderAman('Laporan...')).toBe('Laporan')
  })

  it('memotong nama yang terlalu panjang agar jalurnya tidak melampaui batas', () => {
    expect(namaFolderAman('A'.repeat(200)).length).toBeLessThanOrEqual(80)
  })

  it('memberi nama cadangan ketika seluruh karakternya terbuang', () => {
    expect(namaFolderAman('///')).toBe('Tanpa Nama')
  })
})

describe('jalurFolderBukti', () => {
  it('menyertakan nomor laporan dan nama pelapor', () => {
    expect(jalurFolderBukti({ nomor: 'LT-2026-0002', namaPelapor: 'Sidiq Toha' })).toBe(
      'Bukti Pendukung/LT-2026-0002 - Sidiq Toha',
    )
  })

  it('memakai nomor laporan saja ketika nama pelapornya tidak diketahui', () => {
    // Laporan lama dapat kehilangan dokumen penggunanya, dan folder bernama
    // "LT-2026-0002 - " akan terbaca seperti berkas yang rusak.
    expect(jalurFolderBukti({ nomor: 'LT-2026-0002', namaPelapor: '  ' })).toBe(
      'Bukti Pendukung/LT-2026-0002',
    )
  })
})

describe('pisahDataUrl', () => {
  it('mengambil bagian base64 dari data URL', () => {
    expect(pisahDataUrl('data:image/png;base64,QUJD')).toBe('QUJD')
  })

  it('menerima lampiran lama yang tersimpan tanpa awalan data URL', () => {
    expect(pisahDataUrl('QUJD')).toBe('QUJD')
  })

  it('menolak isi yang bukan base64', () => {
    expect(pisahDataUrl('bukan base64 !!!')).toBeUndefined()
    expect(pisahDataUrl('')).toBeUndefined()
  })
})

describe('susunZipEkspor', () => {
  it('menempatkan Excel di akar dan bukti di folder per laporan', async () => {
    const zip = await susunZipEkspor({
      excel,
      namaExcel: 'Laporan FKIP.xlsx',
      laporan: [
        {
          nomor: 'LT-2026-0002',
          namaPelapor: 'Sidiq Toha',
          lampiran: [{ nama: 'foto.jpg', isiBase64: gambar }],
        },
      ],
    })

    expect(await bacaZip(zip)).toEqual([
      'Laporan FKIP.xlsx',
      'Bukti Pendukung/LT-2026-0002 - Sidiq Toha/foto.jpg',
    ])
  })

  it('menyatakan laporan yang memang tidak memiliki bukti', async () => {
    // Folder kosong tidak tersimpan di dalam ZIP, sehingga tanpa berkas
    // keterangan ini laporan tanpa bukti tidak dapat dibedakan dari bukti yang
    // gagal ikut terbawa.
    const zip = await susunZipEkspor({
      excel,
      namaExcel: 'Laporan FKIP.xlsx',
      laporan: [{ nomor: 'LT-2026-0003', namaPelapor: 'Budi', lampiran: [] }],
    })

    expect(await bacaZip(zip)).toContain('Bukti Pendukung/LT-2026-0003 - Budi/TIDAK ADA BUKTI.txt')
  })

  it('tidak membiarkan dua lampiran bernama sama saling menimpa', async () => {
    const zip = await susunZipEkspor({
      excel,
      namaExcel: 'Laporan FKIP.xlsx',
      laporan: [
        {
          nomor: 'LT-2026-0004',
          namaPelapor: 'Budi',
          lampiran: [
            { nama: 'bukti.jpg', isiBase64: gambar },
            { nama: 'bukti.jpg', isiBase64: gambar },
          ],
        },
      ],
    })

    const isi = await bacaZip(zip)
    expect(isi).toContain('Bukti Pendukung/LT-2026-0004 - Budi/bukti.jpg')
    expect(isi).toContain('Bukti Pendukung/LT-2026-0004 - Budi/bukti (2).jpg')
  })

  it('melewati lampiran yang isinya tidak dapat dibaca tanpa menggagalkan ekspor', async () => {
    // Satu lampiran rusak tidak boleh membatalkan seluruh ekspor; laporan lain
    // tetap harus sampai ke Fakultas.
    const zip = await susunZipEkspor({
      excel,
      namaExcel: 'Laporan FKIP.xlsx',
      laporan: [
        {
          nomor: 'LT-2026-0005',
          namaPelapor: 'Budi',
          lampiran: [
            { nama: 'rusak.jpg', isiBase64: 'bukan base64 !!!' },
            { nama: 'utuh.jpg', isiBase64: gambar },
          ],
        },
      ],
    })

    const isi = await bacaZip(zip)
    expect(isi).toContain('Bukti Pendukung/LT-2026-0005 - Budi/utuh.jpg')
    expect(isi).not.toContain('Bukti Pendukung/LT-2026-0005 - Budi/rusak.jpg')
  })
})

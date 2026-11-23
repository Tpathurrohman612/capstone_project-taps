/**
 * Pemampatan gambar untuk disimpan di dalam dokumen Firestore.
 *
 * Cloud Storage memerlukan paket Blaze, sehingga berkas bukti pendukung
 * disimpan sebagai data base64 di dalam dokumen lampiran. Satu dokumen
 * Firestore dibatasi 1 MiB, dan base64 memperbesar ukuran sekitar sepertiga,
 * sehingga berkas asli harus ditekan jauh di bawah batas itu.
 *
 * Gambar dimampatkan dengan menurunkan ukuran dimensi lebih dulu, baru
 * menurunkan mutu. Urutan itu disengaja: menurunkan dimensi mengurangi ukuran
 * berkas jauh lebih banyak per satuan mutu yang hilang, sehingga tangkapan
 * layar tetap terbaca meskipun ukurannya mengecil.
 *
 * Berkas yang tidak dapat dimampatkan, seperti PDF, hanya diterima bila
 * ukurannya sudah di bawah batas sejak awal.
 */

/** Batas data base64 yang boleh disimpan dalam satu dokumen lampiran. */
export const MAX_BASE64_BYTES = Math.floor(1024 * 1024 * 0.7)

/** Ukuran berkas asli terbesar yang masih muat setelah dijadikan base64. */
export const MAX_STORED_FILE_BYTES = Math.floor((MAX_BASE64_BYTES * 3) / 4)

/** Sisi terpanjang gambar setelah dimampatkan, dalam piksel. */
export const MAX_IMAGE_SIDE = 1600

/** Sisi terpanjang terkecil yang masih dianggap terbaca. */
export const MIN_IMAGE_SIDE = 640

/** Mutu JPEG yang dicoba berurutan, dari paling baik ke paling hemat. */
export const QUALITY_STEPS = [0.82, 0.7, 0.6, 0.5, 0.42] as const

export const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const isCompressibleImage = (tipe: string): boolean =>
  (COMPRESSIBLE_TYPES as readonly string[]).includes(tipe.toLowerCase())

export type Dimensi = { lebar: number; tinggi: number }

/**
 * Menghitung dimensi hasil penyesuaian dengan mempertahankan rasio.
 *
 * Gambar yang sudah lebih kecil dari batas tidak diperbesar, karena
 * memperbesar hanya menambah ukuran berkas tanpa menambah informasi.
 */
export function hitungDimensi(asal: Dimensi, sisiMaksimum: number): Dimensi {
  const { lebar, tinggi } = asal

  if (lebar <= 0 || tinggi <= 0) return { lebar: 0, tinggi: 0 }

  const sisiTerpanjang = Math.max(lebar, tinggi)
  if (sisiTerpanjang <= sisiMaksimum) return { lebar, tinggi }

  const rasio = sisiMaksimum / sisiTerpanjang

  // Dibulatkan ke atas dan dijaga minimal satu piksel, supaya gambar yang
  // sangat memanjang tidak menghasilkan sisi bernilai nol.
  return {
    lebar: Math.max(1, Math.round(lebar * rasio)),
    tinggi: Math.max(1, Math.round(tinggi * rasio)),
  }
}

/** Perkiraan ukuran byte dari panjang teks base64, tanpa bagian data URL. */
export function perkiraanByteBase64(base64: string): number {
  const isi = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64
  const padding = isi.endsWith('==') ? 2 : isi.endsWith('=') ? 1 : 0

  return Math.max(0, Math.floor((isi.length * 3) / 4) - padding)
}

export const muatDalamDokumen = (base64: string): boolean => base64.length <= MAX_BASE64_BYTES

/**
 * Urutan percobaan pemampatan.
 *
 * Setiap langkah menurunkan mutu lebih dulu pada dimensi yang sama, lalu
 * mengecilkan dimensi dan mengulang mutu dari awal. Dengan begitu gambar tidak
 * langsung dikecilkan drastis hanya karena mutu tertinggi tidak muat.
 */
export function langkahPemampatan(
  sisiAwal: number = MAX_IMAGE_SIDE,
): { sisi: number; mutu: number }[] {
  const langkah: { sisi: number; mutu: number }[] = []

  let sisi = sisiAwal
  while (sisi >= MIN_IMAGE_SIDE) {
    for (const mutu of QUALITY_STEPS) langkah.push({ sisi, mutu })
    sisi = Math.round(sisi * 0.75)
  }

  return langkah
}

export type HasilPemampatan =
  | { berhasil: true; dataUrl: string; byte: number; sisi: number; mutu: number }
  | { berhasil: false; alasan: string }

/** Menggambar berkas gambar ke kanvas lalu mengembalikan data URL JPEG. */
async function gambarKeDataUrl(
  bitmap: { width: number; height: number },
  sumber: CanvasImageSource,
  sisi: number,
  mutu: number,
): Promise<string> {
  const { lebar, tinggi } = hitungDimensi({ lebar: bitmap.width, tinggi: bitmap.height }, sisi)

  const kanvas = document.createElement('canvas')
  kanvas.width = lebar
  kanvas.height = tinggi

  const konteks = kanvas.getContext('2d')
  if (!konteks) throw new Error('Peramban tidak mendukung pemampatan gambar.')

  // Latar putih dipasang lebih dulu karena JPEG tidak mengenal transparansi;
  // tanpa ini bagian transparan pada PNG berubah menjadi hitam.
  konteks.fillStyle = '#FFFFFF'
  konteks.fillRect(0, 0, lebar, tinggi)
  konteks.drawImage(sumber, 0, 0, lebar, tinggi)

  return kanvas.toDataURL('image/jpeg', mutu)
}

/**
 * Memampatkan satu berkas gambar sampai muat di dalam dokumen Firestore.
 *
 * Mengembalikan kegagalan sebagai nilai, bukan melemparnya, karena gambar yang
 * tidak dapat dimampatkan bukan kesalahan program dan harus disampaikan kepada
 * pengguna sebagai keterangan.
 */
export async function compressImage(file: File): Promise<HasilPemampatan> {
  if (!isCompressibleImage(file.type)) {
    return {
      berhasil: false,
      alasan: 'Berkas ini bukan gambar sehingga tidak dapat dimampatkan.',
    }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return { berhasil: false, alasan: 'Gambar tidak dapat dibaca peramban.' }
  }

  try {
    for (const { sisi, mutu } of langkahPemampatan()) {
      const dataUrl = await gambarKeDataUrl(bitmap, bitmap, sisi, mutu)

      if (muatDalamDokumen(dataUrl)) {
        return {
          berhasil: true,
          dataUrl,
          byte: perkiraanByteBase64(dataUrl),
          sisi,
          mutu,
        }
      }
    }

    return {
      berhasil: false,
      alasan:
        'Gambar masih terlalu besar setelah dimampatkan. Coba potong bagian yang ' +
        'diperlukan saja lalu unggah ulang.',
    }
  } finally {
    bitmap.close()
  }
}

/** Membaca berkas apa adanya menjadi data URL, untuk berkas yang sudah kecil. */
export async function fileKeDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const pembaca = new FileReader()
    pembaca.onload = () => resolve(String(pembaca.result))
    pembaca.onerror = () => reject(new Error('Berkas gagal dibaca.'))
    pembaca.readAsDataURL(file)
  })
}

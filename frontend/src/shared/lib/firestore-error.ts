/**
 * Penerjemah galat Cloud Firestore.
 *
 * Pesan bawaan Firestore berbunyi "Missing or insufficient permissions", yang
 * benar tetapi tidak membantu: ia tidak menyebutkan izin mana yang kurang
 * maupun apa yang harus dilakukan. Penolakan itu pada aplikasi ini hampir
 * selalu berarti peran yang dipakai tidak sesuai dengan data yang diminta,
 * dan itulah yang perlu disampaikan.
 */

export type KonteksGalat =
  | 'daftar-laporan-administrator'
  | 'daftar-laporan-mahasiswa'
  | 'ubah-status'
  | 'simpan-laporan'
  | 'umum'

const kodeGalat = (penyebab: unknown): string => {
  if (typeof penyebab !== 'object' || penyebab === null) return ''

  const kode = (penyebab as { code?: unknown }).code
  return typeof kode === 'string' ? kode : ''
}

const pesanAsli = (penyebab: unknown): string =>
  penyebab instanceof Error && penyebab.message !== '' ? penyebab.message : ''

export const isPermissionDenied = (penyebab: unknown): boolean => {
  const kode = kodeGalat(penyebab)
  if (kode === 'permission-denied' || kode === 'PERMISSION_DENIED') return true

  return /permission[- ]denied|insufficient permissions/i.test(pesanAsli(penyebab))
}

const PESAN_IZIN: Record<KonteksGalat, string> = {
  'daftar-laporan-administrator':
    'Akun ini belum terdaftar sebagai Administrator, sehingga tidak dapat membaca ' +
    'seluruh laporan. Pengelola perlu menambahkan dokumen berisi UID akun ini pada ' +
    'koleksi administrator di Firebase Console.',
  'daftar-laporan-mahasiswa':
    'Laporan tidak dapat dibaca karena sesi masuk tidak dikenali. Keluar lalu masuk ' +
    'kembali, dan pastikan identitas sudah dilengkapi.',
  'ubah-status':
    'Perubahan status ditolak. Administrator tidak dapat menangani laporan yang ' +
    'dibuatnya sendiri; laporan semacam itu perlu ditangani Administrator lain.',
  'simpan-laporan':
    'Laporan tidak dapat disimpan karena sesi masuk tidak dikenali. Keluar lalu ' +
    'masuk kembali, dan pastikan identitas sudah dilengkapi.',
  umum: 'Permintaan ditolak karena peran akun ini tidak mencukupi untuk data tersebut.',
}

const PESAN_KODE: Record<string, string> = {
  unavailable: 'Tidak dapat menghubungi basis data. Periksa koneksi internet lalu coba lagi.',
  'deadline-exceeded': 'Permintaan terlalu lama tidak dijawab. Coba lagi beberapa saat lagi.',
  unauthenticated: 'Sesi masuk sudah berakhir. Keluar lalu masuk kembali.',
  'resource-exhausted':
    'Kuota basis data untuk hari ini sudah habis. Coba lagi besok atau hubungi pengelola.',
  'failed-precondition':
    'Permintaan ditolak basis data. Bila ini terjadi pada pencarian, kemungkinan ' +
    'indeks yang diperlukan belum dibuat.',
}

/**
 * Mengubah galat Firestore menjadi kalimat yang dapat ditindaklanjuti.
 *
 * Galat yang tidak dikenali dikembalikan apa adanya, bukan diganti kalimat
 * umum, supaya keterangan aslinya tidak hilang justru ketika paling
 * dibutuhkan.
 */
export function jelaskanGalatFirestore(penyebab: unknown, konteks: KonteksGalat = 'umum'): string {
  if (isPermissionDenied(penyebab)) return PESAN_IZIN[konteks]

  const kode = kodeGalat(penyebab).replace(/^firestore\//, '')
  if (kode in PESAN_KODE) return PESAN_KODE[kode] as string

  return pesanAsli(penyebab) || 'Terjadi kesalahan saat menghubungi basis data. Coba lagi.'
}

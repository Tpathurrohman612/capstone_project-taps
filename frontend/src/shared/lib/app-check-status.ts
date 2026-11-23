import { getToken } from 'firebase/app-check'
import { appCheck, isAppCheckEnabled } from './firebase'

/**
 * Status verifikasi App Check.
 *
 * App Check menilai apakah permintaan benar-benar berasal dari aplikasi ini.
 * Penilaian itu dapat gagal pada pengguna yang sah, misalnya karena pemblokir
 * iklan menghalangi skrip reCAPTCHA, jaringan VPN atau kampus yang dipakai
 * beramai-ramai, atau pengaturan privasi peramban yang ketat.
 *
 * Selama penegakan belum dinyalakan, kegagalan itu tidak memblokir apa pun dan
 * hanya tercatat pada metrik. Begitu penegakan nyala, permintaan yang sama
 * akan ditolak sebelum aturan keamanan sempat dievaluasi, dan pengguna hanya
 * akan melihat halaman yang gagal memuat tanpa tahu sebabnya.
 *
 * Karena itu statusnya diperiksa lebih dulu dan diberitahukan, supaya
 * penyebabnya dapat ditindaklanjuti pengguna, bukan ditebak.
 */

export type AppCheckStatus =
  | { keadaan: 'mati' }
  | { keadaan: 'memeriksa' }
  | { keadaan: 'berhasil' }
  | { keadaan: 'gagal'; pesan: string }

/**
 * Pesan yang ditampilkan kepada pengguna.
 *
 * Penyebab pastinya tidak dapat diketahui dari sisi peramban, sehingga
 * kemungkinannya disebutkan sebagai kemungkinan dan bukan sebagai kepastian.
 * Menyatakan "Anda memakai VPN" padahal belum tentu akan membingungkan
 * pengguna yang tidak memakainya.
 */
export const APP_CHECK_FAILURE_MESSAGE =
  'Verifikasi keamanan peramban tidak berhasil. Hal ini biasanya disebabkan ' +
  'pemblokir iklan, jaringan VPN, atau pengaturan privasi yang ketat. ' +
  'Aplikasi masih dapat digunakan, tetapi sebagian data mungkin gagal dimuat.'

/**
 * Memeriksa sekali apakah token App Check dapat diperoleh.
 *
 * Kegagalan tidak dilempar sebagai galat, melainkan dikembalikan sebagai
 * keadaan, karena ketidakmampuan memverifikasi peramban bukan kesalahan
 * program dan tidak boleh menjatuhkan aplikasi.
 */
export async function checkAppCheck(): Promise<AppCheckStatus> {
  if (!isAppCheckEnabled || !appCheck) return { keadaan: 'mati' }

  try {
    const token = await getToken(appCheck, false)
    return token.token !== ''
      ? { keadaan: 'berhasil' }
      : { keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE }
  } catch {
    return { keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE }
  }
}

import { useEffect, useState } from 'react'
import { checkAppCheck } from '../lib/app-check-status'

const DISMISS_KEY = 'taps-app-check-notice-dismissed'

/**
 * Pemberitahuan ketika verifikasi keamanan peramban gagal.
 *
 * Pemberitahuan sengaja tidak menghalangi apa pun: pengguna tetap dapat
 * memakai aplikasi, dan selama penegakan App Check belum dinyalakan,
 * kegagalan ini memang tidak berakibat apa-apa. Nilainya terletak pada saat
 * penegakan nyala, ketika data mulai gagal dimuat tanpa sebab yang terlihat.
 *
 * Penutupan diingat selama sesi peramban, sehingga pemberitahuan yang sama
 * tidak muncul berulang di setiap halaman.
 */
export function AppCheckNotice() {
  const [pesan, setPesan] = useState<string | null>(null)

  useEffect(() => {
    let aktif = true

    const sudahDitutup = (() => {
      try {
        return window.sessionStorage.getItem(DISMISS_KEY) === 'true'
      } catch {
        // Akses sessionStorage dapat ditolak pada mode privasi tertentu.
        // Kegagalan membacanya tidak boleh menyembunyikan pemberitahuan.
        return false
      }
    })()

    if (sudahDitutup) return

    void checkAppCheck()
      .then((status) => {
        if (!aktif) return
        setPesan(status.keadaan === 'gagal' ? status.pesan : null)
      })
      .catch(() => {
        // checkAppCheck menangani kegagalannya sendiri, tetapi penolakan tak
        // tertangani tetap dijaga di sini: pemberitahuan keamanan tidak boleh
        // menjadi sebab aplikasi berhenti.
        if (aktif) setPesan(null)
      })

    return () => {
      aktif = false
    }
  }, [])

  if (!pesan) return null

  const tutup = () => {
    setPesan(null)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // Tidak dapat mengingat penutupan bukan alasan untuk gagal menutup.
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-3xl items-start gap-3 border border-[#E8B882] bg-[#FDF3E8] px-4 py-3 text-sm leading-6 text-[#8A4B12] shadow-lg"
    >
      <span className="flex-1">{pesan}</span>
      <button
        type="button"
        onClick={tutup}
        className="shrink-0 border border-[#8A4B12] px-2 py-1 text-xs font-medium transition hover:bg-[#8A4B12] hover:text-white"
      >
        Tutup
      </button>
    </div>
  )
}

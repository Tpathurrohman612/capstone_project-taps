import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { TampilanNotifikasi } from '../lib/use-notifications'

/**
 * Pemberitahuan mengambang untuk perubahan laporan.
 *
 * Panel notifikasi sebelumnya hanya ada di dasbor dan harus dibuka sendiri
 * lewat ikon lonceng. Mahasiswa yang sedang berada di halaman lain karena itu
 * tidak pernah mengetahui laporannya sudah ditangani sampai ia kebetulan
 * kembali ke dasbor dan menekan loncengnya.
 *
 * Yang ditampilkan hanya notifikasi terbaru yang belum dibaca. Menumpuk
 * seluruhnya akan menutupi halaman yang sedang dibaca, padahal yang mendesak
 * selalu yang terakhir.
 */

/** Kunci penyimpanan notifikasi yang pemberitahuannya sudah ditutup. */
const KUNCI_DITUTUP = 'taps-notifikasi-ditutup'

const bacaDitutup = (): string[] => {
  try {
    const tersimpan = window.sessionStorage.getItem(KUNCI_DITUTUP)
    const terurai: unknown = tersimpan === null ? [] : JSON.parse(tersimpan)
    return Array.isArray(terurai)
      ? terurai.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    // Penyimpanan yang diblokir atau rusak tidak boleh menghilangkan
    // pemberitahuannya; yang terburuk hanyalah muncul kembali.
    return []
  }
}

const simpanDitutup = (daftar: string[]) => {
  try {
    window.sessionStorage.setItem(KUNCI_DITUTUP, JSON.stringify(daftar.slice(-50)))
  } catch {
    // Diabaikan: pemberitahuannya tetap tertutup selama halaman ini terbuka.
  }
}

export function NotifikasiMengambang({
  notifikasi,
  onBaca,
}: {
  notifikasi: readonly TampilanNotifikasi[]
  /** Menandai notifikasi sebagai sudah dibaca di basis data. */
  onBaca?: (id: string) => void | Promise<void>
}) {
  const navigate = useNavigate()
  const [ditutup, setDitutup] = useState<string[]>(() => bacaDitutup())

  const terbaru = notifikasi.find((item) => item.belumDibaca && !ditutup.includes(item.id))

  const tutup = (id: string) => {
    setDitutup((sekarang) => {
      const baru = [...sekarang, id]
      simpanDitutup(baru)
      return baru
    })
  }

  // Pemberitahuan yang menghilang sendiri justru terlewat oleh pengguna yang
  // sedang membaca bagian lain halaman, sehingga ia bertahan sampai ditutup
  // atau dibuka. Yang dicegah hanyalah penumpukan: notifikasi yang sudah
  // ditutup tidak muncul lagi selama sesi ini.
  useEffect(() => {
    if (!terbaru) return

    const padaEsc = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === 'Escape') tutup(terbaru.id)
    }

    window.addEventListener('keydown', padaEsc)
    return () => window.removeEventListener('keydown', padaEsc)
  }, [terbaru])

  if (!terbaru) return null

  const buka = () => {
    void onBaca?.(terbaru.id)
    tutup(terbaru.id)

    // Tanpa nomor laporannya, tujuan yang masuk akal hanyalah daftar
    // riwayatnya. Membuka halaman detail tanpa laporan yang dituju hanya akan
    // menampilkan "laporan tidak ditemukan".
    navigate(
      terbaru.nomorLaporan
        ? `/riwayat-laporan/detail-laporan?report=${terbaru.nomorLaporan}`
        : '/riwayat-laporan',
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 left-1/2 z-50 w-[min(560px,calc(100vw-2.5rem))] -translate-x-1/2 border-2 border-[#12355B] bg-white shadow-[6px_6px_0_#12355B]"
    >
      <div className="flex items-start gap-4 px-5 py-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[#005BAC] text-sm font-semibold text-[#005BAC]">
          !
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
            PEMBARUAN LAPORAN
          </p>
          <p className="mt-1 text-sm leading-6 text-[#1F2937]">{terbaru.pesan}</p>
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={buka}
              className="bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004987]"
            >
              Lihat Detail
            </button>
            <button
              type="button"
              onClick={() => tutup(terbaru.id)}
              className="border-b border-[#52657A] pb-0.5 text-xs font-semibold text-[#52657A] transition hover:border-[#12355B] hover:text-[#12355B]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

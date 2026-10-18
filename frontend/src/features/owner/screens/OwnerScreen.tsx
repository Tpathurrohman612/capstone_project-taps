import { useEffect, useState } from 'react'
import { usePemilik } from '../lib/use-pemilik'
import { fetchAllReports } from '../../../shared/data/report-store'
import type { WorkflowReport } from '../../../shared/types/workflow'
import { maskId } from '../../../shared/lib/mask-id'

/**
 * Perkakas Pemilik, di luar lingkup proposal.
 *
 * Halaman ini tidak muncul pada navigasi mana pun dan hanya dapat dicapai
 * lewat alamatnya langsung. Penyembunyiannya bukan pengamanan: yang menjaga
 * adalah aturan keamanan, yang menolak setiap tindakan di sini bagi akun yang
 * tidak terdaftar sebagai Pemilik. Halaman yang tersembunyi tanpa aturan
 * hanya menunda orang yang penasaran.
 */

/** Tindakan merusak selalu dikonfirmasi, karena tidak satu pun dapat dibatalkan. */
type Konfirmasi = {
  judul: string
  pesan: string
  labelAksi: string
  jalankan: () => Promise<{ berhasil: boolean; alasan?: string }>
}

export function OwnerScreen() {
  const { pemilik, akun, memuat, galat, muatUlang, ubahPeran, hapusPengguna, hapusSatuLaporan } =
    usePemilik()

  const [laporan, setLaporan] = useState<WorkflowReport[]>([])
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi | null>(null)
  const [pesanAksi, setPesanAksi] = useState('')
  const [galatAksi, setGalatAksi] = useState('')
  const [sibuk, setSibuk] = useState(false)

  useEffect(() => {
    if (pemilik !== true) return

    let aktif = true
    fetchAllReports()
      .then((hasil) => {
        if (aktif) setLaporan(hasil)
      })
      .catch(() => {
        if (aktif) setLaporan([])
      })

    return () => {
      aktif = false
    }
  }, [pemilik, akun])

  if (memuat) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5">
        <p className="text-sm text-[#52657A]">Memeriksa peran…</p>
      </main>
    )
  }

  // Akun yang bukan Pemilik tidak diberi tahu bahwa halaman ini ada maupun
  // apa isinya.
  if (pemilik !== true) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5">
        <div className="max-w-md text-center">
          <p className="font-slab text-2xl text-[#12355B]">Halaman tidak ditemukan</p>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Alamat yang Anda buka tidak tersedia untuk akun ini.
          </p>
        </div>
      </main>
    )
  }

  const jalankanKonfirmasi = async () => {
    if (!konfirmasi) return

    setSibuk(true)
    setGalatAksi('')
    const hasil = await konfirmasi.jalankan()
    setSibuk(false)
    setKonfirmasi(null)

    if (hasil.berhasil) {
      setPesanAksi(`${konfirmasi.judul} berhasil.`)
      return
    }

    setGalatAksi(hasil.alasan ?? 'Tindakan gagal dijalankan.')
  }

  const mintaKonfirmasi = (nilai: Konfirmasi) => {
    setPesanAksi('')
    setGalatAksi('')
    setKonfirmasi(nilai)
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-8 py-10 text-[#1F2937] max-[620px]:px-5">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#B42318]">
          PERKAKAS PENGEMBANG · DI LUAR LINGKUP PROPOSAL
        </p>
        <h1 className="mt-3 font-slab text-3xl text-[#12355B]">Konsol Pemilik</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52657A]">
          Menata peran dan membersihkan data. Setiap tindakan di halaman ini permanen dan tidak
          dapat dibatalkan.
        </p>

        {galat && (
          <p
            role="alert"
            className="mt-5 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-sm leading-6 text-[#B42318]"
          >
            {galat}
          </p>
        )}
        {pesanAksi && (
          <p className="mt-5 border border-[#A8C5DC] bg-[#F2F7FB] px-4 py-3 text-sm leading-6 text-[#005BAC]">
            {pesanAksi}
          </p>
        )}
        {galatAksi && (
          <p
            role="alert"
            className="mt-5 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-sm leading-6 text-[#B42318]"
          >
            {galatAksi}
          </p>
        )}

        <section className="mt-8 border border-[#D9E2EC] bg-white" aria-labelledby="daftar-akun">
          <div className="flex items-center justify-between gap-4 border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                IAM
              </p>
              <h2 id="daftar-akun" className="mt-1 font-slab text-2xl text-[#12355B]">
                Akun dan Peran
              </h2>
            </div>
            <button
              type="button"
              onClick={muatUlang}
              className="border border-[#12355B] px-3 py-2 text-xs font-semibold text-[#12355B]"
            >
              Muat Ulang
            </button>
          </div>

          {akun.length === 0 ? (
            <p className="px-6 py-6 text-sm text-[#52657A]">Belum ada akun terdaftar.</p>
          ) : (
            <ul className="divide-y divide-[#D9E2EC]">
              {akun.map((item) => (
                <li
                  key={item.uid}
                  className="flex items-start justify-between gap-5 px-6 py-5 max-[760px]:block"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#12355B]">
                      {item.nama || 'Tanpa nama'}
                      {item.administrator && (
                        <span className="ml-3 border border-[#005BAC] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#005BAC]">
                          ADMINISTRATOR
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm break-words text-[#52657A]">{item.email}</p>
                    <p className="mt-1 font-mono text-[11px] text-[#52657A]">
                      NIM {item.nim || '—'} · UID {maskId(item.uid)}
                    </p>
                    <p className="mt-1 text-xs text-[#52657A]">
                      {item.fakultas || 'Fakultas belum diisi'}
                      {item.programStudi ? ` · ${item.programStudi}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 max-[760px]:mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        mintaKonfirmasi({
                          judul: item.administrator ? 'Pencabutan peran' : 'Pengangkatan peran',
                          pesan: item.administrator
                            ? `Cabut peran Administrator dari ${item.nama || item.email}? Akun ini kembali menjadi Mahasiswa.`
                            : `Angkat ${item.nama || item.email} menjadi Administrator? Akun ini akan dapat menangani seluruh laporan.`,
                          labelAksi: item.administrator ? 'Cabut Peran' : 'Angkat Administrator',
                          jalankan: () => ubahPeran(item, !item.administrator),
                        })
                      }
                      className="border border-[#005BAC] px-3 py-2 text-xs font-semibold text-[#005BAC]"
                    >
                      {item.administrator ? 'Cabut Peran' : 'Jadikan Administrator'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        mintaKonfirmasi({
                          judul: 'Penghapusan akun',
                          pesan: `Hapus akun ${item.nama || item.email} beserta tautan NIM-nya? Laporan yang pernah dibuatnya tetap tersimpan sebagai catatan penanganan.`,
                          labelAksi: 'Hapus Akun',
                          jalankan: () => hapusPengguna(item),
                        })
                      }
                      className="border border-[#B42318] px-3 py-2 text-xs font-semibold text-[#B42318]"
                    >
                      Hapus Akun
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 border border-[#D9E2EC] bg-white" aria-labelledby="daftar-laporan">
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              DATA
            </p>
            <h2 id="daftar-laporan" className="mt-1 font-slab text-2xl text-[#12355B]">
              Laporan
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Menghapus laporan sekaligus menghapus lampiran, riwayat status, dan catatan
              penanganannya.
            </p>
          </div>

          {laporan.length === 0 ? (
            <p className="px-6 py-6 text-sm text-[#52657A]">Belum ada laporan tersimpan.</p>
          ) : (
            <ul className="divide-y divide-[#D9E2EC]">
              {laporan.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:block"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-[#005BAC]">{item.id}</p>
                    <p className="mt-1 text-sm break-words text-[#1F2937]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#52657A]">
                      {item.status} · {item.submitted}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!item.docId}
                    title={item.docId ? undefined : 'Laporan ini belum tersimpan di basis data.'}
                    onClick={() =>
                      mintaKonfirmasi({
                        judul: 'Penghapusan laporan',
                        pesan: `Hapus ${item.id} beserta seluruh lampiran dan riwayatnya?`,
                        labelAksi: 'Hapus Laporan',
                        jalankan: () => hapusSatuLaporan(item.docId ?? ''),
                      })
                    }
                    className="shrink-0 border border-[#B42318] px-3 py-2 text-xs font-semibold text-[#B42318] disabled:cursor-not-allowed disabled:border-[#B9C8D7] disabled:text-[#7D8B99] max-[620px]:mt-3"
                  >
                    Hapus Laporan
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {konfirmasi && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12355B]/30 p-5"
        >
          <div className="w-full max-w-md border-2 border-[#B42318] bg-white p-6 shadow-[7px_7px_0_#B42318]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#B42318]">
              TINDAKAN PERMANEN
            </p>
            <h2 className="mt-2 font-slab text-2xl text-[#12355B]">{konfirmasi.judul}</h2>
            <p className="mt-3 text-sm leading-6 text-[#1F2937]">{konfirmasi.pesan}</p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setKonfirmasi(null)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={sibuk}
                onClick={() => void jalankanKonfirmasi()}
                className="bg-[#B42318] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
              >
                {sibuk ? 'Menjalankan…' : konfirmasi.labelAksi}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

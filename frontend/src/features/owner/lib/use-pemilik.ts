import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../shared/lib/auth-context'
import { jelaskanGalatFirestore } from '../../../shared/lib/firestore-error'
import {
  hapusAkun,
  hapusLaporan,
  isPemilik,
  listAkun,
  setAdministrator,
  type AkunPengguna,
} from './pemilik-repository'

/**
 * Keadaan perkakas Pemilik.
 *
 * Peran dan daftarnya dibaca terpisah dari peran lain, karena perkakas ini
 * berada di luar lingkup proposal dan tidak boleh memengaruhi alur mana pun
 * yang dipakai Mahasiswa maupun Administrator.
 */
export function usePemilik() {
  const { user } = useAuth()
  const [pemilik, setPemilik] = useState<boolean | undefined>(undefined)
  const [akun, setAkun] = useState<AkunPengguna[]>([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState<string | undefined>(undefined)
  const [penanda, setPenanda] = useState(0)

  const uid = user?.uid ?? ''

  useEffect(() => {
    let aktif = true

    if (uid === '') {
      setPemilik(false)
      setMemuat(false)
      return
    }

    setMemuat(true)
    isPemilik(uid)
      .then(async (hasil) => {
        if (!aktif) return
        setPemilik(hasil)

        // Daftar akun hanya dibaca bila perannya memang Pemilik; membacanya
        // lebih dahulu akan menerbitkan penolakan aturan bagi setiap pengguna
        // biasa yang kebetulan membuka alamat ini.
        if (hasil) setAkun(await listAkun())
      })
      .catch((penyebab: unknown) => {
        if (!aktif) return
        setGalat(jelaskanGalatFirestore(penyebab))
      })
      .finally(() => {
        if (aktif) setMemuat(false)
      })

    return () => {
      aktif = false
    }
  }, [uid, penanda])

  const muatUlang = useCallback(() => setPenanda((nilai) => nilai + 1), [])

  const jalankan = useCallback(
    async (tindakan: () => Promise<void>): Promise<{ berhasil: boolean; alasan?: string }> => {
      try {
        await tindakan()
        muatUlang()
        return { berhasil: true }
      } catch (penyebab) {
        return { berhasil: false, alasan: jelaskanGalatFirestore(penyebab) }
      }
    },
    [muatUlang],
  )

  return {
    pemilik,
    akun,
    memuat,
    galat,
    muatUlang,
    ubahPeran: (target: AkunPengguna, jadikan: boolean) =>
      jalankan(() => setAdministrator(target.uid, jadikan)),
    hapusPengguna: (target: AkunPengguna) =>
      jalankan(() => hapusAkun({ uid: target.uid, nim: target.nim })),
    hapusSatuLaporan: (docId: string) => jalankan(() => hapusLaporan(docId)),
  }
}

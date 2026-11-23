import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

/**
 * Pengujian alur halaman Buat Laporan.
 *
 * Berkas ini lahir dari satu cacat yang lolos seluruh pengujian unit:
 * mahasiswa yang identitasnya sudah lengkap terus dialihkan ke halaman
 * lengkapi identitas setiap kali menekan kirim, sehingga laporan tidak pernah
 * dapat dibuat. Tidak ada modul yang salah; yang salah adalah keputusan ke
 * mana aplikasi membawa pengguna.
 *
 * Satu hal penting tentang cara pengujian ini ditulis. Versi pertamanya
 * mengirim formulir kosong, sehingga validasi isian berhenti lebih dulu dan
 * pemeriksaan identitas tidak pernah tersentuh. Pengujian itu lolos bahkan
 * ketika cacatnya sengaja dikembalikan, yaitu pengujian yang tampak benar
 * tetapi tidak membuktikan apa pun. Karena itu setiap pengujian di bawah
 * mengisi seluruh isian wajib lebih dulu, agar pengiriman benar-benar sampai
 * pada keputusan perpindahan halaman.
 */

const navigate = vi.fn()
const mockIdentity = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ search: '', pathname: '/buat-laporan' }),
  Link: ({ children }: { children: ReactNode }) => children,
  Navigate: () => null,
}))

vi.mock('../lib/student-identity', () => ({
  useStudentIdentity: () => mockIdentity(),
}))

const identitasLengkap = {
  ownerKey: 'uid-123',
  nim: '041111111',
  nama: 'Sidiq',
  email: 'mhs@ecampus.ut.ac.id',
  fakultas: 'Fakultas Sains dan Teknologi',
  programStudi: 'Sistem Informasi',
  utDaerah: 'UT Jakarta',
  memuat: false,
  lengkap: true,
}

const { CreateReportScreen } = await import('./CreateReportScreen')

/** Nilai untuk seluruh isian wajib, sesuai requiredFields pada layar. */
const ISIAN: Record<string, string> = {
  // Nilai select wajib benar-benar ada di daftar opsinya. Menyetel nilai yang
  // tidak terdaftar membuat select tetap kosong, validasi gagal, dan pengujian
  // berhenti sebelum menyentuh keputusan perpindahan halaman.
  category: 'Aktivitas tutor',
  courseType: 'Teori/Umum',
  courseCode: 'MSIM4301',
  courseName: 'Rekayasa Perangkat Lunak',
  className: '01',
  tutor: 'Budi Santoso',
  duration: 'Kurang dari 3 hari',
  title: 'Tugas 1 belum dinilai',
  description: 'Sudah minggu keenam dan nilai belum keluar.',
}

/**
 * Mengisi seluruh isian wajib langsung pada elemen DOM.
 *
 * Nilai disetel lewat setter bawaan prototipe agar React menyadari
 * perubahannya; menyetel `.value` begitu saja akan diabaikan React pada
 * komponen terkendali.
 */
function isiFormulir(container: HTMLElement) {
  for (const [nama, nilai] of Object.entries(ISIAN)) {
    const elemen = container.querySelector<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(`[name="${nama}"]`)

    if (!elemen) throw new Error(`Isian wajib "${nama}" tidak ditemukan pada formulir.`)

    const prototipe =
      elemen instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : elemen instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype

    const setter = Object.getOwnPropertyDescriptor(prototipe, 'value')?.set
    setter?.call(elemen, nilai)
    elemen.dispatchEvent(new Event('input', { bubbles: true }))
    elemen.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

function kirimFormulir(container: HTMLElement) {
  const form = container.querySelector('form')
  if (!form) throw new Error('Formulir tidak ditemukan.')
  isiFormulir(container)
  form.requestSubmit()
  return form
}

describe('alur Buat Laporan', () => {
  beforeEach(() => {
    navigate.mockReset()
    mockIdentity.mockReset()
    window.sessionStorage.clear()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan formulir ketika identitas sudah lengkap', () => {
    mockIdentity.mockReturnValue(identitasLengkap)

    render(<CreateReportScreen />)

    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument()
  })

  it('memuat seluruh isian wajib yang diharapkan pengujian', () => {
    // Menjaga pengujian lain tetap bermakna: bila sebuah isian berganti nama,
    // kegagalan muncul di sini dengan sebab yang jelas, bukan berupa pengujian
    // lain yang diam-diam berhenti menguji apa pun.
    mockIdentity.mockReturnValue(identitasLengkap)

    const { container } = render(<CreateReportScreen />)

    for (const nama of Object.keys(ISIAN)) {
      expect(container.querySelector(`[name="${nama}"]`), `isian ${nama} hilang`).not.toBeNull()
    }
  })

  it('tidak mengalihkan pengguna hanya karena membuka halaman', () => {
    mockIdentity.mockReturnValue(identitasLengkap)

    render(<CreateReportScreen />)

    expect(navigate).not.toHaveBeenCalled()
  })

  it('tidak mengalihkan ke lengkapi identitas ketika identitas lengkap', async () => {
    // Pengujian inti: identitas lengkap dan formulir terisi, sehingga tidak
    // ada alasan apa pun untuk melempar pengguna ke halaman identitas.
    mockIdentity.mockReturnValue(identitasLengkap)

    const { container } = render(<CreateReportScreen />)
    kirimFormulir(container)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalledWith('/lengkapi-identitas')
    })
  })

  it('mengalihkan ke lengkapi identitas ketika identitas memang belum lengkap', async () => {
    mockIdentity.mockReturnValue({
      ...identitasLengkap,
      ownerKey: undefined,
      nim: undefined,
      lengkap: false,
    })

    const { container } = render(<CreateReportScreen />)
    kirimFormulir(container)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/lengkapi-identitas')
    })
  })

  it('menahan pengiriman selama identitas masih dimuat', async () => {
    // Saat status masuk belum tiba, aplikasi tidak boleh menyimpulkan apa pun.
    // Mengalihkan pada saat ini persis yang menyebabkan cacat semula, dan
    // pengujian inilah yang gagal bila penjagaannya dihapus.
    mockIdentity.mockReturnValue({
      ...identitasLengkap,
      ownerKey: undefined,
      nim: undefined,
      lengkap: false,
      memuat: true,
    })

    const { container } = render(<CreateReportScreen />)
    kirimFormulir(container)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalledWith('/lengkapi-identitas')
    })
  })
})

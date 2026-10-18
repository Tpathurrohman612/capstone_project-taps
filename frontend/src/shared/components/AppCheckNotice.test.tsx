import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Pemberitahuan kegagalan verifikasi App Check.
 *
 * Yang diuji bukan tampilannya, melainkan keputusannya: kapan pemberitahuan
 * muncul, kapan tidak, dan apakah kegagalan pemeriksaan dapat menjatuhkan
 * aplikasi. Pemberitahuan yang muncul pada pengguna yang baik-baik saja sama
 * merugikannya dengan pemberitahuan yang tidak pernah muncul.
 */

const mockCheck = vi.fn()

vi.mock('../lib/app-check-status', async () => {
  const asli =
    await vi.importActual<typeof import('../lib/app-check-status')>('../lib/app-check-status')
  return { ...asli, checkAppCheck: () => mockCheck() }
})

const { AppCheckNotice } = await import('./AppCheckNotice')
const { APP_CHECK_FAILURE_MESSAGE } = await import('../lib/app-check-status')

describe('AppCheckNotice', () => {
  beforeEach(() => {
    mockCheck.mockReset()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('tidak menampilkan apa pun ketika App Check mati', async () => {
    // Mode pengembangan dan emulator mematikan App Check, dan pengguna tidak
    // boleh melihat peringatan keamanan yang tidak berlaku baginya.
    mockCheck.mockResolvedValue({ keadaan: 'mati' })

    const { container } = render(<AppCheckNotice />)

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('tidak menampilkan apa pun ketika verifikasi berhasil', async () => {
    mockCheck.mockResolvedValue({ keadaan: 'berhasil' })

    const { container } = render(<AppCheckNotice />)

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('menampilkan pemberitahuan ketika verifikasi gagal', async () => {
    mockCheck.mockResolvedValue({ keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE })

    render(<AppCheckNotice />)

    expect(await screen.findByRole('status')).toHaveTextContent(/verifikasi keamanan/i)
  })

  it('menyebut kemungkinan penyebab tanpa menyatakannya sebagai kepastian', async () => {
    // Penyebab pastinya tidak dapat diketahui dari peramban, sehingga
    // menyatakan "Anda memakai VPN" akan membingungkan pengguna yang tidak.
    mockCheck.mockResolvedValue({ keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE })

    render(<AppCheckNotice />)
    const pemberitahuan = await screen.findByRole('status')

    expect(pemberitahuan).toHaveTextContent(/biasanya disebabkan/i)
    expect(pemberitahuan).toHaveTextContent(/pemblokir iklan/i)
    expect(pemberitahuan).toHaveTextContent(/VPN/i)
  })

  it('menegaskan aplikasi masih dapat digunakan', async () => {
    // Pemberitahuan ini tidak menghalangi apa pun, sehingga nadanya tidak
    // boleh membuat pengguna mengira aplikasinya rusak.
    mockCheck.mockResolvedValue({ keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE })

    render(<AppCheckNotice />)

    expect(await screen.findByRole('status')).toHaveTextContent(/masih dapat digunakan/i)
  })

  it('memakai peran status, bukan alert, agar tidak memotong pembaca layar', async () => {
    mockCheck.mockResolvedValue({ keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE })

    render(<AppCheckNotice />)

    const pemberitahuan = await screen.findByRole('status')
    expect(pemberitahuan).toHaveAttribute('aria-live', 'polite')
  })

  it('tidak muncul lagi setelah ditutup pada sesi yang sama', async () => {
    mockCheck.mockResolvedValue({ keadaan: 'gagal', pesan: APP_CHECK_FAILURE_MESSAGE })
    window.sessionStorage.setItem('taps-app-check-notice-dismissed', 'true')

    const { container } = render(<AppCheckNotice />)

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it('tidak menjatuhkan aplikasi ketika pemeriksaan melempar galat', async () => {
    // Ketidakmampuan memverifikasi peramban bukan kesalahan program.
    mockCheck.mockRejectedValue(new Error('jaringan putus'))

    expect(() => render(<AppCheckNotice />)).not.toThrow()
  })
})

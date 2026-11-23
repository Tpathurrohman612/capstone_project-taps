import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Sesi peran di sessionStorage.
 *
 * Modul ini menyentuh window.location pada saat keluar, sehingga seluruh
 * pengujian memakai window tiruan. Pemuatan modul dilakukan dinamis di dalam
 * setiap pengujian agar tiruan sudah terpasang sebelum modul membaca window.
 */

function createMockStorage() {
  const values = new Map<string, string>()

  return {
    values,
    storage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, String(value))
      }),
      removeItem: vi.fn((key: string) => {
        values.delete(key)
      }),
    },
  }
}

const ROLE_KEY = 'taps-active-user-role'

describe('auth-session', () => {
  let browser: ReturnType<typeof createMockStorage>
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    browser = createMockStorage()
    assign = vi.fn()

    vi.stubGlobal('window', {
      sessionStorage: browser.storage,
      localStorage: browser.storage,
      location: { assign },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const muat = async () => await import('./auth-session')

  describe('getActiveUserRole', () => {
    it('mengembalikan null ketika belum ada sesi', async () => {
      const { getActiveUserRole } = await muat()
      expect(getActiveUserRole()).toBeNull()
    })

    it('mengembalikan peran yang tersimpan', async () => {
      const { getActiveUserRole, setActiveUserRole } = await muat()

      setActiveUserRole('Administrator')
      expect(getActiveUserRole()).toBe('Administrator')

      setActiveUserRole('Mahasiswa')
      expect(getActiveUserRole()).toBe('Mahasiswa')
    })

    it('menolak nilai yang bukan peran yang dikenal', async () => {
      // Nilai di sessionStorage dapat disunting siapa pun lewat devtools,
      // sehingga nilai asing harus diperlakukan seperti belum masuk.
      browser.values.set(ROLE_KEY, 'Superadmin')

      const { getActiveUserRole } = await muat()
      expect(getActiveUserRole()).toBeNull()
    })

    it('menolak nilai kosong', async () => {
      browser.values.set(ROLE_KEY, '')

      const { getActiveUserRole } = await muat()
      expect(getActiveUserRole()).toBeNull()
    })
  })

  describe('clearPrototypeAuthSession', () => {
    it('membuang peran dan konteks layar administrator', async () => {
      const { clearPrototypeAuthSession, getActiveUserRole, setActiveUserRole } = await muat()

      setActiveUserRole('Administrator')
      browser.values.set('taps-active-google-account', 'a@contoh.ac.id')
      browser.values.set('adminDetailContext', 'history')
      browser.values.set('adminDetailId', 'LT-2026-0007')

      clearPrototypeAuthSession()

      expect(getActiveUserRole()).toBeNull()
      expect(browser.values.has('taps-active-google-account')).toBe(false)
      expect(browser.values.has('adminDetailContext')).toBe(false)
      expect(browser.values.has('adminDetailId')).toBe(false)
    })

    it('aman dipanggil ketika tidak ada sesi', async () => {
      const { clearPrototypeAuthSession } = await muat()
      expect(() => clearPrototypeAuthSession()).not.toThrow()
    })
  })

  describe('handlePrototypeLogout', () => {
    it('membersihkan sesi lalu berpindah ke halaman masuk', async () => {
      const { handlePrototypeLogout, setActiveUserRole } = await muat()

      setActiveUserRole('Mahasiswa')
      handlePrototypeLogout()

      // Pembersihan sessionStorage terjadi segera; perpindahan halaman
      // menunggu signOut Firebase selesai.
      expect(browser.values.has(ROLE_KEY)).toBe(false)

      await vi.waitFor(() => {
        expect(assign).toHaveBeenCalledWith('/login')
      })
    })

    it('tetap berpindah halaman meskipun signOut gagal', async () => {
      // Kegagalan keluar dari Firebase tidak boleh menahan pengguna di dalam
      // aplikasi dengan sesi yang sudah dibersihkan sebagian.
      const { handlePrototypeLogout } = await muat()

      handlePrototypeLogout()

      await vi.waitFor(() => {
        expect(assign).toHaveBeenCalledWith('/login')
      })
    })
  })
})

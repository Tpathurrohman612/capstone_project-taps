import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACTIVE_GOOGLE_ACCOUNT_KEY,
  getActiveStudentFaculty,
  getLinkedGoogleAccounts,
  GOOGLE_ACCOUNT_LINK_KEY,
  NEW_GOOGLE_ACCOUNT_EMAIL,
  REGISTERED_GOOGLE_ACCOUNT_EMAIL,
} from './google-account'

describe('google-account', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('sessionStorage', sessionStorageMock)
    vi.stubGlobal('window', {
      localStorage: localStorageMock,
      sessionStorage: sessionStorageMock,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('getLinkedGoogleAccounts', () => {
    it('returns empty array when no accounts are stored', () => {
      expect(getLinkedGoogleAccounts()).toEqual([])
    })

    it('parses accounts with email, nim, and valid canonical faculty', () => {
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          {
            email: 'student@example.com',
            nim: '042557001',
            faculty: 'Fakultas Ekonomi dan Bisnis',
          },
        ]),
      )

      const result = getLinkedGoogleAccounts()
      expect(result).toEqual([
        {
          email: 'student@example.com',
          nim: '042557001',
          faculty: 'Fakultas Ekonomi dan Bisnis',
        },
      ])
    })

    it('preserves legacy accounts without faculty and leaves faculty as undefined', () => {
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          {
            email: 'legacy@example.com',
            nim: '042557999',
          },
        ]),
      )

      const result = getLinkedGoogleAccounts()
      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('legacy@example.com')
      expect(result[0].nim).toBe('042557999')
      expect(result[0].faculty).toBeUndefined()
    })

    it('discards invalid faculty values while preserving email and nim', () => {
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          {
            email: 'invalid.faculty@example.com',
            nim: '042557888',
            faculty: 'Fakultas Sembarang',
          },
        ]),
      )

      const result = getLinkedGoogleAccounts()
      expect(result).toEqual([
        {
          email: 'invalid.faculty@example.com',
          nim: '042557888',
        },
      ])
      expect(result[0].faculty).toBeUndefined()
    })

    it('ignores malformed items in localStorage', () => {
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          null,
          'invalid',
          { email: '' },
          { nim: '123' },
          { email: 'valid@example.com', nim: '042557777' },
        ]),
      )

      const result = getLinkedGoogleAccounts()
      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('valid@example.com')
    })
  })

  describe('getActiveStudentFaculty', () => {
    it('returns Fakultas Sains dan Teknologi for demo registered.student@gmail.com', () => {
      sessionStorageMock.setItem(ACTIVE_GOOGLE_ACCOUNT_KEY, REGISTERED_GOOGLE_ACCOUNT_EMAIL)
      expect(getActiveStudentFaculty()).toBe('Fakultas Sains dan Teknologi')
    })

    it('returns linked account faculty for actively logged in user', () => {
      sessionStorageMock.setItem(ACTIVE_GOOGLE_ACCOUNT_KEY, 'custom.student@gmail.com')
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          {
            email: 'custom.student@gmail.com',
            nim: '042557555',
            faculty: 'Fakultas Keguruan dan Ilmu Pendidikan',
          },
        ]),
      )

      expect(getActiveStudentFaculty()).toBe('Fakultas Keguruan dan Ilmu Pendidikan')
    })

    it('returns undefined without automatic fallback for new or legacy accounts lacking faculty', () => {
      sessionStorageMock.setItem(ACTIVE_GOOGLE_ACCOUNT_KEY, NEW_GOOGLE_ACCOUNT_EMAIL)
      expect(getActiveStudentFaculty()).toBeUndefined()

      sessionStorageMock.setItem(ACTIVE_GOOGLE_ACCOUNT_KEY, 'legacy.user@gmail.com')
      localStorageMock.setItem(
        GOOGLE_ACCOUNT_LINK_KEY,
        JSON.stringify([
          {
            email: 'legacy.user@gmail.com',
            nim: '042557444',
          },
        ]),
      )
      expect(getActiveStudentFaculty()).toBeUndefined()
    })
  })
})

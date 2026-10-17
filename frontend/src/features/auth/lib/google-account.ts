import { FACULTIES, type Faculty } from '../../../shared/data/faculties'

export const NEW_GOOGLE_ACCOUNT_EMAIL = 'new.student@gmail.com'
export const SECOND_NEW_GOOGLE_ACCOUNT_EMAIL = 'second.student@gmail.com'
export const REGISTERED_GOOGLE_ACCOUNT_EMAIL = 'registered.student@gmail.com'
export const GOOGLE_ACCOUNT_LINK_KEY = 'taps-linked-google-account'
export const ACTIVE_GOOGLE_ACCOUNT_KEY = 'taps-active-google-account'
export const REGISTERED_NIMS = new Set(['042557013'])
export const REGISTERED_GOOGLE_ACCOUNT_NIM = '042557013'

// Administrator access for the prototype login screen is configured through
// Vite environment variables instead of literals in source, so no credential
// is committed. A Vite build inlines these values into the client bundle, so
// they are configuration rather than a secret; server side authentication
// arrives with Firebase Authentication. When either variable is unset the list
// stays empty and the internal login form rejects every attempt, rather than
// accepting a blank email and password.
const administratorEmail = (import.meta.env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase()
const administratorPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

export const INTERNAL_ACCOUNTS =
  administratorEmail !== '' && administratorPassword !== ''
    ? ([
        {
          email: administratorEmail,
          password: administratorPassword,
          role: 'Administrator',
        },
      ] as const)
    : ([] as const)

export type LinkedGoogleAccount = {
  email: string
  nim: string
  faculty?: Faculty
}

const isFaculty = (value: unknown): value is Faculty =>
  typeof value === 'string' && (FACULTIES as readonly string[]).includes(value)

export function getLinkedGoogleAccounts(): LinkedGoogleAccount[] {
  const storedAccounts = window.localStorage.getItem(GOOGLE_ACCOUNT_LINK_KEY)
  if (!storedAccounts) return []

  try {
    const parsed: unknown = JSON.parse(storedAccounts)
    const entries: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

    return entries
      .filter(
        (entry): entry is { email: string; nim: string; faculty?: unknown } =>
          typeof entry === 'object' &&
          entry !== null &&
          'email' in entry &&
          typeof entry.email === 'string' &&
          entry.email.trim() !== '' &&
          'nim' in entry &&
          typeof entry.nim === 'string' &&
          entry.nim.trim() !== '',
      )
      .map((entry) => ({
        email: entry.email,
        nim: entry.nim,
        ...(isFaculty(entry.faculty) ? { faculty: entry.faculty } : {}),
      }))
  } catch {
    return []
  }
}

export function getLinkedGoogleAccountByEmail(email: string): LinkedGoogleAccount | undefined {
  return getLinkedGoogleAccounts().find(
    (account) => account.email.toLowerCase() === email.toLowerCase(),
  )
}

export function getActiveGoogleAccountEmail() {
  return window.sessionStorage.getItem(ACTIVE_GOOGLE_ACCOUNT_KEY) ?? NEW_GOOGLE_ACCOUNT_EMAIL
}

export function getActiveStudentFaculty(): Faculty | undefined {
  const activeEmail = getActiveGoogleAccountEmail()
  if (activeEmail.toLowerCase() === REGISTERED_GOOGLE_ACCOUNT_EMAIL.toLowerCase()) {
    return 'Fakultas Sains dan Teknologi'
  }
  return getLinkedGoogleAccountByEmail(activeEmail)?.faculty
}

// NIM of the student in the active session, used as the ownership key on every
// report. It is undefined when the signed-in Google account has not completed
// identity setup yet, and callers must refuse to write a report in that case.
export function getActiveStudentNim(): string | undefined {
  const activeEmail = getActiveGoogleAccountEmail()
  if (activeEmail.toLowerCase() === REGISTERED_GOOGLE_ACCOUNT_EMAIL.toLowerCase()) {
    return REGISTERED_GOOGLE_ACCOUNT_NIM
  }
  return getLinkedGoogleAccountByEmail(activeEmail)?.nim
}

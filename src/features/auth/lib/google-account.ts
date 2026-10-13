export const NEW_GOOGLE_ACCOUNT_EMAIL = 'new.student@gmail.com'
export const SECOND_NEW_GOOGLE_ACCOUNT_EMAIL = 'second.student@gmail.com'
export const REGISTERED_GOOGLE_ACCOUNT_EMAIL = 'registered.student@gmail.com'
export const GOOGLE_ACCOUNT_LINK_KEY = 'taps-linked-google-account'
export const ACTIVE_GOOGLE_ACCOUNT_KEY = 'taps-active-google-account'
export const REGISTERED_NIMS = new Set(['042557013'])
export const INTERNAL_ACCOUNTS = [
  {
    email: 'administrator@laportuton.example',
    password: 'Admin123!',
    role: 'Administrator',
  },
] as const

export type LinkedGoogleAccount = {
  email: string
  nim: string
}

export function getLinkedGoogleAccounts(): LinkedGoogleAccount[] {
  const storedAccounts = window.localStorage.getItem(GOOGLE_ACCOUNT_LINK_KEY)
  if (!storedAccounts) return []

  try {
    const parsed: unknown = JSON.parse(storedAccounts)
    const entries: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

    return entries.filter(
      (entry): entry is LinkedGoogleAccount =>
        typeof entry === 'object' &&
        entry !== null &&
        'email' in entry &&
        typeof entry.email === 'string' &&
        entry.email.trim() !== '' &&
        'nim' in entry &&
        typeof entry.nim === 'string' &&
        entry.nim.trim() !== '',
    )
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

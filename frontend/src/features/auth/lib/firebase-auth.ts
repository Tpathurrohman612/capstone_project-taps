import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../../../shared/lib/firebase'

/**
 * Firebase Authentication wrapper.
 *
 * Every function here refuses to run when Firebase is not configured, so a
 * teammate without `.env.local` gets a clear message instead of a crash deep
 * inside the SDK. Callers check `isFirebaseConfigured()` first and fall back to
 * the prototype simulation when it returns false.
 */

export class AuthNotConfiguredError extends Error {
  constructor() {
    super(
      'Firebase belum dikonfigurasi. Salin frontend/.env.example menjadi ' +
        'frontend/.env.local lalu isi nilainya dari Firebase Console.',
    )
    this.name = 'AuthNotConfiguredError'
  }
}

const provider = new GoogleAuthProvider()

// Always show the account chooser. Without this Google silently reuses the one
// account already signed in to the browser, which makes it impossible to test
// the "second student" flow on a shared machine.
provider.setCustomParameters({ prompt: 'select_account' })

/** Opens the Google account chooser and returns the signed-in user. */
export async function signInWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured()) throw new AuthNotConfiguredError()

  const credential = await signInWithPopup(auth, provider)
  return credential.user
}

export async function signOutFromFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return
  await signOut(auth)
}

/**
 * Subscribes to sign-in state. Returns the unsubscribe function, or a no-op
 * when Firebase is absent so callers can always call it in a cleanup.
 */
export function observeAuthState(listener: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured()) {
    listener(null)
    return () => {}
  }

  return onAuthStateChanged(auth, listener)
}

/**
 * Turns a Firebase auth error code into an Indonesian message. Codes that mean
 * "the user changed their mind" are not errors worth showing, so they map to an
 * empty string and the caller stays silent.
 */
export function describeAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''

  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ''
    case 'auth/popup-blocked':
      return 'Jendela masuk Google diblokir peramban. Izinkan pop-up untuk situs ini lalu coba lagi.'
    case 'auth/network-request-failed':
      return 'Gagal menghubungi Google. Periksa koneksi internet lalu coba lagi.'
    case 'auth/unauthorized-domain':
      return 'Domain ini belum diizinkan di Firebase Console pada Authentication, Settings, Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Metode masuk Google belum diaktifkan di Firebase Console pada Authentication, Sign-in method.'
    default:
      return error instanceof Error && error.message !== ''
        ? error.message
        : 'Terjadi kesalahan saat masuk. Coba lagi.'
  }
}

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Firebase bootstrap.
 *
 * The web config below is not a secret. Firebase ships it in the client bundle
 * by design; access is controlled by the security rules in `firestore.rules`
 * and `storage.rules`, never by hiding these values. They live in `.env` only
 * so the project can be switched without editing source.
 */

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

/** True when every required key is present, so callers can degrade gracefully. */
export function isFirebaseConfigured(): boolean {
  return requiredKeys.every((key) => Boolean(import.meta.env[key]))
}

function readConfig() {
  const missing = requiredKeys.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi Firebase belum lengkap. Salin frontend/.env.example menjadi ` +
        `frontend/.env.local, lalu isi nilai berikut dari Firebase Console ` +
        `(Project settings → Your apps → Web app): ${missing.join(', ')}.`,
    )
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

const useEmulator = import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true'

/**
 * Kunci situs reCAPTCHA v3 untuk Firebase App Check.
 *
 * Konfigurasi web Firebase ikut terkirim di dalam bundel klien, sehingga siapa
 * pun dapat menyalinnya lalu memanggil basis data langsung dari skrip tanpa
 * membuka aplikasi. Aturan keamanan tetap menahan mereka dari membaca data
 * orang lain, tetapi tidak menahan mereka menghabiskan kuota baca dan tulis.
 * App Check menutup celah itu dengan menolak permintaan yang tidak berasal
 * dari aplikasi ini.
 *
 * Dibiarkan kosong berarti App Check tidak diaktifkan, dan aplikasi tetap
 * berjalan. Pilihan itu disengaja supaya anggota tim dan emulator tidak
 * terhalang, tetapi lingkungan yang dapat diakses umum sebaiknya mengisinya.
 */
const appCheckSiteKey = (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ?? '').trim()

/**
 * Penyedia atestasi App Check.
 *
 * Firebase Console menamainya Fraud Defense, sebelumnya reCAPTCHA Enterprise,
 * dan menandai reCAPTCHA Classic sebagai usang. Enterprise dipakai sebagai
 * bawaan karena itu. Paket Spark tetap dapat memakainya, hanya dengan pilihan
 * ambang skor yang lebih sedikit.
 *
 * Nilai 'v3' disediakan agar proyek yang terlanjur memakai kunci Classic tidak
 * perlu berhenti bekerja sebelum sempat berpindah.
 */
const appCheckProvider = (import.meta.env.VITE_FIREBASE_APPCHECK_PROVIDER ?? 'enterprise')
  .trim()
  .toLowerCase()

export const isAppCheckEnabled = appCheckSiteKey !== '' && !useEmulator

/**
 * Emulator ports follow the Firebase defaults and must match `firebase.json`.
 * Changing one without the other sends the app at a port nothing listens on.
 */
const emulatorPorts = {
  auth: 9099,
  firestore: 8080,
  storage: 9199,
} as const

let app: FirebaseApp
let appCheckInstance: AppCheck | undefined
let authInstance: Auth
let firestoreInstance: Firestore
let storageInstance: FirebaseStorage

if (getApps().length === 0) {
  app = initializeApp(readConfig())

  // App Check dipasang sebelum layanan lain agar setiap permintaan sejak
  // permintaan pertama sudah membawa tokennya. Emulator dilewati karena
  // berjalan di mesin sendiri dan tidak menghabiskan kuota apa pun.
  if (isAppCheckEnabled) {
    appCheckInstance = initializeAppCheck(app, {
      provider:
        appCheckProvider === 'v3'
          ? new ReCaptchaV3Provider(appCheckSiteKey)
          : new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }

  authInstance = getAuth(app)
  firestoreInstance = getFirestore(app)
  storageInstance = getStorage(app)

  // Only on a fresh app, so Vite's HMR cannot reconnect an already-wired SDK.
  if (useEmulator) {
    connectAuthEmulator(authInstance, `http://127.0.0.1:${emulatorPorts.auth}`, {
      disableWarnings: true,
    })
    connectFirestoreEmulator(firestoreInstance, '127.0.0.1', emulatorPorts.firestore)
    connectStorageEmulator(storageInstance, '127.0.0.1', emulatorPorts.storage)
  }
} else {
  app = getApp()
  authInstance = getAuth(app)
  firestoreInstance = getFirestore(app)
  storageInstance = getStorage(app)
}

export const firebaseApp = app
export const auth = authInstance
export const db = firestoreInstance
export const storage = storageInstance

/** True when the app is pointed at the local Emulator Suite instead of the real project. */
export const isUsingEmulator = useEmulator

export const appCheck = appCheckInstance

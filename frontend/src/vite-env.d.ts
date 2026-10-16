/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Firebase web config. Not secret — it ships in the client bundle and access
   * is enforced by security rules. See frontend/.env.example.
   */
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  /** 'true' points the app at the local Emulator Suite instead of the real project. */
  readonly VITE_FIREBASE_USE_EMULATOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

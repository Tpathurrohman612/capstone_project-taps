import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from './firebase'
import { observeAuthState } from '../../features/auth/lib/firebase-auth'
import { readUserProfile, type UserProfile } from '../../features/auth/lib/user-profile'

/**
 * Status autentikasi untuk seluruh aplikasi.
 *
 * Aplikasi berjalan dalam dua mode. Mode `firebase` dipakai saat konfigurasi
 * lengkap, dan status masuk berasal dari Firebase Authentication. Mode
 * `simulasi` dipakai saat `.env.local` belum diisi; alur prototipe berbasis
 * sessionStorage tetap hidup supaya anggota tim yang belum menyiapkan Firebase
 * masih dapat menjalankan aplikasi, dan supaya pengujian tidak memerlukan
 * kredensial.
 */

export type AuthMode = 'firebase' | 'simulasi'

export type AuthContextValue = {
  mode: AuthMode
  /** Benar selama status masuk pertama kali belum diketahui. */
  loading: boolean
  user: User | null
  /** Profil dari koleksi `pengguna`; null bila identitas belum dilengkapi. */
  profile: UserProfile | null
  /** Membaca ulang profil setelah identitas disimpan. */
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: AuthMode = isFirebaseConfigured() ? 'firebase' : 'simulasi'

  // Dalam mode simulasi tidak ada yang perlu ditunggu, jadi jangan pernah
  // menampilkan layar memuat yang tidak akan pernah selesai.
  const [loading, setLoading] = useState(mode === 'firebase')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const loadProfile = useCallback(async (current: User | null) => {
    if (!current) return null

    try {
      return (await readUserProfile(current.uid)) ?? null
    } catch {
      // Gagal membaca profil tidak boleh mengunci pengguna di layar memuat.
      // Pengguna diperlakukan sebagai belum melengkapi identitas, dan layar
      // identitas akan menampilkan galatnya saat menyimpan.
      return null
    }
  }, [])

  useEffect(() => {
    if (mode !== 'firebase') return

    let aktif = true

    const unsubscribe = observeAuthState((current) => {
      void (async () => {
        const loaded = await loadProfile(current)
        if (!aktif) return

        setUser(current)
        setProfile(loaded)
        setLoading(false)
      })()
    })

    return () => {
      aktif = false
      unsubscribe()
    }
  }, [mode, loadProfile])

  const refreshProfile = useCallback(async () => {
    const loaded = await loadProfile(user)
    setProfile(loaded)
    return loaded
  }, [loadProfile, user])

  const value = useMemo<AuthContextValue>(
    () => ({ mode, loading, user, profile, refreshProfile }),
    [mode, loading, user, profile, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth harus dipanggil di dalam AuthProvider.')
  }

  return value
}

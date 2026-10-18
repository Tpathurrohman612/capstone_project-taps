import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from './firebase'
import { observeAuthState } from '../../features/auth/lib/firebase-auth'
import { isAdministrator } from '../../features/auth/lib/administrator'
import {
  readUserProfile,
  selaraskanFotoProfil,
  type UserProfile,
} from '../../features/auth/lib/user-profile'
import { setActiveUserRole, type UserRole } from './auth-session'

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
  /**
   * Peran pengguna, ditentukan oleh keberadaan dokumen pada koleksi
   * `administrator`. Null saat belum masuk. Nilai ini hanya menentukan
   * tampilan; otorisasi sebenarnya ditegakkan firestore.rules.
   */
  role: UserRole | null
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
  const [role, setRole] = useState<UserRole | null>(null)

  const loadProfile = useCallback(async (current: User | null) => {
    if (!current) return null

    try {
      const profil = (await readUserProfile(current.uid)) ?? null

      // Foto hanya tersimpan saat identitas pertama kali didaftarkan, dan
      // akun yang terdaftar sebelum itu tidak akan pernah memilikinya.
      // Penyelarasan di sini menulis hanya ketika fotonya memang berbeda,
      // dan kegagalannya tidak boleh menahan pengguna di layar memuat.
      return await selaraskanFotoProfil({
        uid: current.uid,
        fotoUrl: current.photoURL,
        profil,
      }).catch(() => profil)
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
        if (!current) {
          if (!aktif) return
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
          return
        }

        // Administrator tidak memerlukan profil mahasiswa, jadi kedua
        // pembacaan dijalankan bersamaan daripada berurutan.
        const [loaded, admin] = await Promise.all([
          loadProfile(current),
          isAdministrator(current.uid),
        ])
        if (!aktif) return

        const peran: UserRole = admin ? 'Administrator' : 'Mahasiswa'

        setUser(current)
        setProfile(loaded)
        setRole(peran)
        // RoleGuard masih membaca sessionStorage untuk mode simulasi, jadi
        // nilainya tetap disinkronkan agar kedua mode berperilaku sama.
        setActiveUserRole(peran)
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
    () => ({ mode, loading, user, profile, role, refreshProfile }),
    [mode, loading, user, profile, role, refreshProfile],
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

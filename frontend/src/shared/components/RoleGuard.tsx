import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { getActiveUserRole, type UserRole } from '../lib/auth-session'
import { useAuth } from '../lib/auth-context'

export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const { mode, loading, user } = useAuth()
  const activeRole = getActiveUserRole()

  // Status masuk Firebase tiba satu tick setelah render pertama. Tanpa jeda ini
  // pengguna yang sebenarnya sudah masuk akan terlempar ke /login setiap kali
  // halaman dimuat ulang.
  if (mode === 'firebase' && loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5 text-sm text-[#52657A]"
        role="status"
        aria-live="polite"
      >
        Memeriksa sesi masuk…
      </div>
    )
  }

  // Mahasiswa diautentikasi Firebase, sehingga sesi peran di sessionStorage
  // saja tidak cukup. Administrator masih memakai formulir internal sampai
  // custom claims dipasang, jadi perannya belum diverifikasi di sini.
  if (mode === 'firebase' && role === 'Mahasiswa' && !user) {
    return <Navigate to="/login" replace />
  }

  if (!activeRole) {
    return <Navigate to="/login" replace />
  }

  if (activeRole !== role) {
    return <Navigate to={activeRole === 'Administrator' ? '/administrator' : '/'} replace />
  }

  return children
}

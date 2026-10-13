import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { getActiveUserRole, type UserRole } from '../lib/auth-session'

export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const activeRole = getActiveUserRole()

  if (!activeRole) {
    return <Navigate to="/login" replace />
  }

  if (activeRole !== role) {
    return <Navigate to={activeRole === 'Administrator' ? '/administrator' : '/'} replace />
  }

  return children
}

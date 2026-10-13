export type UserRole = 'Administrator' | 'Mahasiswa'

const ACTIVE_USER_ROLE_KEY = 'taps-active-user-role'

export function getActiveUserRole(): UserRole | null {
  const role = window.sessionStorage.getItem(ACTIVE_USER_ROLE_KEY)

  return role === 'Administrator' || role === 'Mahasiswa' ? role : null
}

export function setActiveUserRole(role: UserRole) {
  window.sessionStorage.setItem(ACTIVE_USER_ROLE_KEY, role)
}

export function clearPrototypeAuthSession() {
  window.sessionStorage.removeItem('taps-active-google-account')
  window.sessionStorage.removeItem(ACTIVE_USER_ROLE_KEY)
  window.sessionStorage.removeItem('adminDetailContext')
  window.sessionStorage.removeItem('adminDetailId')
}

export function handlePrototypeLogout() {
  clearPrototypeAuthSession()
  window.location.assign('/login')
}

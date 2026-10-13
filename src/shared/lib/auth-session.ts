export function handlePrototypeLogout() {
  window.sessionStorage.removeItem('taps-active-google-account')
  window.sessionStorage.removeItem('adminDetailContext')
  window.sessionStorage.removeItem('adminDetailId')
  window.location.assign('/login')
}

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { AuthShell } from "../components/AuthShell"
import {
  ACTIVE_GOOGLE_ACCOUNT_KEY,
  getLinkedGoogleAccountByEmail,
  INTERNAL_ACCOUNTS,
  NEW_GOOGLE_ACCOUNT_EMAIL,
  REGISTERED_GOOGLE_ACCOUNT_EMAIL,
  SECOND_NEW_GOOGLE_ACCOUNT_EMAIL,
} from "../lib/google-account"

export function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [googleAccountDialogOpen, setGoogleAccountDialogOpen] = useState(false)

  const fieldClass =
    "mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7B8EA3] focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"

  const handleInternalLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const account = INTERNAL_ACCOUNTS.find(
      (item) =>
        item.email === email.trim().toLowerCase() && item.password === password,
    )

    if (!account) {
      setLoginError("Email atau password tidak sesuai.")
      return
    }

    if (account.role === "Administrator") {
      navigate("/administrator")
    }
  }

  const handleGoogleAccountSelect = (googleEmail: string) => {
    window.sessionStorage.setItem(ACTIVE_GOOGLE_ACCOUNT_KEY, googleEmail)
    setGoogleAccountDialogOpen(false)

    const linkedAccount = getLinkedGoogleAccountByEmail(googleEmail)

    if (
      googleEmail === REGISTERED_GOOGLE_ACCOUNT_EMAIL ||
      linkedAccount
    ) {
      navigate("/")
      return
    }

    navigate("/lengkapi-identitas")
  }

  return (
    <>
      <AuthShell>
        <div className="mt-9 border-t border-[#D9E2EC] pt-7 text-center">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
            AKSES AKUN
          </p>
          <h1 className="mt-3 font-slab text-3xl leading-none text-[#12355B]">
            Masuk ke Lapor Tuton
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#52657A]">
            Gunakan akun internal atau akun Google untuk masuk ke sistem.
          </p>

          <form className="mt-7 text-left" onSubmit={handleInternalLogin}>
            <label className="block">
              <span className="text-sm font-medium text-[#12355B]">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (loginError) setLoginError("")
                }}
                className={fieldClass}
                placeholder="Masukkan email"
                autoComplete="email"
              />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-[#12355B]">
                Password
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (loginError) setLoginError("")
                }}
                className={fieldClass}
                placeholder="Masukkan password"
                autoComplete="current-password"
                aria-describedby={loginError ? "login-error" : undefined}
                aria-invalid={Boolean(loginError)}
              />
            </label>
            {loginError && (
              <p
                id="login-error"
                className="mt-3 text-xs leading-5 text-[#B42318]"
              >
                {loginError}
              </p>
            )}
            <button
              type="submit"
              className="mt-6 w-full bg-[#005BAC] px-5 py-3.5 text-sm text-white transition hover:bg-[#004987] focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:ring-offset-2"
            >
              Masuk
            </button>
          </form>

          <div
            className="my-7 flex items-center gap-3 text-xs text-[#52657A]"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-[#D9E2EC]" />
            <span>atau</span>
            <span className="h-px flex-1 bg-[#D9E2EC]" />
          </div>

          <button
            type="button"
            onClick={() => setGoogleAccountDialogOpen(true)}
            className="flex w-full items-center justify-center gap-3 border border-[#12355B] bg-white px-5 py-3.5 text-sm text-[#12355B] transition hover:bg-[#EEF5FB] focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:ring-offset-2"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D9E2EC] bg-white text-sm font-semibold text-[#005BAC]"
              aria-hidden="true"
            >
              G
            </span>
            Masuk dengan Google
          </button>
        </div>

        <p className="mt-7 border-t border-[#D9E2EC] pt-5 text-center text-xs leading-5 text-[#52657A]">
          Satu akun Google terhubung dengan satu akun TAPS dan satu NIM.
        </p>
      </AuthShell>

      {googleAccountDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12355B]/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-account-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[7px_7px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              SIMULASI GOOGLE LOGIN
            </p>
            <h2
              id="google-account-title"
              className="mt-2 font-slab text-2xl text-[#12355B]"
            >
              Pilih Akun Google
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Pilih akun untuk mencoba alur pengguna baru atau pengguna yang
              sudah terhubung.
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() =>
                  handleGoogleAccountSelect(NEW_GOOGLE_ACCOUNT_EMAIL)
                }
                className="w-full border border-[#B9C8D7] px-4 py-3 text-left text-sm text-[#12355B] transition hover:border-[#005BAC] hover:bg-[#EEF5FB]"
              >
                <span className="block font-medium">new.student@gmail.com</span>
                <span className="mt-1 block text-xs text-[#52657A]">
                  Akun baru — lengkapi identitas
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleGoogleAccountSelect(SECOND_NEW_GOOGLE_ACCOUNT_EMAIL)
                }
                className="w-full border border-[#B9C8D7] px-4 py-3 text-left text-sm text-[#12355B] transition hover:border-[#005BAC] hover:bg-[#EEF5FB]"
              >
                <span className="block font-medium">second.student@gmail.com</span>
                <span className="mt-1 block text-xs text-[#52657A]">
                  Akun baru kedua — lengkapi identitas
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleGoogleAccountSelect(REGISTERED_GOOGLE_ACCOUNT_EMAIL)
                }
                className="w-full border border-[#B9C8D7] px-4 py-3 text-left text-sm text-[#12355B] transition hover:border-[#005BAC] hover:bg-[#EEF5FB]"
              >
                <span className="block font-medium">
                  registered.student@gmail.com
                </span>
                <span className="mt-1 block text-xs text-[#52657A]">
                  Akun terhubung — buka Dashboard Mahasiswa
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setGoogleAccountDialogOpen(false)}
              className="mt-6 border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#F7F9FC]"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  )
}

import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import universitasTerbukaLogo from "./assets/universitas-terbuka-logo.png"
import { handlePrototypeLogout } from "./shared/lib/auth-session"
import { navItems } from "./features/student/data/navigation"

const navButton = (active: boolean) =>
  `group flex items-center gap-3 border px-3 py-3 text-left text-sm transition-colors ${
    active
      ? "border-[#12355B] bg-[#12355B] font-medium text-white"
      : "border-transparent hover:border-[#D9E2EC] hover:bg-white"
  }`

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isActive = (to: string) => to !== "#" && location.pathname === to
  const isCreateReportPage = location.pathname === "/buat-laporan"

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`sticky top-0 z-10 hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(4rem,env(safe-area-inset-top))] max-[900px]:flex`}
        >
          <div
            className={`flex items-center gap-3 ${
              isCreateReportPage ? "min-w-0 flex-1" : ""
            }`}
          >
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-10 shrink-0"
            />
            <span
              className={`${
                isCreateReportPage ? "whitespace-nowrap" : ""
              } font-slab text-xl leading-none max-[360px]:text-lg`}
            >
              Lapor Tuton
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-10 w-10 items-center justify-center border border-[#12355B] text-[#12355B] ${
              isCreateReportPage ? "ml-3 shrink-0" : ""
            }`}
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
        </header>

        <aside className="flex min-h-screen flex-col border-r border-[#D9E2EC] bg-[#F7F9FC] px-5 py-7 max-[900px]:hidden">
          <div className="flex flex-col items-center border-b border-[#D9E2EC] pb-7 text-center">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-[142px]"
            />
            <div className="mt-4 flex items-baseline justify-center">
              <span className="p-0 font-slab text-[26px] leading-none">
                Lapor Tuton
              </span>
            </div>
          </div>
          <nav className="mt-7 flex flex-col gap-1" aria-label="Navigasi utama">
            {navItems.map((item, index) =>
              item.to === "#" ? (
                <button key={item.label} className={navButton(false)}>
                  <NavNumber active={false} number={index + 1} />
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={navButton(isActive(item.to))}
                >
                  <NavNumber active={isActive(item.to)} number={index + 1} />
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <button className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A] transition hover:border-[#D9E2EC] hover:bg-white hover:text-[#12355B]" onClick={handlePrototypeLogout}>
            <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
              ↗
            </span>
            Keluar
          </button>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 hidden bg-[#12355B]/30 max-[900px]:block"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi utama"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] pb-5 pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9 shrink-0"
                  />
                  <span className="truncate font-slab text-xl leading-none max-[360px]:text-lg">
                    Lapor Tuton
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center border border-[#12355B] text-lg text-[#12355B]"
                  aria-label="Tutup menu"
                >
                  ×
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item, index) =>
                  item.to === "#" ? (
                    <button key={item.label} className={navButton(false)}>
                      <NavNumber active={false} number={index + 1} />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={navButton(isActive(item.to))}
                    >
                      <NavNumber
                        active={isActive(item.to)}
                        number={index + 1}
                      />
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
              <button className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A]" onClick={handlePrototypeLogout}>
                <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
                  ↗
                </span>
                Keluar
              </button>
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </main>
  )
}

function NavNumber({ active, number }: { active: boolean; number: number }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center border text-[10px] ${
        active
          ? "border-[#9FC8EA] text-[#DCEBF8]"
          : "border-[#A9B8C8] text-[#52657A]"
      }`}
    >
      0{number}
    </span>
  )
}

const NEW_GOOGLE_ACCOUNT_EMAIL = "new.student@gmail.com"
const SECOND_NEW_GOOGLE_ACCOUNT_EMAIL = "second.student@gmail.com"
const REGISTERED_GOOGLE_ACCOUNT_EMAIL = "registered.student@gmail.com"
const GOOGLE_ACCOUNT_LINK_KEY = "taps-linked-google-account"
const ACTIVE_GOOGLE_ACCOUNT_KEY = "taps-active-google-account"
const REGISTERED_NIMS = new Set(["042557013"])
const INTERNAL_ACCOUNTS = [
  {
    email: "administrator@laportuton.example",
    password: "Admin123!",
    role: "Administrator",
  },
] as const

type LinkedGoogleAccount = {
  email: string
  nim: string
}

function getLinkedGoogleAccounts(): LinkedGoogleAccount[] {
  const storedAccounts = window.localStorage.getItem(GOOGLE_ACCOUNT_LINK_KEY)
  if (!storedAccounts) return []

  try {
    const parsed: unknown = JSON.parse(storedAccounts)
    const entries: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

    return entries.filter(
      (entry): entry is LinkedGoogleAccount =>
        typeof entry === "object" &&
        entry !== null &&
        "email" in entry &&
        typeof entry.email === "string" &&
        entry.email.trim() !== "" &&
        "nim" in entry &&
        typeof entry.nim === "string" &&
        entry.nim.trim() !== "",
    )
  } catch {
    return []
  }
}

function getLinkedGoogleAccountByEmail(
  email: string,
): LinkedGoogleAccount | undefined {
  return getLinkedGoogleAccounts().find(
    (account) => account.email.toLowerCase() === email.toLowerCase(),
  )
}

function getActiveGoogleAccountEmail() {
  return (
    window.sessionStorage.getItem(ACTIVE_GOOGLE_ACCOUNT_KEY) ??
    NEW_GOOGLE_ACCOUNT_EMAIL
  )
}

function AuthBrand() {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={universitasTerbukaLogo}
        alt="Universitas Terbuka"
        className="h-auto w-[168px] max-[520px]:w-[142px]"
      />
      <div className="mt-5 border-t border-[#D9E2EC] pt-5">
        <p className="font-slab text-[30px] leading-none text-[#12355B] max-[520px]:text-[26px]">
          Lapor Tuton
        </p>
        <p className="mt-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
          TUTORIAL ONLINE
        </p>
      </div>
    </div>
  )
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5 py-10 text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="w-full max-w-[540px] border border-[#D9E2EC] bg-white p-8 shadow-[8px_8px_0_#12355B] max-[520px]:p-6">
        <AuthBrand />
        {children}
      </div>
    </main>
  )
}

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

export function IdentitySetupScreen() {
  const navigate = useNavigate()
  const [nim, setNim] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedNim = nim.trim()
    const activeEmail = getActiveGoogleAccountEmail()
    const linkedAccounts = getLinkedGoogleAccounts()

    const existingEmailAccount = linkedAccounts.find(
      (account) => account.email.toLowerCase() === activeEmail.toLowerCase(),
    )

    if (existingEmailAccount) {
      if (existingEmailAccount.nim !== normalizedNim) {
        setError("Akun Google ini sudah terhubung dengan NIM lain.")
        return
      }

      navigate("/")
      return
    }

    if (
      REGISTERED_NIMS.has(normalizedNim) ||
      linkedAccounts.some((account) => account.nim === normalizedNim)
    ) {
      setError(
        "NIM sudah terdaftar pada akun lain. Silakan gunakan akun Google yang telah terhubung dengan NIM tersebut.",
      )
      return
    }

    const updatedAccounts = [
      ...linkedAccounts,
      { email: activeEmail, nim: normalizedNim },
    ]

    window.localStorage.setItem(
      GOOGLE_ACCOUNT_LINK_KEY,
      JSON.stringify(updatedAccounts),
    )

    navigate("/")
  }

  const fieldClass =
    "mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7B8EA3] focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"

  return (
    <AuthShell>
      <div className="mt-8 border-t border-[#D9E2EC] pt-7">
        <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
          AKUN GOOGLE BARU
        </p>
        <h1 className="mt-3 font-slab text-3xl leading-none text-[#12355B]">
          Lengkapi Identitas
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#52657A]">
          Lengkapi informasi berikut untuk menghubungkan akun Google dengan akun
          TAPS Anda.
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Nama Lengkap <span className="text-[#005BAC]">*</span>
            </span>
            <input
              required
              className={fieldClass}
              placeholder="Masukkan nama lengkap"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              NIM <span className="text-[#005BAC]">*</span>
            </span>
            <input
              required
              value={nim}
              onChange={(event) => {
                setNim(event.target.value)
                if (error) setError("")
              }}
              className={fieldClass}
              inputMode="numeric"
              placeholder="Masukkan NIM"
              aria-describedby={error ? "nim-error" : undefined}
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p
                id="nim-error"
                className="mt-2 text-xs leading-5 text-[#B42318]"
              >
                {error}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Fakultas <span className="text-[#005BAC]">*</span>
            </span>
            <input
              required
              className={fieldClass}
              placeholder="Masukkan fakultas"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Program Studi <span className="text-[#005BAC]">*</span>
            </span>
            <input
              required
              className={fieldClass}
              placeholder="Masukkan program studi"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              UT Daerah <span className="text-[#005BAC]">*</span>
            </span>
            <input
              required
              className={fieldClass}
              placeholder="Masukkan UT Daerah"
            />
          </label>

          <div className="border border-[#D9E2EC] bg-[#F7F9FC] px-4 py-3">
            <p className="text-sm font-medium text-[#12355B]">Email Google</p>
            <p className="mt-1 text-sm text-[#52657A]">
              {getActiveGoogleAccountEmail()}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#005BAC] px-5 py-3.5 text-sm text-white transition hover:bg-[#004987] focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:ring-offset-2"
          >
            Lanjutkan
          </button>
        </form>
      </div>
    </AuthShell>
  )
}

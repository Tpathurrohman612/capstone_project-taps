import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { AuthShell } from '../components/AuthShell'
import {
  GOOGLE_ACCOUNT_LINK_KEY,
  getActiveGoogleAccountEmail,
  getLinkedGoogleAccounts,
  REGISTERED_NIMS,
} from '../lib/google-account'

export function IdentitySetupScreen() {
  const navigate = useNavigate()
  const [nim, setNim] = useState('')
  const [error, setError] = useState('')

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
        setError('Akun Google ini sudah terhubung dengan NIM lain.')
        return
      }

      navigate('/')
      return
    }

    if (
      REGISTERED_NIMS.has(normalizedNim) ||
      linkedAccounts.some((account) => account.nim === normalizedNim)
    ) {
      setError(
        'NIM sudah terdaftar pada akun lain. Silakan gunakan akun Google yang telah terhubung dengan NIM tersebut.',
      )
      return
    }

    const updatedAccounts = [...linkedAccounts, { email: activeEmail, nim: normalizedNim }]

    window.localStorage.setItem(GOOGLE_ACCOUNT_LINK_KEY, JSON.stringify(updatedAccounts))

    navigate('/')
  }

  const fieldClass =
    'mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7B8EA3] focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]'

  return (
    <AuthShell>
      <div className="mt-8 border-t border-[#D9E2EC] pt-7">
        <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
          AKUN GOOGLE BARU
        </p>
        <h1 className="mt-3 font-slab text-3xl leading-none text-[#12355B]">Lengkapi Identitas</h1>
        <p className="mt-3 text-sm leading-6 text-[#52657A]">
          Lengkapi informasi berikut untuk menghubungkan akun Google dengan akun TAPS Anda.
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Nama Lengkap <span className="text-[#005BAC]">*</span>
            </span>
            <input required className={fieldClass} placeholder="Masukkan nama lengkap" />
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
                if (error) setError('')
              }}
              className={fieldClass}
              inputMode="numeric"
              placeholder="Masukkan NIM"
              aria-describedby={error ? 'nim-error' : undefined}
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p id="nim-error" className="mt-2 text-xs leading-5 text-[#B42318]">
                {error}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Fakultas <span className="text-[#005BAC]">*</span>
            </span>
            <input required className={fieldClass} placeholder="Masukkan fakultas" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              Program Studi <span className="text-[#005BAC]">*</span>
            </span>
            <input required className={fieldClass} placeholder="Masukkan program studi" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#12355B]">
              UT Daerah <span className="text-[#005BAC]">*</span>
            </span>
            <input required className={fieldClass} placeholder="Masukkan UT Daerah" />
          </label>

          <div className="border border-[#D9E2EC] bg-[#F7F9FC] px-4 py-3">
            <p className="text-sm font-medium text-[#12355B]">Email Google</p>
            <p className="mt-1 text-sm text-[#52657A]">{getActiveGoogleAccountEmail()}</p>
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

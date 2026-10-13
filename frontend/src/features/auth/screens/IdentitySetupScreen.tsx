import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { AuthShell } from '../components/AuthShell'
import { FACULTIES, type Faculty } from '../../../shared/data/faculties'
import {
  GOOGLE_ACCOUNT_LINK_KEY,
  getActiveGoogleAccountEmail,
  getLinkedGoogleAccounts,
  REGISTERED_NIMS,
} from '../lib/google-account'

export function IdentitySetupScreen() {
  const navigate = useNavigate()
  const activeEmail = getActiveGoogleAccountEmail()
  const linkedAccounts = getLinkedGoogleAccounts()
  const existingEmailAccount = linkedAccounts.find(
    (account) => account.email.toLowerCase() === activeEmail.toLowerCase(),
  )

  const [nim, setNim] = useState(existingEmailAccount?.nim ?? '')
  const [faculty, setFaculty] = useState<Faculty | ''>(existingEmailAccount?.faculty ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedNim = nim.trim()
    const currentActiveEmail = getActiveGoogleAccountEmail()
    const currentLinkedAccounts = getLinkedGoogleAccounts()

    const currentExistingAccount = currentLinkedAccounts.find(
      (account) => account.email.toLowerCase() === currentActiveEmail.toLowerCase(),
    )

    if (!faculty) {
      setError('Pilih fakultas asal mahasiswa.')
      return
    }

    if (currentExistingAccount) {
      if (currentExistingAccount.nim !== normalizedNim) {
        setError('Akun Google ini sudah terhubung dengan NIM lain.')
        return
      }

      const updatedAccounts = currentLinkedAccounts.map((account) =>
        account.email.toLowerCase() === currentActiveEmail.toLowerCase()
          ? {
              ...account,
              nim: currentExistingAccount.nim,
              faculty: account.faculty ?? faculty,
            }
          : account,
      )

      window.localStorage.setItem(GOOGLE_ACCOUNT_LINK_KEY, JSON.stringify(updatedAccounts))
      navigate('/')
      return
    }

    if (
      REGISTERED_NIMS.has(normalizedNim) ||
      currentLinkedAccounts.some((account) => account.nim === normalizedNim)
    ) {
      setError(
        'NIM sudah terdaftar pada akun lain. Silakan gunakan akun Google yang telah terhubung dengan NIM tersebut.',
      )
      return
    }

    const updatedAccounts = [
      ...currentLinkedAccounts,
      { email: currentActiveEmail, nim: normalizedNim, faculty },
    ]

    window.localStorage.setItem(GOOGLE_ACCOUNT_LINK_KEY, JSON.stringify(updatedAccounts))

    navigate('/')
  }

  const fieldClass =
    'mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7B8EA3] focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]'

  return (
    <AuthShell>
      <div className="mt-8 border-t border-[#D9E2EC] pt-7">
        <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
          {existingEmailAccount ? 'LENGKAPI DATA AKUN' : 'AKUN GOOGLE BARU'}
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
              readOnly={Boolean(existingEmailAccount?.nim)}
              onChange={(event) => {
                setNim(event.target.value)
                if (error) setError('')
              }}
              className={`${fieldClass} ${existingEmailAccount?.nim ? 'cursor-not-allowed bg-[#F7F9FC]' : ''}`}
              inputMode="numeric"
              placeholder="Masukkan NIM"
              aria-describedby={error ? 'nim-error' : undefined}
              aria-invalid={Boolean(error)}
            />
            {existingEmailAccount?.nim && (
              <p className="mt-1 text-xs text-[#52657A]">NIM terhubung dari akun yang sudah ada.</p>
            )}
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
            <select
              required
              value={faculty}
              onChange={(event) => {
                setFaculty(event.target.value as Faculty)
                if (error) setError('')
              }}
              className={fieldClass}
            >
              <option value="" disabled>
                Pilih fakultas
              </option>
              {FACULTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
            <p className="mt-1 text-sm text-[#52657A]">{activeEmail}</p>
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

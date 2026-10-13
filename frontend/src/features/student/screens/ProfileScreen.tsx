import placeholderAvatar from '../../../assets/placeholder-avatar.svg'
import { handlePrototypeLogout } from '../../../shared/lib/auth-session'
import { studentProfile } from '../data/profile'

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#D9E2EC] py-4 last:border-b-0">
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">{value}</p>
    </div>
  )
}

export function ProfileScreen() {
  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          AKUN / PROFIL
        </p>
        <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">Profil</h1>
        <p className="mt-2 text-sm leading-6 text-[#52657A]">
          Lihat informasi akun yang digunakan dalam Lapor Tuton.
        </p>
      </header>
      <div className="mt-8 grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] items-start gap-8 max-[900px]:grid-cols-1">
        <section className="border border-[#D9E2EC] bg-white" aria-labelledby="informasi-mahasiswa">
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              01 / IDENTITAS AKADEMIK
            </p>
            <h2 id="informasi-mahasiswa" className="mt-1 font-slab text-2xl text-[#12355B]">
              Informasi Mahasiswa
            </h2>
          </div>
          <div className="px-6 max-[620px]:px-5">
            <div className="flex items-center gap-5">
              <img
                src={placeholderAvatar}
                alt="Avatar profil netral"
                className="h-[76px] w-[76px] shrink-0"
              />
              <div className="min-w-0 flex-1">
                {studentProfile.slice(0, 2).map(([label, value]) => (
                  <ProfileItem key={label} label={label} value={value} />
                ))}
              </div>
            </div>
            {studentProfile.slice(2).map(([label, value]) => (
              <ProfileItem key={label} label={label} value={value} />
            ))}
          </div>
        </section>
        <div className="space-y-8">
          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="informasi-akun">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                02 / AKSES SISTEM
              </p>
              <h2 id="informasi-akun" className="mt-1 font-slab text-2xl text-[#12355B]">
                Informasi Akun
              </h2>
            </div>
            <div className="px-6 max-[620px]:px-5">
              <ProfileItem label="Email" value="nama.mahasiswa@example.com" />
              <div className="py-4">
                <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  STATUS AKUN
                </p>
                <span className="mt-2 inline-flex border border-[#B8D3E8] bg-[#EEF5FB] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] text-[#12355B]">
                  AKTIF
                </span>
              </div>
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white p-6 max-[620px]:p-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              SESI
            </p>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Akhiri sesi Lapor Tuton pada perangkat ini.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-3 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              onClick={handlePrototypeLogout}
            >
              Keluar <span aria-hidden="true">↗</span>
            </button>
          </section>
        </div>
      </div>
    </section>
  )
}

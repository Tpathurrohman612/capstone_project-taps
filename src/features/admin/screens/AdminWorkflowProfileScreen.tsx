import placeholderAvatar from '../../../assets/placeholder-avatar.svg'
import { AdminWorkflowShell } from '../components/workflow-ui'
import { handlePrototypeLogout } from '../../../shared/lib/auth-session'

function AdminProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#D9E2EC] py-4 last:border-b-0">
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">{value}</p>
    </div>
  )
}

export function AdminWorkflowProfileScreen() {
  return (
    <AdminWorkflowShell activeIndex={3}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / PROFIL/AKUN
          </p>
          <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
            Profil/Akun
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Informasi akun administrator dan akses pengelolaan sistem Lapor Tuton.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] items-start gap-8 max-[900px]:grid-cols-1">
          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="informasi-admin">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                01 / INFORMASI ADMINISTRATOR
              </p>
              <h2 id="informasi-admin" className="mt-1 font-slab text-2xl text-[#12355B]">
                Informasi Administrator
              </h2>
            </div>
            <div className="px-6 max-[620px]:px-5">
              <div className="flex items-center gap-5 border-b border-[#D9E2EC] py-5">
                <img
                  src={placeholderAvatar}
                  alt="Avatar administrator netral"
                  className="h-[76px] w-[76px] shrink-0"
                />
                <div>
                  <p className="text-base font-semibold text-[#12355B]">
                    Administrator Lapor Tuton
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#005BAC]">ADM-001</p>
                </div>
              </div>
              <AdminProfileItem label="Email" value="administrator@laportuton.example" />
              <AdminProfileItem label="Unit/Pengelola" value="Pengelola Tutorial Online" />
              <AdminProfileItem label="Peran" value="Administrator" />
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
          <div className="space-y-8">
            <section className="border border-[#D9E2EC] bg-white" aria-labelledby="akses-akun">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  02 / AKSES AKUN
                </p>
                <h2 id="akses-akun" className="mt-1 font-slab text-2xl text-[#12355B]">
                  Akses Akun
                </h2>
              </div>
              <div className="px-6 max-[620px]:px-5">
                <AdminProfileItem label="Peran Akses" value="Administrator" />
                <AdminProfileItem label="Akses Sistem" value="Pengelolaan Laporan" />
                <div className="py-4">
                  <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                    STATUS AKSES
                  </p>
                  <span className="mt-2 inline-flex border border-[#B8D3E8] bg-[#EEF5FB] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] text-[#12355B]">
                    AKTIF
                  </span>
                </div>
              </div>
            </section>
            <section className="border border-[#D9E2EC] bg-white" aria-labelledby="sesi-akun">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  03 / SESI AKUN
                </p>
                <h2 id="sesi-akun" className="mt-1 font-slab text-2xl text-[#12355B]">
                  Sesi Akun
                </h2>
              </div>
              <div className="px-6 max-[620px]:px-5">
                <AdminProfileItem label="Status Sesi" value="Aktif" />
                <AdminProfileItem label="Perangkat" value="Browser Web" />
                <AdminProfileItem label="Aktivitas Terakhir" value="Hari ini" />
                <button
                  type="button"
                  className="mb-6 mt-2 inline-flex items-center gap-3 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
                  onClick={handlePrototypeLogout}
                >
                  Keluar <span aria-hidden="true">↗</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </AdminWorkflowShell>
  )
}

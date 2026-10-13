import type { ReactNode } from 'react'

const designColors = [
  ['Primary', '#005BAC', 'bg-[#005BAC]'],
  ['Secondary / Navy', '#12355B', 'bg-[#12355B]'],
  ['Background', '#F7F9FC', 'bg-[#F7F9FC]'],
  ['Surface', '#FFFFFF', 'bg-white'],
  ['Text', '#1F2937', 'bg-[#1F2937]'],
  ['Muted Text', '#52657A', 'bg-[#52657A]'],
  ['Border', '#D9E2EC', 'bg-[#D9E2EC]'],
  ['Success', '#12355B', 'bg-[#12355B]'],
  ['Warning', '#F2C94C', 'bg-[#F2C94C]'],
  ['Error', '#B42318', 'bg-[#B42318]'],
] as const

function DesignSystemSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="border border-[#D9E2EC] bg-white">
      <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
          {number}
        </p>
        <h2 className="mt-1 font-slab text-2xl text-[#12355B]">{title}</h2>
      </div>
      <div className="p-6 max-[620px]:p-5">{children}</div>
    </section>
  )
}

export function DesignSystemScreen() {
  const statusSamples = [
    ['Diterima', 'border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]'],
    ['Diverifikasi', 'border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]'],
    ['Menunggu Validasi', 'border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]'],
    ['Sedang Diproses', 'border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]'],
    ['Selesai', 'border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]'],
  ]
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-6 py-8 text-[#1F2937] max-[620px]:px-5">
      <div className="mx-auto max-w-[1180px]">
        <header className="border-b-2 border-[#12355B] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            TAPS / REFERENSI IMPLEMENTASI
          </p>
          <div className="mt-3 flex items-end justify-between gap-6 max-[620px]:block">
            <div>
              <h1 className="font-slab text-[42px] tracking-[-0.035em] text-[#12355B] max-[620px]:text-[36px]">
                Design System
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52657A]">
                Referensi visual yang dirangkum dari pola antarmuka Mahasiswa dan Administrator
                Lapor Tuton.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-[#005BAC] max-[620px]:mt-4 max-[620px]:inline-block">
              LAPOR TUTON
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-8">
          <DesignSystemSection number="01 / WARNA" title="Colors">
            <div className="grid grid-cols-5 gap-4 max-[950px]:grid-cols-3 max-[620px]:grid-cols-2">
              {designColors.map(([name, value, colorClass]) => (
                <div key={name} className="border border-[#D9E2EC] bg-white p-3">
                  <span className={`block h-14 border border-[#D9E2EC] ${colorClass}`} />
                  <p className="mt-3 text-sm font-semibold text-[#12355B]">{name}</p>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </DesignSystemSection>

          <div className="grid grid-cols-2 gap-8 max-[900px]:grid-cols-1">
            <DesignSystemSection number="02 / TIPOGRAFI" title="Typography">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    PAGE TITLE / POPPINS 600 / 36PX
                  </p>
                  <p className="mt-1 font-slab text-[36px] leading-none text-[#12355B]">
                    Detail Laporan
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    SECTION TITLE / POPPINS 600 / 24PX
                  </p>
                  <p className="mt-1 font-slab text-2xl text-[#12355B]">Informasi Laporan</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    SUBTITLE / POPPINS 400 / 14PX
                  </p>
                  <p className="mt-1 text-sm text-[#52657A]">
                    Kelola dan tindak lanjuti laporan permasalahan.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    BODY / POPPINS 400 / 14PX
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    Informasi disajikan dengan bahasa yang ringkas dan mudah dipindai.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                      LABEL / POPPINS 500
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#12355B]">Nama Tutor</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                      CAPTION / TABLE / POPPINS 400
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#52657A]">LT-2026-0009</p>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                  BUTTON / STATUS / REPORT ID / POPPINS 500
                </p>
              </div>
            </DesignSystemSection>

            <DesignSystemSection number="03 / SPASI" title="Spacing">
              <dl className="divide-y divide-[#D9E2EC]">
                {[
                  ['Margin halaman', 'px-8 py-7 · mobile px-5'],
                  ['Jarak antarseksi', 'mt-8 hingga mt-10'],
                  ['Padding kartu', 'p-6 · mobile p-5'],
                  ['Form field', 'mt-2 untuk kontrol · gap-4 antarfield'],
                  ['Modal', 'p-6 · aksi mt-7'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-5 py-4">
                    <dt className="text-sm font-semibold text-[#12355B]">{label}</dt>
                    <dd className="font-mono text-[10px] text-right tracking-[0.08em] text-[#52657A]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </DesignSystemSection>
          </div>

          <DesignSystemSection number="04 / KOMPONEN" title="Components">
            <div className="grid grid-cols-2 gap-8 max-[900px]:grid-cols-1">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">BUTTONS</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white">
                      Primary
                    </button>
                    <button className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]">
                      Secondary
                    </button>
                    <button
                      disabled
                      className="bg-[#A9B8C8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Disabled
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 max-[620px]:grid-cols-1">
                  <label>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                      INPUT / SEARCH
                    </span>
                    <input
                      readOnly
                      value="Cari ID atau judul laporan"
                      className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#52657A]"
                    />
                  </label>
                  <label>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                      SELECT
                    </span>
                    <select className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm">
                      <option>Semua status</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                    TEXTAREA
                  </span>
                  <textarea
                    readOnly
                    value="Uraian permasalahan mahasiswa."
                    rows={3}
                    className="mt-2 block w-full resize-none border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
                  />
                </label>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    STATUS BADGE
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statusSamples.map(([label, className]) => (
                      <span
                        key={label}
                        className={`inline-flex border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${className}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border border-[#D9E2EC]">
                  <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-4 py-3">
                    <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                      CARD / TABLE
                    </p>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#12355B]">LT-2026-0009</p>
                      <p className="mt-1 text-xs text-[#52657A]">Aktivitas tutor · Akuntansi</p>
                    </div>
                    <span className="border-b border-[#005BAC] pb-1 text-xs font-semibold text-[#005BAC]">
                      Lihat Detail
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DesignSystemSection>

          <div className="grid grid-cols-2 gap-8 max-[900px]:grid-cols-1">
            <DesignSystemSection number="05 / STATUS LAPORAN" title="Status Components">
              <ol className="space-y-4">
                {statusSamples.map(([label, className], index) => (
                  <li key={label} className="flex items-center gap-4">
                    <span
                      className={`flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${
                        index < 3
                          ? 'border-[#005BAC] bg-[#005BAC] text-white'
                          : index === 3
                            ? 'border-[#C99C20] bg-[#F2C94C] text-[#12355B]'
                            : 'border-[#B9C8D7] bg-white text-[#7D8B99]'
                      }`}
                    >
                      {index < 3 ? '✓' : index + 1}
                    </span>
                    <span
                      className={`inline-flex border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${className}`}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ol>
            </DesignSystemSection>
            <DesignSystemSection number="06 / STATE" title="Component States">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Default', 'border-[#B9C8D7] bg-white text-[#1F2937]'],
                  ['Hover', 'border-[#12355B] bg-[#12355B] text-white'],
                  ['Active', 'border-[#005BAC] bg-[#EEF5FB] text-[#005BAC]'],
                  ['Disabled', 'border-[#D9E2EC] bg-[#F7F9FC] text-[#7D8B99]'],
                  ['Success', 'border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]'],
                  ['Warning', 'border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]'],
                  ['Error', 'border-[#B42318] bg-white text-[#B42318]'],
                  ['Selected', 'border-[#005BAC] bg-[#EEF5FB] text-[#005BAC]'],
                ].map(([label, className]) => (
                  <div key={label} className={`border p-3 text-sm font-semibold ${className}`}>
                    {label}
                  </div>
                ))}
              </div>
            </DesignSystemSection>
          </div>

          <DesignSystemSection
            number="07 / NAVIGASI & UMPAN BALIK"
            title="Navigation, Modal & Timeline"
          >
            <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 max-[900px]:grid-cols-1">
              <div className="border border-[#D9E2EC] bg-[#F7F9FC] p-4">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">BREADCRUMB</p>
                <p className="mt-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                  ADMINISTRATOR / ANTREAN LAPORAN
                </p>
                <div className="mt-5 space-y-2">
                  <p className="border-l-2 border-[#005BAC] bg-white px-3 py-2 text-sm font-semibold text-[#12355B]">
                    Antrean Laporan
                  </p>
                  <p className="px-3 py-2 text-sm text-[#52657A]">Riwayat Laporan</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                  TIMELINE & MODAL
                </p>
                <ol className="mt-4 space-y-4 border-l border-[#B8D3E8] pl-5">
                  <li>
                    <p className="font-mono text-[10px] text-[#52657A]">17 September 2026, 10:00</p>
                    <p className="mt-1 text-sm font-semibold text-[#12355B]">
                      Laporan diverifikasi
                    </p>
                  </li>
                  <li>
                    <p className="font-mono text-[10px] text-[#52657A]">17 September 2026, 17:00</p>
                    <p className="mt-1 text-sm font-semibold text-[#12355B]">
                      Laporan memasuki proses tindak lanjut
                    </p>
                  </li>
                </ol>
                <div className="mt-5 border-2 border-[#12355B] bg-white p-4 shadow-[5px_5px_0_#12355B]">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    CONTOH MODAL
                  </p>
                  <p className="mt-2 font-slab text-xl text-[#12355B]">Konfirmasi Tindakan</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="border border-[#12355B] px-3 py-2 text-xs font-semibold text-[#12355B]">
                      Batal
                    </button>
                    <button className="bg-[#005BAC] px-3 py-2 text-xs font-semibold text-white">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DesignSystemSection>

          <DesignSystemSection number="08 / AUTENTIKASI" title="Login & Identity Components">
            <div className="grid grid-cols-2 gap-8 max-[900px]:grid-cols-1">
              <div className="border border-[#D9E2EC] bg-[#F7F9FC] p-5">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                  LOGIN FORM LAYOUT
                </p>
                <div className="mt-4 border border-[#D9E2EC] bg-white p-5">
                  <p className="font-slab text-xl text-[#12355B]">Masuk ke Lapor Tuton</p>
                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-[#12355B]">Email</span>
                      <input
                        readOnly
                        value="administrator@laportuton.example"
                        className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-[#12355B]">Password</span>
                      <input
                        readOnly
                        type="password"
                        value="Admin123!"
                        className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937]"
                      />
                    </label>
                    <button className="w-full bg-[#005BAC] px-4 py-3 text-sm text-white">
                      Masuk
                    </button>
                    <div className="flex items-center gap-3 text-xs text-[#52657A]">
                      <span className="h-px flex-1 bg-[#D9E2EC]" />
                      <span>atau</span>
                      <span className="h-px flex-1 bg-[#D9E2EC]" />
                    </div>
                    <button className="flex w-full items-center justify-center gap-3 border border-[#12355B] bg-white px-4 py-3 text-sm text-[#12355B]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#D9E2EC] text-xs text-[#005BAC]">
                        G
                      </span>
                      Masuk dengan Google
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    REQUIRED FORM FIELD
                  </p>
                  <label className="mt-3 block">
                    <span className="text-sm font-medium text-[#12355B]">
                      NIM <span className="text-[#005BAC]">*</span>
                    </span>
                    <input
                      readOnly
                      value="042557013"
                      className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937]"
                    />
                  </label>
                </div>

                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    READ-ONLY ACCOUNT EMAIL
                  </p>
                  <div className="mt-3 border border-[#D9E2EC] bg-[#F7F9FC] px-4 py-3">
                    <p className="text-sm font-medium text-[#12355B]">Email Google</p>
                    <p className="mt-1 text-sm text-[#52657A]">registered.student@gmail.com</p>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                    VALIDATION / ERROR MESSAGE
                  </p>
                  <p className="mt-3 border-l-2 border-[#B42318] bg-[#F7F9FC] px-3 py-2 text-xs leading-5 text-[#B42318]">
                    NIM sudah terdaftar pada akun lain. Silakan gunakan akun Google yang telah
                    terhubung dengan NIM tersebut.
                  </p>
                </div>
              </div>
            </div>
          </DesignSystemSection>
        </div>
      </div>
    </main>
  )
}

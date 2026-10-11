import {
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import universitasTerbukaLogo from "./assets/universitas-terbuka-logo.png"
import { handlePrototypeLogout } from "./shared/lib/auth-session"
import { adminNavItems } from "./features/admin/data/navigation"
import { ReadOnlyItem } from "./shared/components/ReadOnlyItem"
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

function rememberAdminDetail(
  event: MouseEvent<HTMLElement>,
  context: "queue" | "history",
) {
  const link = (event.target as HTMLElement).closest(
    'a[href="/detail-laporan"]',
  )
  if (!link) return
  const reportId = link
    .closest("article")
    ?.querySelector("p")
    ?.textContent?.trim()
  if (reportId?.startsWith("LT-")) {
    window.sessionStorage.setItem("adminDetailContext", context)
    window.sessionStorage.setItem("adminDetailId", reportId)
  }
}

type AdminQueueReport = {
  id: string
  title: string
  category: string
  course: string
  className: string
  tutor: string
  submitted: string
  status: "Perlu Verifikasi" | "Diverifikasi" | "Diproses" | "Selesai"
}

const adminQueueReports: AdminQueueReport[] = [
  {
    id: "LT-2026-0008",
    title: "Materi tutorial minggu ke-5 belum tersedia",
    category: "Materi Tutorial Online",
    course: "MKDU4109 · Pendidikan Kewarganegaraan",
    className: "02",
    tutor: "Agus Prasetyo, S.Pd., M.Pd.",
    submitted: "16 September 2026",
    status: "Perlu Verifikasi",
  },
  {
    id: "LT-2026-0007",
    title: "Belum ada tanggapan pada forum inisiasi",
    category: "Aktivitas tutor",
    course: "ESPA4123 · Statistika Ekonomi",
    className: "01",
    tutor: "M. Arief Nugroho, M.Si.",
    submitted: "15 September 2026",
    status: "Perlu Verifikasi",
  },
  {
    id: "LT-2026-0005",
    title: "Tutor belum memberi penilaian tugas",
    category: "Aktivitas tutor",
    course: "EKMA4157 · Manajemen Pemasaran",
    className: "03",
    tutor: "Hendra Wijaya, S.E., M.M.",
    submitted: "14 September 2026",
    status: "Diverifikasi",
  },
  {
    id: "LT-2026-0001",
    title: "Belum ada umpan balik diskusi minggu ke-3",
    category: "Aktivitas tutor",
    course: "EKMA4111 · Pengantar Bisnis",
    className: "01",
    tutor: "Dr. Rina Kusuma, M.M.",
    submitted: "12 September 2026",
    status: "Selesai",
  },
  {
    id: "LT-2026-0003",
    title: "Jadwal aktivitas tutor tidak sesuai ketentuan",
    category: "Layanan tutor",
    course: "ADBI4410 · Manajemen Sumber Daya Manusia",
    className: "03",
    tutor: "Nadia Permata, S.E., M.M.",
    submitted: "28 Agustus 2026",
    status: "Selesai",
  },
]

const queueStatusClass = (status: AdminQueueReport["status"]) =>
  status === "Selesai"
    ? "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
    : status === "Diproses"
      ? "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
      : status === "Diverifikasi"
        ? "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"
        : "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"

export function AdminQueueScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [status, setStatus] = useState("Semua")
  const [query, setQuery] = useState("")
  const visibleReports = adminQueueReports.filter(
    (report) =>
      (status === "Semua" || report.status === status) &&
      `${report.id} ${report.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const adminNav = (activeIndex: number, mobile = false) => (
    <nav
      className={
        mobile ? "mt-6 flex flex-col gap-2" : "mt-7 flex flex-col gap-1"
      }
      aria-label="Navigasi administrator"
    >
      {adminNavItems.map((item, index) =>
        item.to === "#" ? (
          <button
            key={item.label}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === activeIndex)}
          >
            <NavNumber active={index === activeIndex} number={index + 1} />
            {item.label}
          </button>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === activeIndex)}
          >
            <NavNumber active={index === activeIndex} number={index + 1} />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
  return (
    <main
      onClick={(event) => rememberAdminDetail(event, "queue")}
      className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]"
    >
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`${
            mobileMenuOpen
              ? "hidden"
              : "sticky top-0 z-10 hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pt-[max(4rem,env(safe-area-inset-top))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] max-[900px]:flex"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-9 shrink-0"
            />
            <div className="min-w-0">
              <span className="block whitespace-nowrap font-slab text-xl leading-none">
                Lapor Tuton
              </span>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.14em] text-[#52657A] max-[360px]:hidden">
                ADMINISTRATOR
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center border border-[#12355B] text-[#12355B]"
            aria-label="Buka menu navigasi"
            aria-expanded="false"
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
              <span className="font-slab text-[26px] leading-none">
                Lapor Tuton
              </span>
            </div>
            <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
              ADMINISTRATOR
            </span>
          </div>
          {adminNav(1)}
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
            aria-label="Navigasi administrator"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] px-5 pb-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9 shrink-0"
                  />
                  <div>
                    <span className="whitespace-nowrap font-slab text-xl leading-none">
                      Lapor Tuton
                    </span>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#52657A]">
                      ADMINISTRATOR
                    </p>
                  </div>
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
              {adminNav(1, true)}
              <button className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A]" onClick={handlePrototypeLogout}>
                <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
                  ↗
                </span>
                Keluar
              </button>
            </div>
          </div>
        )}
        <section className="px-8 py-7 max-[620px]:px-5">
          <header className="border-b border-[#D9E2EC] pb-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              ADMINISTRATOR / ANTREAN LAPORAN
            </p>
            <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Antrean Laporan
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Kelola dan tindak lanjuti laporan permasalahan mahasiswa.
            </p>
          </header>
          <div className="mt-8 grid grid-cols-[220px_minmax(0,1fr)] gap-4 max-[700px]:grid-cols-1">
            <label className="block">
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                STATUS LAPORAN
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              >
                <option>Semua</option>
                <option>Perlu Verifikasi</option>
                <option>Diverifikasi</option>
                <option>Diproses</option>
                <option>Selesai</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                CARI LAPORAN
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
                placeholder="Cari ID atau judul laporan"
              />
            </label>
          </div>
          <section className="mt-8" aria-labelledby="daftar-antrean">
            <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
              <div>
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                  DAFTAR LAPORAN MASUK
                </p>
                <h2
                  id="daftar-antrean"
                  className="mt-2 font-slab text-2xl text-[#12355B]"
                >
                  Antrean Laporan
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(visibleReports.length).padStart(2, "0")} LAPORAN
              </span>
            </div>
            <div className="hidden grid-cols-[105px_135px_minmax(0,1fr)_52px_155px_120px_130px_85px] gap-3 border-b border-[#D9E2EC] px-4 py-3 font-mono text-[9px] tracking-[0.09em] text-[#52657A] xl:grid">
              <span>ID LAPORAN</span>
              <span>KATEGORI</span>
              <span>MATA KULIAH</span>
              <span>KELAS</span>
              <span>NAMA TUTOR/DOSEN</span>
              <span>TGL PENGAJUAN</span>
              <span>STATUS</span>
              <span>AKSI</span>
            </div>
            <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
              {visibleReports.map((report) => (
                <div key={report.id} className="contents">
                  <article
                    key={`${report.id}-desktop`}
                    className="grid grid-cols-[105px_135px_minmax(0,1fr)_52px_155px_120px_130px_85px] items-center gap-3 px-4 py-5 max-xl:hidden"
                  >
                    <p className="font-mono text-xs font-semibold text-[#005BAC]">
                      {report.id}
                    </p>
                    <p className="text-sm">{report.category}</p>
                    <p className="text-sm font-medium">{report.course}</p>
                    <p className="text-sm">{report.className}</p>
                    <p className="text-sm">{report.tutor}</p>
                    <p className="text-sm">{report.submitted}</p>
                    <span
                      className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${queueStatusClass(report.status)}`}
                    >
                      {report.status}
                    </span>
                    <Link
                      to="/detail-laporan"
                      className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      {report.status === "Perlu Verifikasi"
                        ? "Verifikasi"
                        : "Lihat Detail"}
                    </Link>
                  </article>
                  <article
                    key={`${report.id}-mobile`}
                    className="hidden px-4 py-5 max-xl:block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs font-semibold text-[#005BAC]">
                        {report.id}
                      </p>
                      <span
                        className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${queueStatusClass(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#12355B]">
                      {report.title}
                    </p>
                    <dl className="mt-4 space-y-3 border-t border-[#D9E2EC] pt-4">
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          KATEGORI PERMASALAHAN
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.category}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          MATA KULIAH
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.course}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          KELAS
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.className}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          NAMA TUTOR/DOSEN
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.tutor}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          TANGGAL PENGAJUAN
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.submitted}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to="/detail-laporan"
                      className="mt-5 inline-flex min-w-[148px] justify-center border border-[#005BAC] px-4 py-2.5 text-sm font-semibold text-[#005BAC] transition hover:bg-[#005BAC] hover:text-white"
                    >
                      {report.status === "Perlu Verifikasi"
                        ? "Verifikasi"
                        : "Lihat Detail"}
                    </Link>
                  </article>
                </div>
              ))}
            </div>
            {visibleReports.length === 0 && (
              <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
                <p className="font-slab text-xl text-[#12355B]">
                  Belum ada laporan pada status ini.
                </p>
                <p className="mt-2 text-sm text-[#52657A]">
                  Coba pilih status lain atau ubah kata kunci pencarian.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

const adminDetailFields = [
  ["Kategori Permasalahan", "Materi Tutorial Online"],
  ["Jenis Mata Kuliah", "Teori/Umum"],
  ["Kode Mata Kuliah", "MKDU4109"],
  ["Nama Mata Kuliah", "Pendidikan Kewarganegaraan"],
  ["Kelas Mata Kuliah", "02"],
  ["Nama Tutor/Dosen", "Agus Prasetyo, S.Pd., M.Pd."],
  ["Perkiraan Durasi Tidak Ada Aktivitas/Respons", "1 minggu atau lebih"],
  ["Judul Laporan", "Materi tutorial minggu ke-5 belum tersedia"],
]

export function AdminDetailReportScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [verified, setVerified] = useState(false)
  const navigate = useNavigate()
  const status = verified ? "DIVERIFIKASI" : "PERLU VERIFIKASI"
  const action = () => (verified ? undefined : setConfirmOpen(true))
  const stages = [
    { label: "Diajukan", note: "16 Sep 2026 · 09:18", state: "done" },
    {
      label: "Diverifikasi",
      note: verified ? "16 Sep 2026 · 14:30" : "Menunggu verifikasi",
      state: verified ? "current" : "next",
    },
    { label: "Diproses", note: "Menunggu tindak lanjut", state: "upcoming" },
    { label: "Selesai", note: "Menunggu penyelesaian", state: "upcoming" },
  ] as const
  const stageClasses = (state: string) =>
    state === "done"
      ? "border-[#005BAC] bg-[#005BAC] text-white"
      : state === "current"
        ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
        : state === "next"
          ? "border-[#005BAC] bg-white text-[#005BAC]"
          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
  const nav = (mobile = false) => (
    <nav
      className={
        mobile ? "mt-6 flex flex-col gap-2" : "mt-7 flex flex-col gap-1"
      }
      aria-label="Navigasi administrator"
    >
      {adminNavItems.map((item, index) =>
        item.to === "#" ? (
          <button
            key={item.label}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === 1)}
          >
            <NavNumber active={index === 1} number={index + 1} />
            {item.label}
          </button>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === 1)}
          >
            <NavNumber active={index === 1} number={index + 1} />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`${
            mobileMenuOpen
              ? "hidden"
              : "hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pt-[max(4rem,env(safe-area-inset-top))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] max-[900px]:flex"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-9 shrink-0"
            />
            <div className="min-w-0">
              <span className="block whitespace-nowrap font-slab text-xl leading-none">
                Lapor Tuton
              </span>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.14em] text-[#52657A] max-[360px]:hidden">
                ADMINISTRATOR
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center border border-[#12355B] text-[#12355B]"
            aria-label="Buka menu navigasi"
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
              <span className="font-slab text-[26px] leading-none">
                Lapor Tuton
              </span>
            </div>
            <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
              ADMINISTRATOR
            </span>
          </div>
          {nav()}
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
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] px-5 pb-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9 shrink-0"
                  />
                  <div>
                    <span className="whitespace-nowrap font-slab text-xl leading-none">
                      Lapor Tuton
                    </span>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#52657A]">
                      ADMINISTRATOR
                    </p>
                  </div>
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
              {nav(true)}
              <button className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A]" onClick={handlePrototypeLogout}>
                <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
                  ↗
                </span>
                Keluar
              </button>
            </div>
          </div>
        )}
        <section className="px-8 py-7 max-[620px]:px-5">
          <header className="border-b border-[#D9E2EC] pb-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              ADMINISTRATOR / ANTREAN LAPORAN / DETAIL LAPORAN
            </p>
            <div className="mt-3 flex items-start justify-between gap-6 max-[620px]:block">
              <div>
                <h1 className="font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
                  Detail Laporan
                </h1>
                <p className="mt-2 font-mono text-xs font-semibold tracking-[0.08em] text-[#005BAC]">
                  ID LAPORAN: LT-2026-0008
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] ${
                  verified
                    ? "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"
                    : "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
                } max-[620px]:mt-5`}
              >
                {status}
              </span>
            </div>
          </header>
          <div className="mt-8 space-y-8">
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="status-laporan"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  01 / STATUS LAPORAN
                </p>
                <h2
                  id="status-laporan"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Status Laporan
                </h2>
              </div>
              <div className="p-6 max-[620px]:p-5">
                <ol className="hidden grid-cols-4 md:grid">
                  {stages.map((stage, index) => (
                    <li key={stage.label} className="relative pr-4 last:pr-0">
                      <div
                        className={`absolute left-3 right-0 top-3 h-px ${
                          index === stages.length - 1
                            ? "hidden"
                            : stage.state === "done"
                              ? "bg-[#005BAC]"
                              : "bg-[#D9E2EC]"
                        }`}
                      />
                      <span
                        className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${stageClasses(stage.state)}`}
                      >
                        {stage.state === "done" ? "✓" : index + 1}
                      </span>
                      <p
                        className={`mt-4 text-sm font-semibold ${
                          stage.state === "upcoming"
                            ? "text-[#7D8B99]"
                            : "text-[#12355B]"
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#52657A]">
                        {stage.note}
                      </p>
                    </li>
                  ))}
                </ol>
                <ol className="space-y-0 md:hidden">
                  {stages.map((stage, index) => (
                    <li
                      key={stage.label}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                          index === stages.length - 1
                            ? "hidden"
                            : stage.state === "done"
                              ? "bg-[#005BAC]"
                              : "bg-[#D9E2EC]"
                        }`}
                      />
                      <span
                        className={`relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${stageClasses(stage.state)}`}
                      >
                        {stage.state === "done" ? "✓" : index + 1}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            stage.state === "upcoming"
                              ? "text-[#7D8B99]"
                              : "text-[#12355B]"
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="mt-1 text-xs text-[#52657A]">
                          {stage.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                  <div>
                    <p className="text-sm font-semibold text-[#12355B]">
                      Tindakan Administrator
                    </p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      {verified
                        ? "Laporan telah diverifikasi dan siap untuk tahap berikutnya."
                        : "Periksa informasi dan bukti pendukung sebelum melakukan verifikasi."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={action}
                    className={`shrink-0 px-5 py-3 text-sm font-semibold ${
                      verified
                        ? "mt-0 border border-[#12355B] text-[#12355B] max-[620px]:mt-4"
                        : "mt-0 bg-[#005BAC] text-white hover:bg-[#004784] max-[620px]:mt-4"
                    }`}
                  >
                    {verified ? "Perbarui Status" : "Verifikasi Laporan"}
                  </button>
                </div>
              </div>
            </section>
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="informasi-laporan-admin"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  02 / DATA PENGAJUAN
                </p>
                <h2
                  id="informasi-laporan-admin"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Informasi Laporan
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1 max-[620px]:px-5">
                {adminDetailFields.map(([label, value]) => (
                  <ReadOnlyItem
                    key={label}
                    label={label}
                    value={value}
                    wide={
                      label ===
                        "Perkiraan Durasi Tidak Ada Aktivitas/Respons" ||
                      label === "Judul Laporan"
                    }
                  />
                ))}
              </div>
            </section>
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="uraian-admin"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  03 / PENJELASAN MAHASISWA
                </p>
                <h2
                  id="uraian-admin"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Uraian Permasalahan
                </h2>
              </div>
              <div className="p-6 max-[620px]:p-5">
                <p className="max-w-3xl text-sm leading-7 text-[#1F2937]">
                  Materi tutorial untuk minggu ke-5 pada mata kuliah Pendidikan
                  Kewarganegaraan belum tersedia di ruang Tutorial Online. Saya
                  sudah memeriksa halaman tutorial beberapa kali, namun materi
                  dan petunjuk kegiatan minggu ke-5 belum dapat diakses.
                </p>
              </div>
            </section>
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="lampiran-admin"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  04 / LAMPIRAN
                </p>
                <h2
                  id="lampiran-admin"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Bukti Pendukung
                </h2>
              </div>
              <ul className="divide-y divide-[#D9E2EC]">
                {[
                  ["tangkapan-layar-materi-minggu-5.png", "PNG", "1,2 MB"],
                  ["halaman-tuton-mkdu4109.pdf", "PDF", "824 KB"],
                ].map(([name, type, size]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:items-start max-[620px]:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-mono text-[10px] font-semibold text-[#005BAC]">
                        {type}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1F2937]">
                          {name}
                        </p>
                        <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                          {type} · {size}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      Buka
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="tindak-lanjut-admin"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  05 / PEMBARUAN PENGELOLA
                </p>
                <h2
                  id="tindak-lanjut-admin"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Pembaruan Pengelola
                </h2>
              </div>
              <div className="p-6 max-[620px]:p-5">
                {verified ? (
                  <ol>
                    <li className="flex gap-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] bg-white text-[10px] text-[#005BAC]">
                        ●
                      </span>
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                          16 September 2026, 14:30
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-[#12355B]">
                          Laporan diverifikasi
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#52657A]">
                          Informasi laporan dan bukti pendukung telah diperiksa
                          oleh pengelola.
                        </p>
                      </div>
                    </li>
                  </ol>
                ) : (
                  <p className="text-sm text-[#52657A]">
                    Belum ada tindak lanjut.
                  </p>
                )}
              </div>
            </section>
          </div>
          <div className="mt-8 flex justify-between gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
            <button
              type="button"
              onClick={() => navigate("/administrator/antrean-laporan")}
              className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
            >
              Kembali ke Antrean Laporan
            </button>
            <button
              type="button"
              onClick={action}
              className={`px-5 py-3 text-sm font-semibold ${
                verified
                  ? "border border-[#12355B] text-[#12355B]"
                  : "bg-[#005BAC] text-white hover:bg-[#004784]"
              }`}
            >
              {verified ? "Perbarui Status" : "Verifikasi Laporan"}
            </button>
          </div>
        </section>
      </div>
      {confirmOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verifikasi-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI TINDAKAN
            </p>
            <h2
              id="verifikasi-title"
              className="mt-3 font-slab text-2xl text-[#12355B]"
            >
              Verifikasi Laporan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Pastikan informasi dan bukti pendukung laporan telah diperiksa
              sebelum melakukan verifikasi.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerified(true)
                  setConfirmOpen(false)
                }}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004784]"
              >
                Verifikasi Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

type AdminHistoryReport = {
  id: string
  title: string
  category: string
  course: string
  className: string
  tutor: string
  submitted: string
  status: "Diverifikasi" | "Diproses" | "Selesai"
}

const adminHistoryReports: AdminHistoryReport[] = [
  {
    id: "LT-2026-0005",
    title: "Tutor belum memberi penilaian tugas",
    category: "Aktivitas tutor",
    course: "EKMA4157 · Manajemen Pemasaran",
    className: "03",
    tutor: "Hendra Wijaya, S.E., M.M.",
    submitted: "14 September 2026",
    status: "Diverifikasi",
  },
  {
    id: "LT-2026-0001",
    title: "Belum ada umpan balik diskusi minggu ke-3",
    category: "Aktivitas tutor",
    course: "EKMA4111 · Pengantar Bisnis",
    className: "01",
    tutor: "Dr. Rina Kusuma, M.M.",
    submitted: "12 September 2026",
    status: "Diproses",
  },
  {
    id: "LT-2026-0003",
    title: "Jadwal aktivitas tutor tidak sesuai ketentuan",
    category: "Layanan tutor",
    course: "ADBI4410 · Manajemen Sumber Daya Manusia",
    className: "03",
    tutor: "Nadia Permata, S.E., M.M.",
    submitted: "28 Agustus 2026",
    status: "Selesai",
  },
  {
    id: "LT-2026-0004",
    title: "Keterlambatan respons pada forum diskusi",
    category: "Aktivitas tutor",
    course: "PAJA3210 · Perpajakan",
    className: "02",
    tutor: "Rizka Maulani, S.E., Ak.",
    submitted: "20 Agustus 2026",
    status: "Selesai",
  },
  {
    id: "LT-2026-0002",
    title: "Umpan balik tugas belum diterima",
    category: "Layanan tutor",
    course: "EKMA4216 · Manajemen Operasi",
    className: "01",
    tutor: "Budi Santoso, S.E., M.M.",
    submitted: "15 Agustus 2026",
    status: "Selesai",
  },
]

const historyStatusClass = (status: AdminHistoryReport["status"]) =>
  status === "Selesai"
    ? "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
    : status === "Diproses"
      ? "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
      : "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"

export function AdminHistoryScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [status, setStatus] = useState("Semua")
  const [query, setQuery] = useState("")
  const visibleReports = adminHistoryReports.filter(
    (report) =>
      (status === "Semua" || report.status === status) &&
      `${report.id} ${report.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const nav = (mobile = false) => (
    <nav
      className={
        mobile ? "mt-6 flex flex-col gap-2" : "mt-7 flex flex-col gap-1"
      }
      aria-label="Navigasi administrator"
    >
      {adminNavItems.map((item, index) =>
        item.to === "#" ? (
          <button
            key={item.label}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === 2)}
          >
            <NavNumber active={index === 2} number={index + 1} />
            {item.label}
          </button>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === 2)}
          >
            <NavNumber active={index === 2} number={index + 1} />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
  return (
    <main
      onClick={(event) => rememberAdminDetail(event, "history")}
      className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]"
    >
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`${
            mobileMenuOpen
              ? "hidden"
              : "hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pt-[max(4rem,env(safe-area-inset-top))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] max-[900px]:flex"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-9 shrink-0"
            />
            <div className="min-w-0">
              <span className="block whitespace-nowrap font-slab text-xl leading-none">
                Lapor Tuton
              </span>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.14em] text-[#52657A] max-[360px]:hidden">
                ADMINISTRATOR
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center border border-[#12355B] text-[#12355B]"
            aria-label="Buka menu navigasi"
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
              <span className="font-slab text-[26px] leading-none">
                Lapor Tuton
              </span>
            </div>
            <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
              ADMINISTRATOR
            </span>
          </div>
          {nav()}
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
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] px-5 pb-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9 shrink-0"
                  />
                  <div>
                    <span className="whitespace-nowrap font-slab text-xl leading-none">
                      Lapor Tuton
                    </span>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#52657A]">
                      ADMINISTRATOR
                    </p>
                  </div>
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
              {nav(true)}
              <button className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A]" onClick={handlePrototypeLogout}>
                <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
                  ↗
                </span>
                Keluar
              </button>
            </div>
          </div>
        )}
        <section className="px-8 py-7 max-[620px]:px-5">
          <header className="border-b border-[#D9E2EC] pb-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              ADMINISTRATOR / RIWAYAT LAPORAN
            </p>
            <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Riwayat Laporan
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Arsip laporan yang telah diproses dan diselesaikan.
            </p>
          </header>
          <div className="mt-8 grid grid-cols-[220px_minmax(0,1fr)] gap-4 max-[700px]:grid-cols-1">
            <label className="block">
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                STATUS LAPORAN
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              >
                <option>Semua</option>
                <option>Diverifikasi</option>
                <option>Diproses</option>
                <option>Selesai</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                CARI LAPORAN
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
                placeholder="Cari ID atau judul laporan"
              />
            </label>
          </div>
          <section className="mt-8" aria-labelledby="daftar-riwayat">
            <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
              <div>
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                  DAFTAR RIWAYAT LAPORAN
                </p>
                <h2
                  id="daftar-riwayat"
                  className="mt-2 font-slab text-2xl text-[#12355B]"
                >
                  Riwayat Laporan
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(visibleReports.length).padStart(2, "0")} LAPORAN
              </span>
            </div>
            <div className="hidden grid-cols-[105px_135px_minmax(0,1fr)_52px_155px_120px_130px_85px] gap-3 border-b border-[#D9E2EC] px-4 py-3 font-mono text-[9px] tracking-[0.09em] text-[#52657A] xl:grid">
              <span>ID LAPORAN</span>
              <span>KATEGORI</span>
              <span>MATA KULIAH</span>
              <span>KELAS</span>
              <span>NAMA TUTOR/DOSEN</span>
              <span>TGL PENGAJUAN</span>
              <span>STATUS</span>
              <span>AKSI</span>
            </div>
            <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
              {visibleReports.map((report) => (
                <div key={report.id} className="contents">
                  <article
                    key={`${report.id}-desktop`}
                    className="grid grid-cols-[105px_135px_minmax(0,1fr)_52px_155px_120px_130px_85px] items-center gap-3 px-4 py-5 max-xl:hidden"
                  >
                    <p className="font-mono text-xs font-semibold text-[#005BAC]">
                      {report.id}
                    </p>
                    <p className="text-sm">{report.category}</p>
                    <p className="text-sm font-medium">{report.course}</p>
                    <p className="text-sm">{report.className}</p>
                    <p className="text-sm">{report.tutor}</p>
                    <p className="text-sm">{report.submitted}</p>
                    <span
                      className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${historyStatusClass(report.status)}`}
                    >
                      {report.status}
                    </span>
                    <Link
                      to="/detail-laporan"
                      className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      Lihat Detail
                    </Link>
                  </article>
                  <article
                    key={`${report.id}-mobile`}
                    className="hidden px-4 py-5 max-xl:block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs font-semibold text-[#005BAC]">
                        {report.id}
                      </p>
                      <span
                        className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${historyStatusClass(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#12355B]">
                      {report.title}
                    </p>
                    <dl className="mt-4 space-y-3 border-t border-[#D9E2EC] pt-4">
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          KATEGORI
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.category}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          MATA KULIAH
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.course}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          KELAS
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.className}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          NAMA TUTOR/DOSEN
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.tutor}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                          TGL PENGAJUAN
                        </dt>
                        <dd className="mt-1 text-sm text-[#1F2937]">
                          {report.submitted}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to="/detail-laporan"
                      className="mt-5 inline-flex min-w-[148px] justify-center border border-[#005BAC] px-4 py-2.5 text-sm font-semibold text-[#005BAC] transition hover:bg-[#005BAC] hover:text-white"
                    >
                      Lihat Detail
                    </Link>
                  </article>
                </div>
              ))}
            </div>
            {visibleReports.length === 0 && (
              <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
                <p className="font-slab text-xl text-[#12355B]">
                  Belum ada laporan pada status ini.
                </p>
                <p className="mt-2 text-sm text-[#52657A]">
                  Coba pilih status lain atau ubah kata kunci pencarian.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

export function AdminDynamicDetailReportScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const context =
    window.sessionStorage.getItem("adminDetailContext") === "history"
      ? "history"
      : "queue"
  const selectedId =
    window.sessionStorage.getItem("adminDetailId") ?? "LT-2026-0008"
  const fallback = adminQueueReports[0]
  const base =
    (context === "history" ? adminHistoryReports : adminQueueReports).find(
      (report) => report.id === selectedId,
    ) ?? fallback
  const status = confirmed ? "Diverifikasi" : base.status
  const canVerify = status === "Perlu Verifikasi"
  const activeIndex = context === "history" ? 2 : 1
  const [code, courseName = base.course] = base.course.split(" · ")
  const timelineStates =
    status === "Perlu Verifikasi"
      ? ["done", "next", "upcoming", "upcoming"]
      : status === "Diverifikasi"
        ? ["done", "current", "upcoming", "upcoming"]
        : status === "Diproses"
          ? ["done", "done", "current", "upcoming"]
          : ["done", "done", "done", "current"]
  const timelineLabels = ["Diajukan", "Diverifikasi", "Diproses", "Selesai"]
  const timelineNote = (label: string) =>
    label === "Diajukan"
      ? `${base.submitted} · 09:18`
      : label === "Diverifikasi" && timelineStates[1] !== "next"
        ? "14 September 2026 · 14:30"
        : label === "Diverifikasi"
          ? "Menunggu verifikasi"
          : label === "Diproses" && timelineStates[2] !== "upcoming"
            ? "Dalam tindak lanjut"
            : label === "Selesai" && timelineStates[3] !== "upcoming"
              ? "Telah diselesaikan"
              : "Menunggu tahap berikutnya"
  const stageClass = (state: string) =>
    state === "done"
      ? "border-[#005BAC] bg-[#005BAC] text-white"
      : state === "current"
        ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
        : state === "next"
          ? "border-[#005BAC] bg-white text-[#005BAC]"
          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
  const badgeClass =
    status === "Selesai"
      ? "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
      : status === "Diproses" || status === "Perlu Verifikasi"
        ? "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
        : "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"
  const nav = (mobile = false) => (
    <nav
      className={
        mobile ? "mt-6 flex flex-col gap-2" : "mt-7 flex flex-col gap-1"
      }
      aria-label="Navigasi administrator"
    >
      {adminNavItems.map((item, index) =>
        item.to === "#" ? (
          <button
            key={item.label}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === activeIndex)}
          >
            <NavNumber active={index === activeIndex} number={index + 1} />
            {item.label}
          </button>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
            className={navButton(index === activeIndex)}
          >
            <NavNumber active={index === activeIndex} number={index + 1} />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
  const verify = () => {
    setConfirmed(true)
    setModalOpen(false)
  }
  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`${
            mobileMenuOpen
              ? "hidden"
              : "hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pt-[max(4rem,env(safe-area-inset-top))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] max-[900px]:flex"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-9 shrink-0"
            />
            <div>
              <span className="block whitespace-nowrap font-slab text-xl leading-none">
                Lapor Tuton
              </span>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.14em] text-[#52657A] max-[360px]:hidden">
                ADMINISTRATOR
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center border border-[#12355B] text-[#12355B]"
            aria-label="Buka menu"
          >
            <span className="flex flex-col gap-1">
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
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
            <span className="mt-4 font-slab text-[26px] leading-none">
              Lapor Tuton
            </span>
            <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
              ADMINISTRATOR
            </span>
          </div>
          {nav()}
          <button className="mt-auto flex items-center gap-3 px-3 py-3 text-left text-sm text-[#52657A]" onClick={handlePrototypeLogout}>
            <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
              ↗
            </span>
            Keluar
          </button>
        </aside>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 hidden bg-[#12355B]/30 max-[900px]:block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] px-5 pb-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9"
                  />
                  <div>
                    <span className="font-slab text-xl">Lapor Tuton</span>
                    <p className="font-mono text-[9px] tracking-[0.14em] text-[#52657A]">
                      ADMINISTRATOR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center border border-[#12355B] text-lg text-[#12355B]"
                >
                  ×
                </button>
              </div>
              {nav(true)}
            </div>
          </div>
        )}
        <section className="px-8 py-7 max-[620px]:px-5">
          <header className="border-b border-[#D9E2EC] pb-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              ADMINISTRATOR /{" "}
              {context === "history" ? "RIWAYAT LAPORAN" : "ANTREAN LAPORAN"} /
              DETAIL LAPORAN
            </p>
            <div className="mt-3 flex items-start justify-between gap-6 max-[620px]:block">
              <div>
                <h1 className="font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
                  Detail Laporan
                </h1>
                <p className="mt-2 font-mono text-xs font-semibold tracking-[0.08em] text-[#005BAC]">
                  ID LAPORAN: {base.id}
                </p>
              </div>
              <span
                className={`inline-flex border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] ${badgeClass} max-[620px]:mt-5`}
              >
                {status.toUpperCase()}
              </span>
            </div>
          </header>
          <div className="mt-8 space-y-8">
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  01 / STATUS LAPORAN
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                  Status Laporan
                </h2>
              </div>
              <div className="p-6 max-[620px]:p-5">
                <ol className="hidden grid-cols-4 md:grid">
                  {timelineLabels.map((label, index) => (
                    <li key={label} className="relative pr-4 last:pr-0">
                      <div
                        className={`absolute left-3 right-0 top-3 h-px ${
                          index === 3
                            ? "hidden"
                            : timelineStates[index] === "done"
                              ? "bg-[#005BAC]"
                              : "bg-[#D9E2EC]"
                        }`}
                      />
                      <span
                        className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${stageClass(timelineStates[index])}`}
                      >
                        {timelineStates[index] === "done" ? "✓" : index + 1}
                      </span>
                      <p
                        className={`mt-4 text-sm font-semibold ${
                          timelineStates[index] === "upcoming"
                            ? "text-[#7D8B99]"
                            : "text-[#12355B]"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#52657A]">
                        {timelineNote(label)}
                      </p>
                    </li>
                  ))}
                </ol>
                <ol className="space-y-0 md:hidden">
                  {timelineLabels.map((label, index) => (
                    <li
                      key={label}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                          index === 3
                            ? "hidden"
                            : timelineStates[index] === "done"
                              ? "bg-[#005BAC]"
                              : "bg-[#D9E2EC]"
                        }`}
                      />
                      <span
                        className={`relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${stageClass(timelineStates[index])}`}
                      >
                        {timelineStates[index] === "done" ? "✓" : index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#12355B]">
                          {label}
                        </p>
                        <p className="mt-1 text-xs text-[#52657A]">
                          {timelineNote(label)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                {canVerify && (
                  <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                    <div>
                      <p className="text-sm font-semibold text-[#12355B]">
                        Tindakan Administrator
                      </p>
                      <p className="mt-1 text-sm text-[#52657A]">
                        Periksa informasi dan bukti pendukung sebelum melakukan
                        verifikasi.
                      </p>
                    </div>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="shrink-0 bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#004784] max-[620px]:mt-4"
                    >
                      Verifikasi Laporan
                    </button>
                  </div>
                )}
                {!canVerify && (
                  <div className="mt-7 border-t border-[#D9E2EC] pt-5">
                    <p className="text-sm font-semibold text-[#12355B]">
                      Status saat ini: {status}
                    </p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      Laporan telah melalui tahap verifikasi dan tidak
                      memerlukan tindakan verifikasi ulang.
                    </p>
                  </div>
                )}
              </div>
            </section>
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  02 / DATA PENGAJUAN
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                  Informasi Laporan
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1 max-[620px]:px-5">
                {[
                  ["Kategori Permasalahan", base.category],
                  ["Jenis Mata Kuliah", "Teori/Umum"],
                  ["Kode Mata Kuliah", code],
                  ["Nama Mata Kuliah", courseName],
                  ["Kelas Mata Kuliah", base.className],
                  ["Nama Tutor/Dosen", base.tutor],
                  [
                    "Perkiraan Durasi Tidak Ada Aktivitas/Respons",
                    "1 minggu atau lebih",
                  ],
                  ["Judul Laporan", base.title],
                ].map(([label, value]) => (
                  <ReadOnlyItem
                    key={label}
                    label={label}
                    value={value}
                    wide={
                      label ===
                        "Perkiraan Durasi Tidak Ada Aktivitas/Respons" ||
                      label === "Judul Laporan"
                    }
                  />
                ))}
              </div>
            </section>
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  03 / PENJELASAN MAHASISWA
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                  Uraian Permasalahan
                </h2>
              </div>
              <p className="p-6 text-sm leading-7 text-[#1F2937] max-[620px]:p-5">
                Mahasiswa melaporkan kendala terkait “{base.title}” pada mata
                kuliah {base.course}. Laporan disampaikan berdasarkan pengalaman
                selama kegiatan Tutorial Online.
              </p>
            </section>
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  04 / LAMPIRAN
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                  Bukti Pendukung
                </h2>
              </div>
              <ul className="divide-y divide-[#D9E2EC]">
                {[
                  ["tangkapan-layar-laporan.png", "PNG", "1,2 MB"],
                  ["bukti-pendukung-tuton.pdf", "PDF", "824 KB"],
                ].map(([name, type, size]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-mono text-[10px] font-semibold text-[#005BAC]">
                        {type}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="mt-1 font-mono text-[10px] text-[#52657A]">
                          {type} · {size}
                        </p>
                      </div>
                    </div>
                    <button className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC]">
                      Buka
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  05 / PEMBARUAN PENGELOLA
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                  Pembaruan Pengelola
                </h2>
              </div>
              <div className="p-6 max-[620px]:p-5">
                {canVerify ? (
                  <p className="text-sm text-[#52657A]">
                    Belum ada tindak lanjut.
                  </p>
                ) : (
                  <div className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] text-[10px] text-[#005BAC]">
                      ●
                    </span>
                    <div>
                      <p className="font-mono text-[10px] text-[#52657A]">
                        {base.submitted}, 14:30
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-[#12355B]">
                        Laporan diverifikasi
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#52657A]">
                        Informasi laporan dan bukti pendukung telah diperiksa
                        oleh pengelola.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="mt-8 flex justify-between gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
            <button
              onClick={() =>
                navigate(
                  context === "history"
                    ? "/administrator/riwayat-laporan"
                    : "/administrator/antrean-laporan",
                )
              }
              className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] hover:bg-[#12355B] hover:text-white"
            >
              Kembali ke{" "}
              {context === "history" ? "Riwayat Laporan" : "Antrean Laporan"}
            </button>
            {canVerify ? (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#004784]"
              >
                Verifikasi Laporan
              </button>
            ) : (
              <button className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B]">
                Perbarui Status
              </button>
            )}
          </div>
        </section>
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI TINDAKAN
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">
              Verifikasi Laporan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Pastikan informasi dan bukti pendukung laporan telah diperiksa
              sebelum melakukan verifikasi.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={verify}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Verifikasi Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
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

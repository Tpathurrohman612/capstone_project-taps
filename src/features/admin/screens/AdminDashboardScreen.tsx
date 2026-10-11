import { useState } from "react"
import { Link } from "react-router"
import universitasTerbukaLogo from "../../../assets/universitas-terbuka-logo.png"
import type { WorkflowReport } from "../../../shared/types/workflow"
import { getWorkflowReports } from "../../../shared/lib/workflow-storage"
import { handlePrototypeLogout } from "../../../shared/lib/auth-session"
import { adminNavItems } from "../data/navigation"

const navButton = (active: boolean) =>
  `group flex items-center gap-3 border px-3 py-3 text-left text-sm transition-colors ${
    active
      ? "border-[#12355B] bg-[#12355B] font-medium text-white"
      : "border-transparent hover:border-[#D9E2EC] hover:bg-white"
  }`

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

const adminStatusClass = (status: string) =>
  status === "Selesai"
    ? "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
    : status === "Sedang Diproses"
      ? "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
      : "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"

export function AdminDashboardScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dashboardWorkflowReports = getWorkflowReports()
  const dashboardReport = (report: WorkflowReport) => ({
    ...report,
    date: report.submitted,
    action: report.status === "Diterima" ? "Verifikasi" : "Lihat Detail",
    status: report.status === "Diproses" ? "Sedang Diproses" : report.status,
  })
  const dashboardOrder = [
    "LT-2026-0008",
    "LT-2026-0007",
    "LT-2026-0005",
    "LT-2026-0001",
    "LT-2026-0003",
    "LT-2026-0004",
    "LT-2026-0002",
  ]
  const byDashboardOrder = (left: WorkflowReport, right: WorkflowReport) =>
    dashboardOrder.indexOf(left.id) - dashboardOrder.indexOf(right.id)
  const priorityReports = dashboardWorkflowReports
    .filter((report) => report.status !== "Selesai")
    .sort(byDashboardOrder)
    .map(dashboardReport)
  const recentReports = [...dashboardWorkflowReports]
    .sort(byDashboardOrder)
    .map(dashboardReport)
  const setDashboardDetailTarget = (id: string, status: string) => {
    window.sessionStorage.setItem(
      "adminDetailContext",
      status === "Selesai" ? "history" : "queue",
    )
    window.sessionStorage.setItem("adminDetailId", id)
  }
  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
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
          <nav
            className="mt-7 flex flex-col gap-1"
            aria-label="Navigasi administrator"
          >
            {adminNavItems.map((item, index) =>
              item.to === "#" ? (
                <button key={item.label} className={navButton(index === 0)}>
                  <NavNumber active={index === 0} number={index + 1} />
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={navButton(index === 0)}
                >
                  <NavNumber active={index === 0} number={index + 1} />
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
            aria-label="Navigasi administrator"
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
                  <div className="min-w-0">
                    <span className="block truncate font-slab text-xl leading-none max-[360px]:text-lg">
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
              <nav className="mt-6 flex flex-col gap-2">
                {adminNavItems.map((item, index) =>
                  item.to === "#" ? (
                    <button
                      key={item.label}
                      onClick={() => setMobileMenuOpen(false)}
                      className={navButton(index === 0)}
                    >
                      <NavNumber active={index === 0} number={index + 1} />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={navButton(index === 0)}
                    >
                      <NavNumber active={index === 0} number={index + 1} />
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
        <section className="px-8 py-7 max-[620px]:px-5">
          <header className="border-b border-[#D9E2EC] pb-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              ADMINISTRATOR / DASHBOARD
            </p>
            <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Dashboard Administrator
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              Pantau dan kelola laporan permasalahan terkait aktivitas dan
              layanan tutor.
            </p>
          </header>
          <div className="mt-8 grid grid-cols-5 border border-[#D9E2EC] max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[620px]:grid-cols-1">
            {[
              [
                String(dashboardWorkflowReports.length).padStart(2, "0"),
                "Total Laporan",
                "Seluruh laporan masuk",
              ],
              [
                String(
                  dashboardWorkflowReports.filter(
                    (report) => report.status === "Diterima",
                  ).length,
                ).padStart(2, "0"),
                "Perlu Verifikasi",
                "Menunggu verifikasi",
              ],
              [
                String(
                  dashboardWorkflowReports.filter(
                    (report) => report.status === "Menunggu Validasi",
                  ).length,
                ).padStart(2, "0"),
                "Menunggu Validasi",
                "Menunggu hasil validasi",
              ],
              [
                String(
                  dashboardWorkflowReports.filter(
                    (report) => report.status === "Diproses",
                  ).length,
                ).padStart(2, "0"),
                "Sedang Diproses",
                "Dalam tindak lanjut",
              ],
              [
                String(
                  dashboardWorkflowReports.filter(
                    (report) => report.status === "Selesai",
                  ).length,
                ).padStart(2, "0"),
                "Selesai",
                "Telah diselesaikan",
              ],
            ].map(([number, label, caption], index) => (
              <div
                key={label}
                className={`min-h-[150px] p-5 ${
                  index > 0
                    ? "border-l border-[#D9E2EC] max-[1100px]:border-t max-[760px]:border-l-0 max-[620px]:border-t"
                    : ""
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                  {label.toUpperCase()}
                </p>
                <p className="mt-5 font-slab text-5xl leading-none text-[#12355B]">
                  {number}
                </p>
                <p className="mt-3 text-xs text-[#52657A]">{caption}</p>
              </div>
            ))}
          </div>
          <section className="mt-10" aria-labelledby="perlu-ditindaklanjuti">
            <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
              <div>
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                  ANTREAN PRIORITAS
                </p>
                <h2
                  id="perlu-ditindaklanjuti"
                  className="mt-2 font-slab text-2xl text-[#12355B]"
                >
                  Laporan yang Perlu Ditindaklanjuti
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(priorityReports.length).padStart(2, "0")} LAPORAN
              </span>
            </div>
            <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
              {priorityReports.map((report) => (
                <div key={report.id} className="contents">
                  <article
                    key={`${report.id}-desktop`}
                    className="grid grid-cols-[150px_minmax(0,1fr)_140px_120px_92px] items-center gap-4 px-4 py-5 max-[850px]:hidden"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#005BAC]">
                        {report.id}
                      </p>
                      <p className="mt-1 text-[11px] text-[#52657A]">
                        {report.date}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#1F2937]">
                      {report.title}
                    </p>
                    <span
                      className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${adminStatusClass(report.status)}`}
                    >
                      {report.status}
                    </span>
                    <p className="text-xs text-[#52657A]">{report.date}</p>
                    <Link
                      to="/detail-laporan"
                      onClick={() =>
                        setDashboardDetailTarget(report.id, report.status)
                      }
                      className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      {report.action}
                    </Link>
                  </article>
                  <article
                    key={`${report.id}-mobile`}
                    className="hidden px-4 py-5 max-[850px]:block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs font-semibold text-[#005BAC]">
                        {report.id}
                      </p>
                      <span
                        className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${adminStatusClass(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#12355B]">
                      {report.title}
                    </p>
                    <div className="mt-4 border-t border-[#D9E2EC] pt-4">
                      <p className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                        TANGGAL PENGAJUAN
                      </p>
                      <p className="mt-1 text-sm text-[#1F2937]">
                        {report.date}
                      </p>
                    </div>
                    <Link
                      to="/detail-laporan"
                      onClick={() =>
                        setDashboardDetailTarget(report.id, report.status)
                      }
                      className="mt-5 inline-flex min-w-[148px] justify-center border border-[#005BAC] px-4 py-2.5 text-sm font-semibold text-[#005BAC] transition hover:bg-[#005BAC] hover:text-white"
                    >
                      {report.action}
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          </section>
          <section className="mt-10" aria-labelledby="laporan-terbaru">
            <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
              <div>
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                  LAPORAN MASUK
                </p>
                <h2
                  id="laporan-terbaru"
                  className="mt-2 font-slab text-2xl text-[#12355B]"
                >
                  Laporan Terbaru
                </h2>
              </div>
            </div>
            <div className="hidden grid-cols-[110px_150px_minmax(0,1fr)_62px_160px_130px_80px] gap-3 border-b border-[#D9E2EC] px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#52657A] lg:grid">
              <span>ID LAPORAN</span>
              <span>KATEGORI</span>
              <span>MATA KULIAH</span>
              <span>KELAS</span>
              <span>TUTOR</span>
              <span>STATUS</span>
              <span>AKSI</span>
            </div>
            <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
              {recentReports.map((report) => (
                <div key={report.id} className="contents">
                  <article
                    key={`${report.id}-desktop`}
                    className="grid grid-cols-[110px_150px_minmax(0,1fr)_62px_160px_130px_80px] items-center gap-3 px-4 py-5 max-lg:hidden"
                  >
                    <p className="font-mono text-xs font-semibold text-[#005BAC]">
                      {report.id}
                    </p>
                    <p className="text-sm">{report.category}</p>
                    <p className="text-sm font-medium">{report.course}</p>
                    <p className="text-sm">{report.className}</p>
                    <p className="text-sm">{report.tutor}</p>
                    <span
                      className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${adminStatusClass(report.status)}`}
                    >
                      {report.status}
                    </span>
                    <Link
                      to="/detail-laporan"
                      onClick={() =>
                        setDashboardDetailTarget(report.id, report.status)
                      }
                      className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      Detail
                    </Link>
                  </article>
                  <article
                    key={`${report.id}-mobile`}
                    className="hidden px-4 py-5 max-lg:block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs font-semibold text-[#005BAC]">
                        {report.id}
                      </p>
                      <span
                        className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${adminStatusClass(report.status)}`}
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
                      onClick={() =>
                        setDashboardDetailTarget(report.id, report.status)
                      }
                      className="mt-5 inline-flex min-w-[148px] justify-center border border-[#005BAC] px-4 py-2.5 text-sm font-semibold text-[#005BAC] transition hover:bg-[#005BAC] hover:text-white"
                    >
                      Lihat Detail
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

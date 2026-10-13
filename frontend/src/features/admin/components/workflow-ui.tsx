import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import universitasTerbukaLogo from '../../../assets/universitas-terbuka-logo.png'
import type { WorkflowReport, WorkflowStatus } from '../../../shared/types/workflow'
import { handlePrototypeLogout } from '../../../shared/lib/auth-session'
import { adminNavItems } from '../data/navigation'

const navButton = (active: boolean) =>
  `group flex items-center gap-3 border px-3 py-3 text-left text-sm transition-colors ${
    active
      ? 'border-[#12355B] bg-[#12355B] font-medium text-white'
      : 'border-transparent hover:border-[#D9E2EC] hover:bg-white'
  }`

function NavNumber({ active, number }: { active: boolean; number: number }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center border text-[10px] ${
        active ? 'border-[#9FC8EA] text-[#DCEBF8]' : 'border-[#A9B8C8] text-[#52657A]'
      }`}
    >
      0{number}
    </span>
  )
}

export const workflowStatusClass = (status: WorkflowStatus) =>
  status === 'Selesai'
    ? 'border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]'
    : status === 'Diproses' || status === 'Diterima'
      ? 'border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]'
      : 'border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]'

export function AdminWorkflowShell({
  activeIndex,
  children,
}: {
  activeIndex: number
  children: ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const nav = (mobile = false) => (
    <nav
      className={mobile ? 'mt-6 flex flex-col gap-2' : 'mt-7 flex flex-col gap-1'}
      aria-label="Navigasi administrator"
    >
      {adminNavItems.map((item, index) =>
        item.to === '#' ? (
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
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`${
            mobileMenuOpen
              ? 'hidden'
              : 'sticky top-0 z-10 hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pt-[max(4rem,env(safe-area-inset-top))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] max-[900px]:flex'
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
            <span className="mt-4 font-slab text-[26px] leading-none">Lapor Tuton</span>
            <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
              ADMINISTRATOR
            </span>
          </div>
          {nav()}
          <button
            className="mt-auto flex items-center gap-3 px-3 py-3 text-left text-sm text-[#52657A]"
            onClick={handlePrototypeLogout}
          >
            <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
              ↗
            </span>
            Keluar
          </button>
        </aside>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 hidden bg-[#12355B]/30 max-[900px]:block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col bg-[#F7F9FC] pb-5 pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9"
                  />
                  <div className="min-w-0">
                    <span className="block truncate font-slab text-xl leading-none max-[360px]:text-lg">
                      Lapor Tuton
                    </span>
                    <p className="font-mono text-[9px] tracking-[0.14em] text-[#52657A]">
                      ADMINISTRATOR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center border border-[#12355B] text-lg text-[#12355B]"
                  aria-label="Tutup menu"
                >
                  ×
                </button>
              </div>
              {nav(true)}
            </div>
          </div>
        )}
        {children}
      </div>
    </main>
  )
}

export function WorkflowDetailLink({
  report,
  context,
  className,
  children,
}: {
  report: WorkflowReport
  context: 'queue' | 'history'
  className: string
  children: ReactNode
}) {
  return (
    <Link
      to="/detail-laporan"
      onClick={() => {
        window.sessionStorage.setItem('adminDetailContext', context)
        window.sessionStorage.setItem('adminDetailId', report.id)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}

export { FACULTIES, type Faculty } from '../../../shared/data/faculties'

export const reportGroup = (report: WorkflowReport) => {
  if (report.course.startsWith('AKUN')) {
    return {
      faculty: 'Fakultas Ekonomi dan Bisnis',
      programStudy: 'Akuntansi',
    }
  }
  if (report.course.startsWith('ESPA')) {
    return {
      faculty: 'Fakultas Ekonomi dan Bisnis',
      programStudy: 'Ekonomi Pembangunan',
    }
  }
  if (report.course.startsWith('ADBI')) {
    return {
      faculty: 'Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik',
      programStudy: 'Administrasi Bisnis',
    }
  }
  return {
    faculty: 'Fakultas Ekonomi dan Bisnis',
    programStudy: report.course.startsWith('PAJA') ? 'Akuntansi Keuangan Publik' : 'Manajemen',
  }
}

export const exportFilePart = (value: string) => value.replace(/[^A-Za-z0-9]+/g, '_')

export function WorkflowTable({
  reports,
  context,
  selectable = false,
  selectedIds = [],
  onToggle,
  showProgramStudy = false,
}: {
  reports: WorkflowReport[]
  context: 'queue' | 'history'
  selectable?: boolean
  selectedIds?: string[]
  onToggle?: (id: string) => void
  showProgramStudy?: boolean
}) {
  const gridColumns = showProgramStudy
    ? 'grid-cols-[105px_130px_140px_130px_minmax(240px,1fr)_100px_150px_120px_125px_95px]'
    : selectable
      ? 'grid-cols-[28px_105px_130px_140px_minmax(0,1fr)_52px_150px_120px_125px_95px]'
      : 'grid-cols-[105px_130px_140px_minmax(0,1fr)_52px_150px_120px_125px_95px]'
  return (
    <>
      <div className={showProgramStudy ? 'overflow-x-auto' : undefined}>
        <div
          className={`hidden ${gridColumns} ${showProgramStudy ? 'xl:min-w-[1500px]' : ''} gap-3 border-b border-[#D9E2EC] px-4 py-3 font-mono text-[9px] tracking-[0.09em] text-[#52657A] xl:grid`}
        >
          {selectable && <span aria-hidden="true" />}
          <span>ID LAPORAN</span>
          <span>KATEGORI</span>
          <span>FAKULTAS</span>
          {showProgramStudy && <span>PROGRAM STUDI</span>}
          <span>MATA KULIAH</span>
          <span>KELAS</span>
          <span>{context === 'queue' ? 'TUTOR' : 'TUTOR'}</span>
          <span>TGL PENGAJUAN</span>
          <span>STATUS</span>
          <span>AKSI</span>
        </div>
        <div
          className={`divide-y divide-[#D9E2EC] border-b border-[#D9E2EC] ${showProgramStudy ? 'xl:min-w-[1500px]' : ''}`}
        >
          {reports.map((report) => (
            <div key={report.id} className="contents">
              <article
                key={`${report.id}-desktop`}
                className={`grid ${gridColumns} items-center gap-3 px-4 py-5 max-xl:hidden`}
              >
                {selectable && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(report.id)}
                    onChange={() => onToggle?.(report.id)}
                    disabled={report.status !== 'Diverifikasi'}
                    aria-label={`Pilih laporan ${report.id}`}
                    className="h-4 w-4 accent-[#005BAC] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                )}
                <p className="font-mono text-xs font-semibold text-[#005BAC]">{report.id}</p>
                <p className="text-sm">{report.category}</p>
                <p className="text-sm">{report.studentFaculty ?? '—'}</p>
                {showProgramStudy && <p className="text-sm">{reportGroup(report).programStudy}</p>}
                <p className="text-sm font-medium">{report.course}</p>
                <p className="text-sm">{report.className}</p>
                <p className="text-sm">{report.tutor}</p>
                <p className="text-sm">{report.submitted}</p>
                <span
                  className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${workflowStatusClass(report.status)}`}
                >
                  {context === 'queue' && report.status === 'Diproses'
                    ? 'Sedang Diproses'
                    : report.status}
                </span>
                <WorkflowDetailLink
                  report={report}
                  context={context}
                  className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                >
                  {report.status === 'Diterima' ? 'Verifikasi' : 'Lihat Detail'}
                </WorkflowDetailLink>
              </article>
              <article key={`${report.id}-mobile`} className="hidden px-4 py-5 max-xl:block">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-center gap-3">
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(report.id)}
                        onChange={() => onToggle?.(report.id)}
                        disabled={report.status !== 'Diverifikasi'}
                        aria-label={`Pilih laporan ${report.id}`}
                        className="h-4 w-4 accent-[#005BAC] disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    )}
                    <p className="font-mono text-xs font-semibold text-[#005BAC]">{report.id}</p>
                  </label>
                  <span
                    className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${workflowStatusClass(report.status)}`}
                  >
                    {context === 'queue' && report.status === 'Diproses'
                      ? 'Sedang Diproses'
                      : report.status}
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
                    <dd className="mt-1 text-sm">{report.category}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      FAKULTAS
                    </dt>
                    <dd className="mt-1 text-sm">{report.studentFaculty ?? '—'}</dd>
                  </div>
                  {showProgramStudy && (
                    <div>
                      <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                        PROGRAM STUDI
                      </dt>
                      <dd className="mt-1 text-sm">{reportGroup(report).programStudy}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      MATA KULIAH
                    </dt>
                    <dd className="mt-1 text-sm">{report.course}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">KELAS</dt>
                    <dd className="mt-1 text-sm">{report.className}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      {context === 'queue' ? 'TUTOR' : 'TUTOR'}
                    </dt>
                    <dd className="mt-1 text-sm">{report.tutor}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      TGL PENGAJUAN
                    </dt>
                    <dd className="mt-1 text-sm">{report.submitted}</dd>
                  </div>
                </dl>
                <WorkflowDetailLink
                  report={report}
                  context={context}
                  className="mt-5 inline-flex min-w-[148px] justify-center border border-[#005BAC] px-4 py-2.5 text-sm font-semibold text-[#005BAC] hover:bg-[#005BAC] hover:text-white"
                >
                  {report.status === 'Diterima' ? 'Verifikasi' : 'Lihat Detail'}
                </WorkflowDetailLink>
              </article>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

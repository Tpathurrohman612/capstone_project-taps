import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import universitasTerbukaLogo from "./assets/universitas-terbuka-logo.png"
import placeholderAvatar from "./assets/placeholder-avatar.svg"
import { historyReports } from "./features/student/data/history-reports"
import type { HistoryReport } from "./shared/types/history-report"
import { studentNotifications, type StudentNotification } from "./features/student/data/notifications"
import type { WorkflowReport, WorkflowStatus, WorkflowUpdate } from "./shared/types/workflow"
import { workflowSeed } from "./shared/data/workflow-seed"
import { getWorkflowReports, saveWorkflowReports } from "./shared/lib/workflow-storage"
import { handlePrototypeLogout } from "./shared/lib/auth-session"
import { getStudentHistoryReports } from "./features/student/lib/history-reports"
import { statusBadge } from "./features/student/lib/status-badge"
import { adminNavItems } from "./features/admin/data/navigation"
import { navItems } from "./features/student/data/navigation"
import { followUps, statusStages } from "./features/student/data/detail-report"

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

export function DashboardScreen() {
  const [selectedReport, setSelectedReport] = useState<HistoryReport | null>(
    null,
  )
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] =
    useState<StudentNotification[]>(studentNotifications)
  const navigate = useNavigate()
  const studentReports = getStudentHistoryReports()
  const recentReports = studentReports.slice(0, 3)
  const unreadNotifications = notifications.filter(
    (notification) => notification.unread,
  ).length

  const openNotification = (notification: StudentNotification) => {
    const report = studentReports.find(
      (item) => item.id === notification.reportId,
    )
    if (report) setSelectedReport(report)
    setNotifications((items) =>
      items.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item,
      ),
    )
    setNotificationsOpen(false)
  }

  return (
    <>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="flex items-start justify-between border-b border-[#D9E2EC] pb-8 max-[620px]:block">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              DASHBOARD / MAHASISWA
            </p>
            <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Selamat datang, Nama Mahasiswa.
            </h1>
            <p className="mt-2 text-sm text-[#52657A]">
              Pantau laporan terkait layanan dan aktivitas tutor Anda.
            </p>
          </div>
          <div className="relative mt-1 flex items-center gap-3 max-[620px]:mt-6">
            <div className="border-l border-[#D9E2EC] pl-4 text-right max-[620px]:border-l-0 max-[620px]:pl-0 max-[620px]:text-left">
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                NIM
              </p>
              <p className="mt-1 text-sm font-medium">XXXXXXXXXX</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center border border-[#12355B] text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              aria-label={`Notifikasi${unreadNotifications ? `, ${unreadNotifications} belum dibaca` : ""}`}
              aria-expanded={notificationsOpen}
              aria-controls="student-notifications"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                <path d="M10 21h4" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 border border-white bg-[#005BAC]" />
              )}
            </button>

            {notificationsOpen && (
              <section
                id="student-notifications"
                className="absolute right-0 top-[calc(100%+12px)] z-20 w-[360px] max-w-[calc(100vw-2.5rem)] border-2 border-[#12355B] bg-white shadow-[6px_6px_0_#12355B]"
                aria-label="Notifikasi laporan"
              >
                <div className="flex items-center justify-between border-b border-[#D9E2EC] bg-[#EEF5FB] px-4 py-3">
                  <div>
                    <p className="font-slab text-base text-[#12355B]">
                      Notifikasi
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      {unreadNotifications > 0
                        ? `${unreadNotifications} BELUM DIBACA`
                        : "SEMUA SUDAH DIBACA"}
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      className="border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="divide-y divide-[#D9E2EC]">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => openNotification(notification)}
                        className="relative w-full px-4 py-4 pr-8 text-left transition hover:bg-[#F7F9FC]"
                      >
                        {notification.unread && (
                          <span className="absolute right-4 top-5 h-2 w-2 bg-[#005BAC]" />
                        )}
                        <p className="text-sm font-medium leading-5 text-[#12355B]">
                          {notification.message}
                        </p>
                        <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                          {notification.reportId} · {notification.time}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="font-slab text-base text-[#12355B]">
                      Tidak ada notifikasi
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#52657A]">
                      Pembaruan status dan tindak lanjut laporan akan tampil di
                      sini.
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        </header>
        <div className="mt-8 grid grid-cols-[repeat(3,minmax(0,1fr))] border border-[#D9E2EC] max-[760px]:grid-cols-1">
          {[
            [
              String(studentReports.length).padStart(2, "0"),
              "Total Laporan",
              "Seluruh laporan Anda",
            ],
            [
              String(
                studentReports.filter(
                  (report) => report.status === "Sedang Diproses",
                ).length,
              ).padStart(2, "0"),
              "Sedang Diproses",
              "Menunggu tindak lanjut",
            ],
            [
              String(
                studentReports.filter((report) => report.status === "Selesai")
                  .length,
              ).padStart(2, "0"),
              "Selesai",
              "Telah ditangani",
            ],
          ].map(([number, label, caption], index) => (
            <div
              key={label}
              className={`min-h-[150px] p-5 ${
                index !== 0
                  ? "border-l border-[#D9E2EC] max-[760px]:border-l-0 max-[760px]:border-t"
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
        <div className="mt-8 flex items-center justify-between border-y border-[#D9E2EC] bg-[#EEF5FB] px-5 py-5 max-[620px]:block">
          <div>
            <p className="font-slab text-xl">Butuh menyampaikan kendala?</p>
            <p className="mt-1 text-sm text-[#52657A]">
              Kirim laporan agar dapat ditindaklanjuti oleh pengelola Tuton.
            </p>
          </div>
          <button
            onClick={() => navigate("/buat-laporan")}
            className="mt-0 inline-flex items-center gap-4 bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004784] focus:outline-2 focus:outline-offset-2 focus:outline-[#005BAC] max-[620px]:mt-5"
          >
            Buat Laporan <span aria-hidden="true">→</span>
          </button>
        </div>
        <section className="mt-10" aria-labelledby="recent-reports">
          <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                AKTIVITAS TERKINI
              </p>
              <h2
                id="recent-reports"
                className="mt-2 font-slab text-2xl text-[#12355B]"
              >
                Laporan Terbaru
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
              {String(recentReports.length).padStart(2, "0")} LAPORAN
            </span>
          </div>
          <div className="hidden grid-cols-[170px_minmax(0,1fr)_160px_92px] border-b border-[#D9E2EC] px-4 py-3 font-mono text-[10px] tracking-[0.12em] text-[#52657A] md:grid">
            <span>ID LAPORAN</span>
            <span>KATEGORI MASALAH</span>
            <span>STATUS</span>
            <span>AKSI</span>
          </div>
          <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
            {recentReports.map((report) => (
              <article
                key={report.id}
                className="grid grid-cols-[170px_minmax(0,1fr)_160px_92px] items-center gap-3 px-4 py-5 max-md:block"
              >
                <div>
                  <p className="font-mono text-xs font-medium text-[#005BAC]">
                    {report.id}
                  </p>
                  <p className="mt-1 text-[11px] text-[#52657A] md:hidden">
                    {report.submitted}
                  </p>
                </div>
                <div className="max-md:mt-3">
                  <p className="text-sm font-medium">
                    {report.category ?? "Aktivitas tutor"}
                  </p>
                  <p className="mt-1 text-xs text-[#52657A] max-md:hidden">
                    Diajukan {report.submitted}
                  </p>
                </div>
                <div className="max-md:mt-3">
                  <span
                    className={`inline-flex border px-2.5 py-1 font-mono text-[10px] tracking-[0.05em] ${statusBadge(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="mt-0 border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B] max-md:mt-4"
                >
                  Detail
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
      {selectedReport && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              RINCIAN LAPORAN
            </p>
            <h3 className="mt-3 font-slab text-2xl text-[#12355B]">
              {selectedReport.id}
            </h3>
            <p className="mt-5 text-sm">
              <span className="text-[#52657A]">Kategori: </span>
              {selectedReport.category}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-[#52657A]">Status: </span>
              {selectedReport.status}
            </p>
            <section className="mt-5 border-t border-[#D9E2EC] pt-4" aria-labelledby="informasi-penanganan">
              <h4
                id="informasi-penanganan"
                className="font-slab text-base text-[#12355B]"
              >
                Informasi Penanganan
              </h4>
              <p className="mt-2 text-sm">
                <span className="text-[#52657A]">
                  Pihak/Unit Penanganan:{" "}
                </span>
                Fakultas/Unit Terkait
              </p>
              <p className="mt-2 text-xs leading-5 text-[#52657A]">
                Validasi oleh Fakultas/Unit terkait dilakukan melalui kanal
                eksternal.
              </p>
            </section>
            <button
              onClick={() => setSelectedReport(null)}
              className="mt-7 border border-[#12355B] px-4 py-2 text-sm font-medium text-[#12355B] hover:bg-[#12355B] hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#12355B]">
        {label} <span className="text-[#005BAC]">*</span>
      </span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs leading-5 text-[#52657A]">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-2 block text-xs leading-5 text-[#B42318]">
          {error}
        </span>
      )}
    </label>
  )
}

function GuideHeading({
  number,
  id,
  title,
}: {
  number: string
  id: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#12355B] font-mono text-[10px] font-semibold text-white">
        {number}
      </span>
      <h3 id={id} className="font-slab text-lg text-[#12355B]">
        {title}
      </h3>
    </div>
  )
}

const control =
  "mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"

export function CreateReportScreen() {
  const [duration, setDuration] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [guideOpen, setGuideOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [submittedReportId, setSubmittedReportId] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const submissionPending = useRef(false)
  const navigate = useNavigate()
  const inputClass = (field: string) =>
    errors[field]
      ? `${control} !border-[#B42318] focus:!border-[#B42318] focus:!ring-[#B42318]/15`
      : control
  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []).filter(
      (file) => file.size <= 10 * 1024 * 1024,
    )
    setFiles((current) => [...current, ...incoming].slice(0, 5))
    event.target.value = ""
  }
  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || submissionComplete || submissionPending.current) return

    const data = new FormData(event.currentTarget)
    const requiredFields = [
      ["category", "Pilih kategori permasalahan."],
      ["courseType", "Pilih jenis mata kuliah."],
      ["courseCode", "Masukkan kode mata kuliah."],
      ["courseName", "Masukkan nama mata kuliah."],
      ["className", "Masukkan kelas mata kuliah."],
      ["tutor", "Masukkan nama tutor."],
      ["duration", "Pilih perkiraan durasi."],
      ["title", "Masukkan judul laporan."],
      ["description", "Masukkan uraian permasalahan."],
    ] as const
    const nextErrors = requiredFields.reduce<Record<string, string>>(
      (current, [field, message]) => {
        if (!String(data.get(field) ?? "").trim()) current[field] = message
        return current
      },
      {},
    )

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalidField = requiredFields.find(
        ([field]) => nextErrors[field],
      )?.[0]
      window.setTimeout(() => {
        document
          .getElementById(`report-${firstInvalidField}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 0)
      return
    }

    setErrors({})
    const workflowReports = getWorkflowReports()
    const nextReportNumber =
      Math.max(
        0,
        ...workflowReports.map((report) => {
          const match = report.id.match(/^LT-2026-(\d{4})$/)
          return match ? Number(match[1]) : 0
        }),
      ) + 1
    const reportId = `LT-2026-${String(nextReportNumber).padStart(4, "0")}`
    const attachmentDetails = files.map((file) => {
      const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE"
      return {
        name: file.name,
        type: extension,
        size: `${Math.max(1, Math.ceil(file.size / 1024))} KB`,
      }
    })
    const newReport: WorkflowReport = {
      id: reportId,
      title: String(data.get("title")),
      category: String(data.get("category")),
      course: `${String(data.get("courseCode"))} · ${String(data.get("courseName"))}`,
      className: String(data.get("className")),
      tutor: String(data.get("tutor")),
      submitted: "20 September 2026",
      status: "Diterima",
      courseType: String(data.get("courseType")),
      duration: String(data.get("duration")),
      description: String(data.get("description")),
      attachments: attachmentDetails,
      updates: [
        {
          time: "20 September 2026, 09:00",
          title: "Laporan diterima",
          text: "Laporan berhasil diterima oleh sistem Lapor Tuton.",
        },
      ],
    }
    saveWorkflowReports([...workflowReports, newReport])
    setSubmittedReportId(reportId)
    submissionPending.current = true
    setIsSubmitting(true)
    window.setTimeout(() => {
      submissionPending.current = false
      setIsSubmitting(false)
      setSubmissionComplete(true)
    }, 500)
  }
  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / PENGAJUAN BARU
        </p>
        <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
          Buat Laporan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52657A]">
          Sampaikan masalah yang Anda alami terkait aktivitas tutor atau layanan
          selama Tutorial Online (Tuton).
        </p>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="mt-5 border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
        >
          Panduan Pengisian
        </button>
      </header>
      <form
        className="mt-8 space-y-8"
        noValidate
        onSubmit={submitReport}
      >
        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="info-laporan"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              01 / DATA LAPORAN
            </p>
            <h2
              id="info-laporan"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Informasi Laporan
            </h2>
          </div>
          <div className="space-y-6 p-6 max-[620px]:p-5">
            <Field
              label="Kategori Permasalahan"
              error={errors.category}
            >
              <select
                id="report-category"
                name="category"
                defaultValue=""
                onChange={() => clearError("category")}
                aria-invalid={Boolean(errors.category)}
                className={inputClass("category")}
              >
                <option value="" disabled>
                  Pilih kategori permasalahan
                </option>
                <option>Aktivitas tutor</option>
                <option>Layanan tutor</option>
                <option>Materi Tutorial Online</option>
              </select>
            </Field>
            <Field label="Jenis Mata Kuliah" error={errors.courseType}>
              <select
                id="report-courseType"
                name="courseType"
                defaultValue=""
                onChange={() => clearError("courseType")}
                aria-invalid={Boolean(errors.courseType)}
                className={inputClass("courseType")}
              >
                <option value="" disabled>
                  Pilih jenis mata kuliah
                </option>
                <option>Teori/Umum</option>
                <option>Berpraktik</option>
                <option>Praktik</option>
                <option>TAPS</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-6 max-[760px]:grid-cols-1">
              <Field label="Kode Mata Kuliah" error={errors.courseCode}>
                <input
                  id="report-courseCode"
                  name="courseCode"
                  onChange={() => clearError("courseCode")}
                  aria-invalid={Boolean(errors.courseCode)}
                  className={inputClass("courseCode")}
                  placeholder="Contoh: EKMA4111"
                />
              </Field>
              <Field label="Nama Mata Kuliah" error={errors.courseName}>
                <input
                  id="report-courseName"
                  name="courseName"
                  onChange={() => clearError("courseName")}
                  aria-invalid={Boolean(errors.courseName)}
                  className={inputClass("courseName")}
                  placeholder="Masukkan nama mata kuliah"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6 max-[760px]:grid-cols-1">
              <Field label="Kelas Mata Kuliah" error={errors.className}>
                <input
                  id="report-className"
                  name="className"
                  type="number"
                  inputMode="numeric"
                  onChange={() => clearError("className")}
                  aria-invalid={Boolean(errors.className)}
                  className={inputClass("className")}
                  placeholder="Contoh: 01"
                />
              </Field>
              <Field label="Nama Tutor" error={errors.tutor}>
                <input
                  id="report-tutor"
                  name="tutor"
                  onChange={() => clearError("tutor")}
                  aria-invalid={Boolean(errors.tutor)}
                  className={inputClass("tutor")}
                  placeholder="Masukkan nama tutor"
                />
              </Field>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-[#12355B]">
                Perkiraan Durasi Tidak Ada Aktivitas/Respons{" "}
                <span className="text-[#005BAC]">*</span>
              </span>
              <select
                id="report-duration"
                name="duration"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value)
                  clearError("duration")
                }}
                aria-invalid={Boolean(errors.duration)}
                className={inputClass("duration")}
              >
                <option value="">Pilih perkiraan durasi</option>
                <option>Kurang dari 3 hari</option>
                <option>3–6 hari</option>
                <option>1 minggu atau lebih</option>
                <option>Tidak pernah aktif sama sekali</option>
                <option>Lainnya</option>
              </select>
              {duration === "Lainnya" && (
                <input
                  className={control}
                  placeholder="Jelaskan perkiraan durasi"
                />
              )}
              {errors.duration && (
                <span className="mt-2 block text-xs leading-5 text-[#B42318]">
                  {errors.duration}
                </span>
              )}
            </label>
            <Field
              label="Judul Laporan"
              hint="Tuliskan ringkasan singkat mengenai masalah yang Anda laporkan."
              error={errors.title}
            >
              <input
                id="report-title"
                name="title"
                onChange={() => clearError("title")}
                aria-invalid={Boolean(errors.title)}
                className={inputClass("title")}
                placeholder="Contoh: Tidak ada umpan balik pada diskusi minggu ke-3"
              />
            </Field>
            <Field
              label="Uraian Permasalahan"
              hint="Jelaskan masalah secara jelas berdasarkan pengalaman yang Anda alami selama Tutorial Online."
              error={errors.description}
            >
              <textarea
                id="report-description"
                name="description"
                rows={7}
                onChange={() => clearError("description")}
                aria-invalid={Boolean(errors.description)}
                className={`${inputClass("description")} resize-y`}
                placeholder="Tuliskan uraian permasalahan Anda"
              />
            </Field>
          </div>
        </section>
        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="bukti-pendukung"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              02 / LAMPIRAN
            </p>
            <h2
              id="bukti-pendukung"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Bukti Pendukung
            </h2>
          </div>
          <div className="p-6 max-[620px]:p-5">
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={addFiles}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full flex-col items-center justify-center border border-dashed border-[#8CAEC9] bg-[#F7F9FC] px-5 py-8 text-center transition hover:border-[#005BAC] hover:bg-[#EEF5FB]"
            >
              <span className="flex h-10 w-10 items-center justify-center border border-[#005BAC] text-xl text-[#005BAC]">
                ↑
              </span>
              <span className="mt-3 text-sm font-semibold text-[#12355B]">
                Unggah bukti pendukung
              </span>
              <span className="mt-1 hidden text-xs text-[#52657A] sm:block">
                Maksimal 5 file · Maksimal 10 MB per file · .jpg, .jpeg, .png,
                .pdf
              </span>
              <span className="mt-2 flex flex-col gap-1 text-xs text-[#52657A] sm:hidden">
                <span>Maksimal 5 file</span>
                <span>Maksimal 10 MB per file</span>
                <span>Format: JPG, JPEG, PNG, PDF</span>
              </span>
            </button>
            {files.length > 0 && (
              <ul className="mt-5 divide-y divide-[#D9E2EC] border-y border-[#D9E2EC]">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-4 px-3 py-3"
                  >
                    <span className="min-w-0 truncate text-sm text-[#1F2937]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC]"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <div className="flex justify-end gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || submissionComplete}
            className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004784] focus:outline-2 focus:outline-offset-2 focus:outline-[#005BAC] disabled:cursor-not-allowed disabled:bg-[#7D8B99]"
          >
            {isSubmitting
              ? "Mengirim Laporan..."
              : submissionComplete
                ? "Laporan Terkirim"
                : "Kirim Laporan"}
          </button>
        </div>
      </form>
      {submissionComplete && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-success-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              LAPORAN BERHASIL DIBUAT
            </p>
            <h2
              id="submission-success-title"
              className="mt-3 font-slab text-2xl text-[#12355B]"
            >
              Laporan Berhasil Dikirim
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Laporan Anda telah dicatat pada prototype Lapor Tuton dan siap
              untuk ditindaklanjuti.
            </p>
            <p className="mt-5 border border-[#B8D3E8] bg-[#EEF5FB] px-4 py-3 font-mono text-sm font-semibold text-[#005BAC]">
              ID LAPORAN: {submittedReportId}
            </p>
            <p className="mt-4 text-xs leading-5 text-[#52657A]">
              Konfirmasi ini menggunakan data mock untuk prototype dan tidak
              mengirim laporan ke sistem produksi.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => setSubmissionComplete(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/riwayat-laporan/detail-laporan?report=${submittedReportId}`,
                  )
                }
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Lihat Laporan
              </button>
            </div>
          </div>
        </div>
      )}
      {guideOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-4 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filling-guide-title"
        >
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden border-2 border-[#12355B] bg-white shadow-[8px_8px_0_#12355B] sm:max-h-[calc(100dvh-2.5rem)]">
            <div className="shrink-0 border-b border-[#D9E2EC] bg-[#EEF5FB] px-5 py-5 sm:px-7">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                PANDUAN PENGISIAN
              </p>
              <h2
                id="filling-guide-title"
                className="mt-2 font-slab text-2xl text-[#12355B] sm:text-[28px]"
              >
                Panduan Pengisian Laporan
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52657A]">
                Gunakan panduan ini untuk mengisi laporan sesuai kondisi yang
                Anda alami selama Tutorial Online (Tuton).
              </p>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
              <div className="space-y-7 text-[15px] leading-7 text-[#1F2937] sm:text-base">
                <section aria-labelledby="guide-category">
                  <GuideHeading
                    number="01"
                    id="guide-category"
                    title="Kategori Permasalahan"
                  />
                  <p className="mt-3">
                    Pilih kategori yang paling mendekati masalah yang benar-benar
                    Anda alami.
                  </p>
                  <ul className="mt-3 space-y-2 border-l-2 border-[#B8D3E8] pl-4">
                    <li>
                      <strong>Aktivitas tutor</strong> mencakup kegiatan tutor
                      dalam Tuton, misalnya tanggapan pada forum atau umpan
                      balik pembelajaran.
                    </li>
                    <li>
                      <strong>Layanan tutor</strong> mencakup layanan atau
                      respons tutor yang berkaitan dengan kelas Anda.
                    </li>
                    <li>
                      <strong>Materi Tutorial Online</strong> mencakup kendala
                      pada materi yang tersedia di Tuton.
                    </li>
                  </ul>
                </section>

                <section aria-labelledby="guide-course-type">
                  <GuideHeading
                    number="02"
                    id="guide-course-type"
                    title="Jenis Mata Kuliah"
                  />
                  <p className="mt-3">
                    Pilih jenis mata kuliah yang sesuai dengan informasi mata
                    kuliah Anda: <strong>Teori/Umum</strong>,{" "}
                    <strong>Berpraktik</strong>, <strong>Praktik</strong>, atau{" "}
                    <strong>TAPS</strong>. Jika ragu, periksa informasi yang
                    tersedia di Tuton atau informasi akademik mata kuliah Anda.
                  </p>
                </section>

                <section aria-labelledby="guide-course-identity">
                  <GuideHeading
                    number="03"
                    id="guide-course-identity"
                    title="Kode Mata Kuliah dan Nama Mata Kuliah"
                  />
                  <p className="mt-3">
                    Isi kode dan nama mata kuliah yang sama dengan mata kuliah
                    tempat masalah terjadi. Rujuk informasi mata kuliah resmi
                    yang tersedia untuk Anda; jangan menebak kode atau nama mata
                    kuliah.
                  </p>
                </section>

                <section aria-labelledby="guide-class">
                  <GuideHeading
                    number="04"
                    id="guide-class"
                    title="Kelas Mata Kuliah"
                  />
                  <p className="mt-3">
                    Masukkan kelas yang benar-benar Anda ikuti berdasarkan
                    informasi yang ditampilkan di Tuton. Contohnya, masukkan
                    “01” hanya jika itu adalah kelas Anda.
                  </p>
                </section>

                <section aria-labelledby="guide-tutor">
                  <GuideHeading number="05" id="guide-tutor" title="Nama Tutor" />
                  <p className="mt-3">
                    Isi nama tutor yang bertanggung jawab atas mata kuliah atau
                    kelas yang Anda laporkan. Jangan memasukkan nama Anda sendiri
                    pada kolom ini.
                  </p>
                </section>

                <section aria-labelledby="guide-duration">
                  <GuideHeading
                    number="06"
                    id="guide-duration"
                    title="Perkiraan Durasi Tidak Ada Aktivitas/Respons"
                  />
                  <p className="mt-3">
                    Perkirakan berapa lama tutor tidak aktif atau belum memberi
                    respons berdasarkan pengalaman Anda. Pilih opsi yang paling
                    sesuai pada daftar yang tersedia. Anda tidak perlu
                    menyebutkan durasi tepat apabila tidak mengetahuinya.
                  </p>
                </section>

                <section aria-labelledby="guide-title">
                  <GuideHeading number="07" id="guide-title" title="Judul Laporan" />
                  <p className="mt-3">
                    Buat judul yang singkat, spesifik, dan langsung menjelaskan
                    masalah. Contohnya:
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    <li>“Belum ada tanggapan pada forum inisiasi”</li>
                    <li>“Umpan balik tugas belum tersedia”</li>
                    <li>“Materi Tutorial Online tidak dapat diakses”</li>
                  </ul>
                </section>

                <section aria-labelledby="guide-description">
                  <GuideHeading
                    number="08"
                    id="guide-description"
                    title="Uraian Permasalahan"
                  />
                  <p className="mt-3">
                    Jelaskan masalah dengan bahasa yang jelas. Sertakan apa yang
                    terjadi, mata kuliah atau aktivitas Tuton yang terdampak,
                    kapan atau berapa lama masalah terjadi jika diketahui,
                    dampaknya pada kegiatan belajar Anda, serta langkah yang
                    sudah dilakukan apabila ada.
                  </p>
                  <div className="mt-4 border border-[#B8D3E8] bg-[#EEF5FB] px-4 py-4">
                    <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#005BAC]">
                      CONTOH URAIAN
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-[#12355B] sm:text-base">
                      “Pada mata kuliah yang saya ikuti, belum terdapat
                      tanggapan dari tutor pada forum diskusi setelah saya
                      menunggu selama beberapa hari. Kondisi tersebut membuat
                      saya belum memperoleh umpan balik untuk melanjutkan
                      diskusi.”
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#52657A]">
                    Contoh ini hanya sebagai panduan. Sesuaikan uraian dengan
                    keadaan Anda yang sebenarnya; jangan membuat fakta atau
                    memasukkan informasi yang tidak dapat Anda pastikan.
                  </p>
                </section>

                <section aria-labelledby="guide-evidence">
                  <GuideHeading
                    number="09"
                    id="guide-evidence"
                    title="Bukti Pendukung"
                  />
                  <p className="mt-3">
                    Jika tersedia, lampirkan tangkapan layar atau dokumen yang
                    relevan dengan masalah yang dilaporkan. Pastikan bukti
                    berkaitan dengan laporan dan tidak membuka informasi pribadi
                    lain yang tidak diperlukan.
                  </p>
                  <ul className="mt-3 grid gap-2 border border-[#D9E2EC] bg-[#F7F9FC] p-4 text-sm leading-6 sm:grid-cols-3">
                    <li>
                      <strong>Maksimal:</strong> 5 file
                    </li>
                    <li>
                      <strong>Ukuran:</strong> 10 MB per file
                    </li>
                    <li>
                      <strong>Format:</strong> JPG, JPEG, PNG, dan PDF
                    </li>
                  </ul>
                </section>

                <section aria-labelledby="guide-review">
                  <GuideHeading
                    number="10"
                    id="guide-review"
                    title="Pemeriksaan Sebelum Mengirim"
                  />
                  <p className="mt-3">
                    Sebelum mengirim, periksa kembali hal-hal berikut:
                  </p>
                  <ul className="mt-3 space-y-2 border-l-2 border-[#005BAC] pl-4">
                    <li>Kategori permasalahan sudah sesuai.</li>
                    <li>
                      Jenis dan identitas mata kuliah, kelas, serta tutor sudah
                      benar.
                    </li>
                    <li>
                      Judul dan uraian menjelaskan permasalahan dengan jelas.
                    </li>
                    <li>
                      Bukti pendukung sudah dilampirkan apabila tersedia dan
                      relevan.
                    </li>
                    <li>Seluruh informasi sudah diperiksa kembali.</li>
                  </ul>
                  <p className="mt-4">
                    Setelah laporan dikirim, baca konfirmasi pengiriman dan
                    simpan ID laporan Anda. ID tersebut dapat digunakan untuk
                    memantau perkembangan laporan melalui Dashboard, Riwayat
                    Laporan, atau Detail Laporan.
                  </p>
                </section>
              </div>
            </div>
            <div className="flex shrink-0 justify-end border-t border-[#D9E2EC] bg-white px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ReadOnlyItem({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div
      className={`${
        wide ? "col-span-2 max-[760px]:col-span-1" : ""
      } border-b border-[#D9E2EC] py-4`}
    >
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">
        {value}
      </p>
    </div>
  )
}

export function DetailReportScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedReportId = new URLSearchParams(location.search).get("report")
  const report =
    getStudentHistoryReports().find((item) => item.id === selectedReportId) ??
    historyReports[0]
  const [courseCode, courseName] = report.course.split(" · ")
  const administratorReport = getWorkflowReports().find(
    (item) => item.id === report.id,
  )
  const currentStage = {
    Diterima: 0,
    "Perlu Verifikasi": 0,
    Diverifikasi: 1,
    "Menunggu Validasi": 2,
    "Sedang Diproses": 3,
    Selesai: 4,
  }[report.status]
  const statusUpdateTitles: Record<string, string[]> = {
    Diterima: ["Laporan diterima"],
    Diverifikasi: ["Laporan diverifikasi"],
    "Menunggu Validasi": [
      "Validasi disiapkan",
      "Data laporan dikirim ke Fakultas/Unit terkait",
    ],
    "Sedang Diproses": [
      "Laporan memasuki proses tindak lanjut",
      "Laporan diproses",
    ],
    Selesai: ["Laporan selesai"],
  }
  const timelineTime = (label: string, index: number) => {
    const update = administratorReport?.updates.find((item) =>
      statusUpdateTitles[label]?.includes(item.title),
    )
    if (update) return update.time
    if (index > currentStage) return "Menunggu pembaruan"
    return "Belum ada catatan waktu"
  }
  const detailStatusStages = statusStages.map((stage, index) => ({
    ...stage,
    time: timelineTime(stage.label, index),
    state:
      index < currentStage
        ? "done"
        : index === currentStage
          ? "current"
          : "upcoming",
  }))
  const detailReportInformation = [
    [
      "Kategori Permasalahan",
      report.category ?? "Tutor tidak memberikan umpan balik",
    ],
    ["Jenis Mata Kuliah", report.courseType ?? "Teori/Umum"],
    ["Kode Mata Kuliah", courseCode],
    ["Nama Mata Kuliah", courseName],
    ["Kelas Mata Kuliah", report.className],
    ["Nama Tutor", report.tutor],
    [
      "Perkiraan Durasi Tidak Ada Aktivitas/Respons",
      report.duration ?? "1 minggu atau lebih",
    ],
    ["Judul Laporan", report.title],
  ]
  const detailFollowUps =
    administratorReport?.updates ?? followUps
  const detailAttachments = report.attachments ?? [
        { name: "tangkapan-layar-diskusi-minggu-3.png", type: "PNG" },
        { name: "riwayat-aktivitas-tuton.pdf", type: "PDF" },
      ]
  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / DETAIL LAPORAN
        </p>
        <div className="mt-3 flex items-start justify-between gap-6 max-[620px]:block">
          <div>
            <h1 className="font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Detail Laporan
            </h1>
            <p className="mt-2 font-mono text-xs font-semibold tracking-[0.08em] text-[#005BAC]">
              ID LAPORAN: {report.id}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] max-[620px]:mt-5 ${statusBadge(report.status)}`}
          >
            {report.status.toUpperCase()}
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
            <ol className="hidden grid-cols-5 md:grid">
              {detailStatusStages.map((stage, index) => (
                <li key={stage.label} className="relative pr-4 last:pr-0">
                  <div
                    className={`absolute left-3 right-0 top-3 h-px ${
                      index === detailStatusStages.length - 1
                        ? "hidden"
                        : stage.state === "upcoming"
                          ? "bg-[#D9E2EC]"
                          : "bg-[#005BAC]"
                    }`}
                  />
                  <span
                    className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${
                      stage.state === "done"
                        ? "border-[#005BAC] bg-[#005BAC] text-white"
                        : stage.state === "current"
                          ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
                          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
                    }`}
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
                  <p className="mt-1 max-w-[130px] text-xs leading-5 text-[#52657A]">
                    {stage.time}
                  </p>
                </li>
              ))}
            </ol>
            <ol className="space-y-0 md:hidden">
              {detailStatusStages.map((stage, index) => (
                <li
                  key={stage.label}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div
                    className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                      index === detailStatusStages.length - 1
                        ? "hidden"
                        : stage.state === "upcoming"
                          ? "bg-[#D9E2EC]"
                          : "bg-[#005BAC]"
                    }`}
                  />
                  <span
                    className={`relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${
                      stage.state === "done"
                        ? "border-[#005BAC] bg-[#005BAC] text-white"
                        : stage.state === "current"
                          ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
                          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
                    }`}
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
                    <p className="mt-1 text-xs text-[#52657A]">{stage.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="informasi-laporan"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              02 / DATA PENGAJUAN
            </p>
            <h2
              id="informasi-laporan"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Informasi Laporan
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1 max-[620px]:px-5">
            {detailReportInformation.map(([label, value]) => (
              <ReadOnlyItem
                key={label}
                label={label}
                value={value}
                wide={
                  label === "Perkiraan Durasi Tidak Ada Aktivitas/Respons" ||
                  label === "Judul Laporan"
                }
              />
            ))}
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="uraian"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              03 / PENJELASAN MAHASISWA
            </p>
            <h2 id="uraian" className="mt-1 font-slab text-2xl text-[#12355B]">
              Uraian Permasalahan
            </h2>
          </div>
          <div className="p-6 max-[620px]:p-5">
            <p className="max-w-3xl text-sm leading-7 text-[#1F2937]">
              {report.description ??
                "Pada kegiatan diskusi minggu ke-3, saya telah mengirimkan tanggapan sesuai topik yang ditugaskan. Namun, hingga lebih dari satu minggu belum ada umpan balik maupun penilaian dari tutor. Saya berharap ada informasi terkait kelanjutan aktivitas diskusi tersebut."}
            </p>
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="bukti"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              04 / LAMPIRAN
            </p>
            <h2 id="bukti" className="mt-1 font-slab text-2xl text-[#12355B]">
              Bukti Pendukung
            </h2>
          </div>
          {detailAttachments.length > 0 ? (
            <ul className="divide-y divide-[#D9E2EC]">
              {detailAttachments.map(({ name, type }) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:items-start max-[620px]:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-mono text-[10px] font-semibold text-[#005BAC]">
                      {type}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-[#1F2937]">
                      {name}
                    </span>
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
          ) : (
            <p className="px-6 py-5 text-sm text-[#52657A] max-[620px]:px-5">
              Tidak ada bukti pendukung yang dilampirkan.
            </p>
          )}
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="tindak-lanjut"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              05 / PEMBARUAN PENGELOLA
            </p>
            <h2
              id="tindak-lanjut"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Tindak Lanjut
            </h2>
          </div>
          <ol className="p-6 max-[620px]:p-5">
            {detailFollowUps.map((update, index) => (
              <li
                key={update.time}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                <div
                  className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                    index === detailFollowUps.length - 1
                      ? "hidden"
                      : "bg-[#B8D3E8]"
                  }`}
                />
                <span className="relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] bg-white text-[10px] text-[#005BAC]">
                  ●
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                    {update.time}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#12355B]">
                    {update.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#52657A]">
                    {update.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="mt-8 border-t border-[#D9E2EC] pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
        >
          ← Kembali ke Riwayat Laporan
        </button>
      </div>
    </section>
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

const workflowStatusClass = (status: WorkflowStatus) =>
  status === "Selesai"
    ? "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
    : status === "Diproses" || status === "Diterima"
      ? "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
      : "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"

function AdminWorkflowShell({
  activeIndex,
  children,
}: {
  activeIndex: number
  children: ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

function WorkflowDetailLink({
  report,
  context,
  className,
  children,
}: {
  report: WorkflowReport
  context: "queue" | "history"
  className: string
  children: ReactNode
}) {
  return (
    <Link
      to="/detail-laporan"
      onClick={() => {
        window.sessionStorage.setItem("adminDetailContext", context)
        window.sessionStorage.setItem("adminDetailId", report.id)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}

const reportGroup = (report: WorkflowReport) => {
  if (report.course.startsWith("AKUN")) {
    return {
      faculty: "Fakultas Ekonomi dan Bisnis",
      programStudy: "Akuntansi",
    }
  }
  if (report.course.startsWith("ESPA")) {
    return {
      faculty: "Fakultas Ekonomi dan Bisnis",
      programStudy: "Ekonomi Pembangunan",
    }
  }
  if (report.course.startsWith("ADBI")) {
    return {
      faculty: "Fakultas Ilmu Sosial dan Ilmu Politik",
      programStudy: "Administrasi Bisnis",
    }
  }
  return {
    faculty: "Fakultas Ekonomi dan Bisnis",
    programStudy: report.course.startsWith("PAJA")
      ? "Akuntansi Keuangan Publik"
      : "Manajemen",
  }
}

const exportFilePart = (value: string) => value.replace(/[^A-Za-z0-9]+/g, "_")

function WorkflowTable({
  reports,
  context,
  selectable = false,
  selectedIds = [],
  onToggle,
  showProgramStudy = false,
}: {
  reports: WorkflowReport[]
  context: "queue" | "history"
  selectable?: boolean
  selectedIds?: string[]
  onToggle?: (id: string) => void
  showProgramStudy?: boolean
}) {
  const gridColumns = showProgramStudy
    ? "grid-cols-[105px_135px_135px_minmax(0,1fr)_52px_155px_120px_130px_100px]"
    : selectable
      ? "grid-cols-[28px_105px_135px_minmax(0,1fr)_52px_155px_120px_130px_100px]"
      : "grid-cols-[105px_135px_minmax(0,1fr)_52px_155px_120px_130px_100px]"
  return (
    <>
      <div
        className={`hidden ${gridColumns} gap-3 border-b border-[#D9E2EC] px-4 py-3 font-mono text-[9px] tracking-[0.09em] text-[#52657A] xl:grid`}
      >
        {selectable && <span aria-hidden="true" />}
        <span>ID LAPORAN</span>
        <span>KATEGORI</span>
        {showProgramStudy && <span>PROGRAM STUDI</span>}
        <span>MATA KULIAH</span>
        <span>KELAS</span>
        <span>{context === "queue" ? "TUTOR" : "TUTOR"}</span>
        <span>TGL PENGAJUAN</span>
        <span>STATUS</span>
        <span>AKSI</span>
      </div>
      <div className="divide-y divide-[#D9E2EC] border-b border-[#D9E2EC]">
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
                  disabled={report.status !== "Diverifikasi"}
                  aria-label={`Pilih laporan ${report.id}`}
                  className="h-4 w-4 accent-[#005BAC] disabled:cursor-not-allowed disabled:opacity-40"
                />
              )}
              <p className="font-mono text-xs font-semibold text-[#005BAC]">
                {report.id}
              </p>
              <p className="text-sm">{report.category}</p>
              {showProgramStudy && (
                <p className="text-sm">{reportGroup(report).programStudy}</p>
              )}
              <p className="text-sm font-medium">{report.course}</p>
              <p className="text-sm">{report.className}</p>
              <p className="text-sm">{report.tutor}</p>
              <p className="text-sm">{report.submitted}</p>
              <span
                className={`inline-flex w-fit border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${workflowStatusClass(report.status)}`}
              >
                {context === "queue" && report.status === "Diproses"
                  ? "Sedang Diproses"
                  : report.status}
              </span>
              <WorkflowDetailLink
                report={report}
                context={context}
                className="border-b border-[#005BAC] pb-1 text-left text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
              >
                {report.status === "Diterima" ? "Verifikasi" : "Lihat Detail"}
              </WorkflowDetailLink>
            </article>
            <article
              key={`${report.id}-mobile`}
              className="hidden px-4 py-5 max-xl:block"
            >
              <div className="flex items-start justify-between gap-4">
                <label className="flex items-center gap-3">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(report.id)}
                      onChange={() => onToggle?.(report.id)}
                      disabled={report.status !== "Diverifikasi"}
                      aria-label={`Pilih laporan ${report.id}`}
                      className="h-4 w-4 accent-[#005BAC] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  )}
                  <p className="font-mono text-xs font-semibold text-[#005BAC]">
                    {report.id}
                  </p>
                </label>
                <span
                  className={`inline-flex shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${workflowStatusClass(report.status)}`}
                >
                  {context === "queue" && report.status === "Diproses"
                    ? "Sedang Diproses"
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
                {showProgramStudy && (
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      PROGRAM STUDI
                    </dt>
                    <dd className="mt-1 text-sm">
                      {reportGroup(report).programStudy}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                    MATA KULIAH
                  </dt>
                  <dd className="mt-1 text-sm">{report.course}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                    KELAS
                  </dt>
                  <dd className="mt-1 text-sm">{report.className}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                    {context === "queue" ? "TUTOR" : "TUTOR"}
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
                {report.status === "Diterima" ? "Verifikasi" : "Lihat Detail"}
              </WorkflowDetailLink>
            </article>
          </div>
        ))}
      </div>
    </>
  )
}

export function AdminWorkflowQueueScreen() {
  const [status, setStatus] = useState("Semua")
  const [query, setQuery] = useState("")
  const [faculty, setFaculty] = useState("Semua")
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const allReports = getWorkflowReports()
  const faculties = Array.from(
    new Set(allReports.map((report) => reportGroup(report).faculty)),
  )
  const reports = allReports.filter((report) => {
    const group = reportGroup(report)
    return (
      report.status !== "Selesai" &&
      (status === "Semua" || report.status === status) &&
      (faculty === "Semua" || group.faculty === faculty) &&
      `${report.id} ${report.title}`.toLowerCase().includes(query.toLowerCase())
    )
  })
  const exportReports = allReports.filter(
    (report) =>
      faculty !== "Semua" &&
      report.status === "Diverifikasi" &&
      reportGroup(report).faculty === faculty,
  )
  const includedPrograms = Array.from(
    new Set(exportReports.map((report) => reportGroup(report).programStudy)),
  )
  const exportFaculty = faculty
  const exportProgram =
    includedPrograms.length > 1
      ? "Beberapa Program Studi"
      : (includedPrograms[0] ?? "—")
  const fileName = `Data_Laporan_Tutor_${exportFilePart(exportFaculty)}_2026.csv`
  const downloadExport = () => {
    const headers = [
      "ID Laporan",
      "Kategori",
      "Program Studi",
      "Fakultas",
      "Jenis Mata Kuliah",
      "Kode Mata Kuliah",
      "Nama Mata Kuliah",
      "Kelas Mata Kuliah",
      "Nama Tutor",
      "Perkiraan Durasi Tidak Ada Aktivitas/Respons",
      "Judul Laporan",
      "Tanggal Laporan",
      "Status",
    ]
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows = exportReports.map((report) => {
      const [courseCode, courseName] = report.course.split(" · ")
      const group = reportGroup(report)
      return [
        report.id,
        report.category,
        group.programStudy,
        group.faculty,
        report.courseType ?? "Teori/Umum",
        courseCode,
        courseName,
        report.className,
        report.tutor,
        report.duration ?? "1 minggu atau lebih",
        report.title,
        report.submitted,
        report.status,
      ]
    })
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n")
    const downloadUrl = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    )
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
  }
  const confirmSend = () => {
    const selected = new Set(exportReports.map((report) => report.id))
    const updated = allReports.map((report) =>
      selected.has(report.id)
        ? {
            ...report,
            status: "Menunggu Validasi" as WorkflowStatus,
            updates: [
              ...report.updates,
              {
                time: "17 September 2026, 17:10",
                title: "Data laporan dikirim ke Fakultas/Unit terkait",
                text: "Data laporan telah dikirim oleh Administrator melalui kanal eksternal untuk proses validasi.",
              },
            ],
          }
        : report,
    )
    saveWorkflowReports(updated)
    setExportReady(false)
    setSendModalOpen(false)
  }
  return (
    <AdminWorkflowShell activeIndex={1}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / ANTREAN LAPORAN
          </p>
          <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
            Antrean Laporan
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Kelola dan tindak lanjuti laporan permasalahan terkait aktivitas dan
            layanan tutor.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              STATUS LAPORAN
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
            >
              <option>Semua</option>
              <option>Diterima</option>
              <option>Diverifikasi</option>
              <option value="Diproses">Sedang Diproses</option>
              <option>Menunggu Validasi</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              FAKULTAS
            </span>
            <select
              value={faculty}
              onChange={(event) => setFaculty(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
            >
              <option>Semua</option>
              {faculties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              CARI LAPORAN
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
              placeholder="Cari ID atau judul laporan"
            />
          </label>
        </div>
        <section className="mt-8">
          <div className="flex items-end justify-between gap-5 border-b-2 border-[#12355B] pb-3 max-[620px]:items-start max-[620px]:flex-col">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                DAFTAR LAPORAN MASUK
              </p>
              <h2 className="mt-2 font-slab text-2xl text-[#12355B]">
                Antrean Laporan
              </h2>
            </div>
            <div className="flex items-center gap-4 max-[620px]:w-full max-[620px]:justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(reports.length).padStart(2, "0")} LAPORAN
              </span>
              <button
                onClick={() => setExportModalOpen(true)}
                disabled={faculty === "Semua" || !exportReports.length}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
              >
                Export Data Laporan
              </button>
            </div>
          </div>
          <WorkflowTable reports={reports} context="queue" showProgramStudy />
          {reports.length === 0 && (
            <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
              <p className="font-slab text-xl text-[#12355B]">
                Belum ada laporan pada status ini.
              </p>
            </div>
          )}
        </section>
      </section>
      {exportReady && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              EXPORT BERHASIL
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">
              Data Siap Dikirim
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Data laporan berhasil diekspor dan siap dikirim melalui kanal
              eksternal.
            </p>
            <p className="mt-4 border border-[#D9E2EC] bg-[#F7F9FC] px-3 py-3 font-mono text-xs text-[#005BAC]">
              {fileName}
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setExportReady(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setExportReady(false)
                  setSendModalOpen(true)
                }}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Tandai Data Sudah Dikirim
              </button>
            </div>
          </div>
        </div>
      )}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              PERSIAPAN EXPORT
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">
              Export Data Laporan
            </h2>
            <dl className="mt-6 space-y-4 border-y border-[#D9E2EC] py-4 text-sm">
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  FAKULTAS TUJUAN
                </dt>
                <dd className="mt-1 font-medium">{exportFaculty}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  PROGRAM STUDI
                </dt>
                <dd className="mt-1 font-medium">{exportProgram}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  JUMLAH LAPORAN
                </dt>
                <dd className="mt-1 font-medium">
                  {exportReports.length} laporan
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  NAMA FILE
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-[#005BAC]">
                  {fileName}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-[#52657A]">
              Data yang diekspor mencakup seluruh laporan berstatus Diverifikasi
              dari Fakultas yang dipilih, termasuk laporan dari berbagai Program
              Studi.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setExportModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  downloadExport()
                  setExportModalOpen(false)
                  setExportReady(true)
                }}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Export Data Laporan
              </button>
            </div>
          </div>
        </div>
      )}
      {sendModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI PENGIRIMAN
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">
              Konfirmasi Pengiriman Data
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Pastikan data laporan telah dikirim kepada Fakultas/Unit terkait
              melalui kanal eksternal sebelum melanjutkan.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setSendModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={confirmSend}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Konfirmasi Pengiriman
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminWorkflowShell>
  )
}

export function AdminWorkflowHistoryScreen() {
  const [status, setStatus] = useState("Semua")
  const [query, setQuery] = useState("")
  const reports = getWorkflowReports().filter(
    (report) =>
      report.status === "Selesai" &&
      (status === "Semua" || report.status === status) &&
      `${report.id} ${report.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  return (
    <AdminWorkflowShell activeIndex={2}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / RIWAYAT LAPORAN
          </p>
          <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
            Riwayat Laporan
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Arsip laporan yang telah diselesaikan.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-[220px_minmax(0,1fr)] gap-4 max-[700px]:grid-cols-1">
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              STATUS LAPORAN
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
            >
              <option>Semua</option>
              <option>Selesai</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              CARI LAPORAN
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
              placeholder="Cari ID atau judul laporan"
            />
          </label>
        </div>
        <section className="mt-8">
          <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                DAFTAR RIWAYAT LAPORAN
              </p>
              <h2 className="mt-2 font-slab text-2xl text-[#12355B]">
                Riwayat Laporan
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
              {String(reports.length).padStart(2, "0")} LAPORAN
            </span>
          </div>
          <WorkflowTable reports={reports} context="history" />
          {reports.length === 0 && (
            <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
              <p className="font-slab text-xl text-[#12355B]">
                Belum ada laporan selesai.
              </p>
            </div>
          )}
        </section>
      </section>
    </AdminWorkflowShell>
  )
}

export function AdminWorkflowDetailScreen() {
  const [modalOpen, setModalOpen] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationResult, setValidationResult] = useState("")
  const [validationNote, setValidationNote] = useState("")
  const [validationError, setValidationError] = useState("")
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [completionResult, setCompletionResult] = useState("")
  const [completionError, setCompletionError] = useState("")
  const navigate = useNavigate()
  const context =
    window.sessionStorage.getItem("adminDetailContext") === "history"
      ? "history"
      : "queue"
  const id = window.sessionStorage.getItem("adminDetailId") ?? "LT-2026-0008"
  const [report, setReport] = useState(
    () =>
      getWorkflowReports().find((item) => item.id === id) ?? workflowSeed[0],
  )
  const nextStatus: Record<WorkflowStatus, WorkflowStatus | null> = {
    Diterima: "Diverifikasi",
    Diverifikasi: "Menunggu Validasi",
    "Menunggu Validasi": "Diproses",
    Diproses: "Selesai",
    Selesai: null,
  }
  const validationRecorded = report.updates.some(
    (update) => update.title === "Hasil validasi diterima dan dicatat",
  )
  const actionLabel =
    report.status === "Diterima"
      ? "Verifikasi Laporan"
      : report.status === "Diverifikasi"
        ? "Siapkan Validasi"
        : report.status === "Menunggu Validasi"
          ? validationRecorded
            ? "Perbarui Status"
            : "Catat Hasil Validasi"
          : report.status === "Selesai"
            ? null
            : "Perbarui Status"
  const stageState = (index: number) => {
    const level = [
      "Diterima",
      "Diverifikasi",
      "Menunggu Validasi",
      "Diproses",
      "Selesai",
    ].indexOf(report.status)
    return index === 0
      ? "done"
      : index === level
        ? level === 0
          ? "next"
          : "current"
        : index < level
          ? "done"
          : "upcoming"
  }
  const stageClass = (state: string) =>
    state === "done"
      ? "border-[#005BAC] bg-[#005BAC] text-white"
      : state === "current"
        ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
        : state === "next"
          ? "border-[#005BAC] bg-white text-[#005BAC]"
          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
  const advance = () => {
    const next = nextStatus[report.status]
    if (!next) return
    const title =
      next === "Diverifikasi"
        ? "Laporan diverifikasi"
        : next === "Menunggu Validasi"
          ? "Validasi disiapkan"
          : next === "Diproses" && report.status === "Menunggu Validasi"
            ? "Laporan memasuki proses tindak lanjut"
            : next === "Diproses"
              ? "Laporan diproses"
              : "Laporan selesai"
    const text =
      next === "Diverifikasi"
        ? "Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola."
        : next === "Menunggu Validasi"
          ? "Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait."
          : next === "Diproses" && report.status === "Menunggu Validasi"
            ? "Hasil validasi telah diterima dan dicatat. Laporan memasuki proses tindak lanjut."
            : next === "Diproses"
              ? "Laporan diteruskan kepada pengelola Tutorial Online untuk tindak lanjut."
              : "Tindak lanjut telah dilakukan dan laporan dinyatakan selesai."
    const time =
      next === "Diproses" && report.status === "Menunggu Validasi"
        ? "17 September 2026, 17:00"
        : "17 September 2026, 10:00"
    const updated = {
      ...report,
      status: next,
      updates: [...report.updates, { time, title, text }],
    }
    const all = getWorkflowReports().map((item) =>
      item.id === updated.id ? updated : item,
    )
    saveWorkflowReports(all)
    setReport(updated)
    setModalOpen(false)
  }
  const recordValidation = () => {
    const result = validationResult.trim()
    if (!result) {
      setValidationError("Hasil Validasi wajib diisi.")
      return
    }
    const note = validationNote.trim()
    const updated = {
      ...report,
      updates: [
        ...report.updates,
        {
          time: "17 September 2026, 16:45",
          title: "Hasil validasi diterima dan dicatat",
          text: `Hasil validasi dari Fakultas/Unit terkait telah diterima dan dicatat oleh Administrator. Hasil validasi: ${result}${
            note ? `. Catatan validasi: ${note}` : ""
          }`,
        },
      ],
    }
    const all = getWorkflowReports().map((item) =>
      item.id === updated.id ? updated : item,
    )
    saveWorkflowReports(all)
    setReport(updated)
    setValidationModalOpen(false)
    setValidationResult("")
    setValidationNote("")
    setValidationError("")
  }
  const completeReport = () => {
    const result = completionResult.trim()
    if (!result) {
      setCompletionError("Tindak Lanjut / Hasil Penanganan wajib diisi.")
      return
    }
    const updated = {
      ...report,
      status: "Selesai" as WorkflowStatus,
      updates: [
        ...report.updates,
        {
          time: "17 September 2026, 17:30",
          title: "Laporan selesai",
          text: `Laporan telah selesai ditangani. Tindak lanjut / hasil penanganan: ${result}`,
        },
      ],
    }
    const all = getWorkflowReports().map((item) =>
      item.id === updated.id ? updated : item,
    )
    saveWorkflowReports(all)
    setReport(updated)
    setCompletionModalOpen(false)
    setCompletionResult("")
    setCompletionError("")
  }
  const openPrimaryAction = () => {
    if (report.status === "Diproses") {
      setCompletionError("")
      setCompletionModalOpen(true)
      return
    }
    if (report.status === "Menunggu Validasi" && !validationRecorded) {
      setValidationError("")
      setValidationModalOpen(true)
      return
    }
    setModalOpen(true)
  }
  const [code, courseName = report.course] = report.course.split(" · ")
  const displayStatus = (status: WorkflowStatus) =>
    status === "Diproses" ? "Sedang Diproses" : status
  const labels = [
    "Diterima",
    "Diverifikasi",
    "Menunggu Validasi",
    "Sedang Diproses",
    "Selesai",
  ]
  const back =
    context === "history"
      ? "/administrator/riwayat-laporan"
      : "/administrator/antrean-laporan"
  return (
    <AdminWorkflowShell activeIndex={context === "history" ? 2 : 1}>
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
                ID LAPORAN: {report.id}
              </p>
            </div>
            <span
              className={`inline-flex border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] ${workflowStatusClass(report.status)} max-[620px]:mt-5`}
            >
              {displayStatus(report.status).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="mt-8 space-y-8">
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                01 / STATUS LAPORAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                Status Laporan
              </h2>
            </div>
            <div className="p-6">
              <ol className="hidden grid-cols-5 md:grid">
                {labels.map((label, index) => (
                  <li key={label} className="relative pr-4 last:pr-0">
                    <div
                      className={`absolute left-3 right-0 top-3 h-px ${
                        index === labels.length - 1
                          ? "hidden"
                          : stageState(index) === "done"
                            ? "bg-[#005BAC]"
                            : "bg-[#D9E2EC]"
                      }`}
                    />
                    <span
                      className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === "done" ? "✓" : index + 1}
                    </span>
                    <p className="mt-4 text-sm font-semibold text-[#12355B]">
                      {label}
                    </p>
                  </li>
                ))}
              </ol>
              <ol className="space-y-4 md:hidden">
                {labels.map((label, index) => (
                  <li key={label} className="flex items-center gap-4">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === "done" ? "✓" : index + 1}
                    </span>
                    <p className="text-sm font-semibold text-[#12355B]">
                      {label}
                    </p>
                  </li>
                ))}
              </ol>
              {actionLabel && (
                <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                  <div>
                    <p className="text-sm font-semibold text-[#12355B]">
                      Tindakan Administrator
                    </p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      {report.status === "Diterima"
                        ? "Periksa informasi dan bukti pendukung sebelum melakukan verifikasi."
                        : report.status === "Diverifikasi"
                          ? "Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait."
                          : report.status === "Menunggu Validasi"
                            ? validationRecorded
                              ? "Hasil validasi telah dicatat dan laporan siap diperbarui ke status Sedang Diproses."
                              : "Hasil validasi dari Fakultas/Unit terkait telah diterima dan siap dicatat."
                            : `Laporan siap diperbarui ke status ${displayStatus(nextStatus[report.status] ?? "Selesai")}.`}
                    </p>
                  </div>
                  <button
                    onClick={openPrimaryAction}
                    className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white max-[620px]:mt-4"
                  >
                    {actionLabel}
                  </button>
                </div>
              )}
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                02 / DATA PENGAJUAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                Informasi Laporan
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1">
              {[
                ["Kategori Permasalahan", report.category],
                ["Jenis Mata Kuliah", "Teori/Umum"],
                ["Kode Mata Kuliah", code],
                ["Nama Mata Kuliah", courseName],
                ["Kelas Mata Kuliah", report.className],
                ["Nama Tutor", report.tutor],
                [
                  "Perkiraan Durasi Tidak Ada Aktivitas/Respons",
                  "1 minggu atau lebih",
                ],
                ["Judul Laporan", report.title],
              ].map(([label, value]) => (
                <ReadOnlyItem
                  key={label}
                  label={label}
                  value={value}
                  wide={
                    label.includes("Perkiraan") || label === "Judul Laporan"
                  }
                />
              ))}
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                03 / PENJELASAN MAHASISWA
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                Uraian Permasalahan
              </h2>
            </div>
            <p className="p-6 text-sm leading-7">
              Mahasiswa melaporkan kendala terkait “{report.title}” pada mata
              kuliah {report.course} selama kegiatan Tutorial Online.
            </p>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                04 / LAMPIRAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                Bukti Pendukung
              </h2>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">bukti-pendukung-tuton.pdf</p>
                <p className="mt-1 font-mono text-[10px] text-[#52657A]">
                  PDF · 824 KB
                </p>
              </div>
              <button className="border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC]">
                Buka
              </button>
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                05 / PEMBARUAN PENGELOLA
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">
                Pembaruan Pengelola
              </h2>
            </div>
            <div className="space-y-5 p-6">
              {report.updates.length ? (
                report.updates.map((update) => (
                  <div
                    key={`${update.time}-${update.title}`}
                    className="flex gap-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] text-[10px] text-[#005BAC]">
                      ●
                    </span>
                    <div>
                      <p className="font-mono text-[10px] text-[#52657A]">
                        {update.time}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-[#12355B]">
                        {update.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#52657A]">
                        {update.text}
                      </p>
                    </div>
                  </div>
                ))
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
            onClick={() => navigate(back)}
            className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B]"
          >
            Kembali ke{" "}
            {context === "history" ? "Riwayat Laporan" : "Antrean Laporan"}
          </button>
          {actionLabel &&
            (report.status !== "Menunggu Validasi" || validationRecorded) && (
              <button
                onClick={openPrimaryAction}
                className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white"
              >
                {actionLabel}
              </button>
            )}
        </div>
      </section>
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi tindakan"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI TINDAKAN
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">
              {actionLabel}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              {report.status === "Diterima"
                ? "Pastikan informasi dan bukti pendukung laporan telah diperiksa sebelum melakukan verifikasi."
                : report.status === "Menunggu Validasi" && validationRecorded
                  ? "Status laporan akan diubah menjadi Sedang Diproses. Hasil validasi telah diterima dan dicatat. Laporan dapat dilanjutkan ke proses tindak lanjut."
                  : `Lanjutkan perubahan status laporan menjadi ${displayStatus(nextStatus[report.status] ?? "Selesai")}?`}
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={advance}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {report.status === "Menunggu Validasi" && validationRecorded
                  ? "Simpan"
                  : actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
      {validationModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="validation-modal-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              CATATAN VALIDASI
            </p>
            <h2
              id="validation-modal-title"
              className="mt-3 font-slab text-2xl text-[#12355B]"
            >
              Catat Hasil Validasi
            </h2>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Hasil Validasi <span className="text-[#005BAC]">*</span>
              </span>
              <input
                required
                value={validationResult}
                onChange={(event) => {
                  setValidationResult(event.target.value)
                  if (validationError) setValidationError("")
                }}
                placeholder="Masukkan hasil validasi dari Fakultas/Unit terkait"
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {validationError && (
                <p className="mt-2 text-xs text-[#B42318]">{validationError}</p>
              )}
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Catatan Validasi{" "}
                <span className="font-normal text-[#52657A]">(opsional)</span>
              </span>
              <textarea
                value={validationNote}
                onChange={(event) => setValidationNote(event.target.value)}
                rows={4}
                className="mt-2 block w-full resize-y border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
            </label>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setValidationModalOpen(false)
                  setValidationError("")
                }}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={recordValidation}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      {completionModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-modal-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI PENYELESAIAN
            </p>
            <h2
              id="completion-modal-title"
              className="mt-3 font-slab text-2xl text-[#12355B]"
            >
              Selesaikan Laporan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Laporan akan ditandai sebagai Selesai setelah proses tindak lanjut
              dinyatakan selesai.
            </p>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Tindak Lanjut / Hasil Penanganan{" "}
                <span className="text-[#005BAC]">*</span>
              </span>
              <textarea
                required
                value={completionResult}
                onChange={(event) => {
                  setCompletionResult(event.target.value)
                  if (completionError) setCompletionError("")
                }}
                rows={4}
                placeholder="Masukkan hasil tindak lanjut atau penyelesaian laporan"
                className="mt-2 block w-full resize-y border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {completionError && (
                <p className="mt-2 text-xs text-[#B42318]">{completionError}</p>
              )}
            </label>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setCompletionModalOpen(false)
                  setCompletionError("")
                }}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={completeReport}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Selesaikan Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminWorkflowShell>
  )
}

function AdminProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#D9E2EC] py-4 last:border-b-0">
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
        {label.toUpperCase()}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">
        {value}
      </p>
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
            Informasi akun administrator dan akses pengelolaan sistem Lapor
            Tuton.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] items-start gap-8 max-[900px]:grid-cols-1">
          <section
            className="border border-[#D9E2EC] bg-white"
            aria-labelledby="informasi-admin"
          >
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                01 / INFORMASI ADMINISTRATOR
              </p>
              <h2
                id="informasi-admin"
                className="mt-1 font-slab text-2xl text-[#12355B]"
              >
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
                  <p className="mt-1 font-mono text-xs text-[#005BAC]">
                    ADM-001
                  </p>
                </div>
              </div>
              <AdminProfileItem
                label="Email"
                value="administrator@laportuton.example"
              />
              <AdminProfileItem
                label="Unit/Pengelola"
                value="Pengelola Tutorial Online"
              />
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
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="akses-akun"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  02 / AKSES AKUN
                </p>
                <h2
                  id="akses-akun"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
                  Akses Akun
                </h2>
              </div>
              <div className="px-6 max-[620px]:px-5">
                <AdminProfileItem label="Peran Akses" value="Administrator" />
                <AdminProfileItem
                  label="Akses Sistem"
                  value="Pengelolaan Laporan"
                />
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
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="sesi-akun"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  03 / SESI AKUN
                </p>
                <h2
                  id="sesi-akun"
                  className="mt-1 font-slab text-2xl text-[#12355B]"
                >
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
                 onClick={handlePrototypeLogout}>
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

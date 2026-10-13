import { useState } from 'react'
import { useNavigate } from 'react-router'
import { studentNotifications, type StudentNotification } from '../data/notifications'
import type { HistoryReport } from '../../../shared/types/history-report'
import { getStudentHistoryReports } from '../lib/history-reports'
import { statusBadge } from '../lib/status-badge'

export function DashboardScreen() {
  const [selectedReport, setSelectedReport] = useState<HistoryReport | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<StudentNotification[]>(studentNotifications)
  const navigate = useNavigate()
  const studentReports = getStudentHistoryReports()
  const recentReports = studentReports.slice(0, 3)
  const unreadNotifications = notifications.filter((notification) => notification.unread).length

  const openNotification = (notification: StudentNotification) => {
    const report = studentReports.find((item) => item.id === notification.reportId)
    if (report) setSelectedReport(report)
    setNotifications((items) =>
      items.map((item) => (item.id === notification.id ? { ...item, unread: false } : item)),
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
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">NIM</p>
              <p className="mt-1 text-sm font-medium">XXXXXXXXXX</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center border border-[#12355B] text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              aria-label={`Notifikasi${unreadNotifications ? `, ${unreadNotifications} belum dibaca` : ''}`}
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
                    <p className="font-slab text-base text-[#12355B]">Notifikasi</p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                      {unreadNotifications > 0
                        ? `${unreadNotifications} BELUM DIBACA`
                        : 'SEMUA SUDAH DIBACA'}
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
                    <p className="font-slab text-base text-[#12355B]">Tidak ada notifikasi</p>
                    <p className="mt-2 text-xs leading-5 text-[#52657A]">
                      Pembaruan status dan tindak lanjut laporan akan tampil di sini.
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
              String(studentReports.length).padStart(2, '0'),
              'Total Laporan',
              'Seluruh laporan Anda',
            ],
            [
              String(
                studentReports.filter((report) => report.status === 'Sedang Diproses').length,
              ).padStart(2, '0'),
              'Sedang Diproses',
              'Menunggu tindak lanjut',
            ],
            [
              String(
                studentReports.filter((report) => report.status === 'Selesai').length,
              ).padStart(2, '0'),
              'Selesai',
              'Telah ditangani',
            ],
          ].map(([number, label, caption], index) => (
            <div
              key={label}
              className={`min-h-[150px] p-5 ${
                index !== 0
                  ? 'border-l border-[#D9E2EC] max-[760px]:border-l-0 max-[760px]:border-t'
                  : ''
              }`}
            >
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#52657A]">
                {label.toUpperCase()}
              </p>
              <p className="mt-5 font-slab text-5xl leading-none text-[#12355B]">{number}</p>
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
            onClick={() => navigate('/buat-laporan')}
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
              <h2 id="recent-reports" className="mt-2 font-slab text-2xl text-[#12355B]">
                Laporan Terbaru
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
              {String(recentReports.length).padStart(2, '0')} LAPORAN
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
                  <p className="font-mono text-xs font-medium text-[#005BAC]">{report.id}</p>
                  <p className="mt-1 text-[11px] text-[#52657A] md:hidden">{report.submitted}</p>
                </div>
                <div className="max-md:mt-3">
                  <p className="text-sm font-medium">{report.category ?? 'Aktivitas tutor'}</p>
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
            <h3 className="mt-3 font-slab text-2xl text-[#12355B]">{selectedReport.id}</h3>
            <p className="mt-5 text-sm">
              <span className="text-[#52657A]">Kategori: </span>
              {selectedReport.category}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-[#52657A]">Status: </span>
              {selectedReport.status}
            </p>
            <section
              className="mt-5 border-t border-[#D9E2EC] pt-4"
              aria-labelledby="informasi-penanganan"
            >
              <h4 id="informasi-penanganan" className="font-slab text-base text-[#12355B]">
                Informasi Penanganan
              </h4>
              <p className="mt-2 text-sm">
                <span className="text-[#52657A]">Pihak/Unit Penanganan: </span>
                Fakultas/Unit Terkait
              </p>
              <p className="mt-2 text-xs leading-5 text-[#52657A]">
                Validasi oleh Fakultas/Unit terkait dilakukan melalui kanal eksternal.
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

import { useState } from 'react'
import type { WorkflowStatus } from '../../../shared/types/workflow'
import { getWorkflowReports, saveWorkflowReports } from '../../../shared/lib/workflow-storage'
import { formatIndonesianDateTime } from '../../../shared/lib/date-time'
import {
  AdminWorkflowShell,
  WorkflowTable,
  exportFilePart,
  reportGroup,
} from '../components/workflow-ui'

export function AdminWorkflowQueueScreen() {
  const [status, setStatus] = useState('Semua')
  const [query, setQuery] = useState('')
  const [faculty, setFaculty] = useState('Semua')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const allReports = getWorkflowReports()
  const faculties = Array.from(new Set(allReports.map((report) => reportGroup(report).faculty)))
  const reports = allReports.filter((report) => {
    const group = reportGroup(report)
    return (
      report.status !== 'Selesai' &&
      (status === 'Semua' || report.status === status) &&
      (faculty === 'Semua' || group.faculty === faculty) &&
      `${report.id} ${report.title}`.toLowerCase().includes(query.toLowerCase())
    )
  })
  const exportReports = allReports.filter(
    (report) =>
      faculty !== 'Semua' &&
      report.status === 'Diverifikasi' &&
      reportGroup(report).faculty === faculty,
  )
  const includedPrograms = Array.from(
    new Set(exportReports.map((report) => reportGroup(report).programStudy)),
  )
  const exportFaculty = faculty
  const exportProgram =
    includedPrograms.length > 1 ? 'Beberapa Program Studi' : (includedPrograms[0] ?? '—')
  const fileName = `Data_Laporan_Tutor_${exportFilePart(exportFaculty)}_2026.csv`
  const downloadExport = () => {
    const headers = [
      'ID Laporan',
      'Kategori',
      'Program Studi',
      'Fakultas',
      'Jenis Mata Kuliah',
      'Kode Mata Kuliah',
      'Nama Mata Kuliah',
      'Kelas Mata Kuliah',
      'Nama Tutor',
      'Perkiraan Durasi Tidak Ada Aktivitas/Respons',
      'Judul Laporan',
      'Tanggal Laporan',
      'Status',
    ]
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows = exportReports.map((report) => {
      const [courseCode, courseName] = report.course.split(' · ')
      const group = reportGroup(report)
      return [
        report.id,
        report.category,
        group.programStudy,
        group.faculty,
        report.courseType ?? 'Teori/Umum',
        courseCode,
        courseName,
        report.className,
        report.tutor,
        report.duration ?? '1 minggu atau lebih',
        report.title,
        report.submitted,
        report.status,
      ]
    })
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
    const downloadUrl = URL.createObjectURL(
      new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
  }
  const confirmSend = () => {
    const sentAt = formatIndonesianDateTime(new Date())
    const selected = new Set(exportReports.map((report) => report.id))
    const updated = allReports.map((report) =>
      selected.has(report.id)
        ? {
            ...report,
            status: 'Menunggu Validasi' as WorkflowStatus,
            updates: [
              ...report.updates,
              {
                time: sentAt,
                title: 'Data laporan dikirim ke Fakultas/Unit terkait',
                text: 'Data laporan telah dikirim oleh Administrator melalui kanal eksternal untuk proses validasi.',
              },
            ],
          }
        : report,
    )
    try {
      saveWorkflowReports(updated)
    } catch {
      return
    }
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
            Kelola dan tindak lanjuti laporan permasalahan terkait aktivitas dan layanan tutor.
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
              <h2 className="mt-2 font-slab text-2xl text-[#12355B]">Antrean Laporan</h2>
            </div>
            <div className="flex items-center gap-4 max-[620px]:w-full max-[620px]:justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(reports.length).padStart(2, '0')} LAPORAN
              </span>
              <button
                onClick={() => setExportModalOpen(true)}
                disabled={faculty === 'Semua' || !exportReports.length}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
              >
                Export Data Laporan
              </button>
            </div>
          </div>
          <WorkflowTable reports={reports} context="queue" showProgramStudy />
          {reports.length === 0 && (
            <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
              <p className="font-slab text-xl text-[#12355B]">Belum ada laporan pada status ini.</p>
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
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Data Siap Dikirim</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Data laporan berhasil diekspor dan siap dikirim melalui kanal eksternal.
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
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Export Data Laporan</h2>
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
                <dd className="mt-1 font-medium">{exportReports.length} laporan</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  NAMA FILE
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-[#005BAC]">{fileName}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-[#52657A]">
              Data yang diekspor mencakup seluruh laporan berstatus Diverifikasi dari Fakultas yang
              dipilih, termasuk laporan dari berbagai Program Studi.
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
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Konfirmasi Pengiriman Data</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Pastikan data laporan telah dikirim kepada Fakultas/Unit terkait melalui kanal
              eksternal sebelum melanjutkan.
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

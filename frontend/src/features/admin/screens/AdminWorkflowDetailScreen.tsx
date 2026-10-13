import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { WorkflowStatus } from '../../../shared/types/workflow'
import { workflowSeed } from '../../../shared/data/workflow-seed'
import { getWorkflowReports, saveWorkflowReports } from '../../../shared/lib/workflow-storage'
import { formatIndonesianDateTime } from '../../../shared/lib/date-time'
import { AdminWorkflowShell, workflowStatusClass } from '../components/workflow-ui'
import { ReadOnlyItem } from '../../../shared/components/ReadOnlyItem'

export function AdminWorkflowDetailScreen() {
  const [modalOpen, setModalOpen] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationResult, setValidationResult] = useState('')
  const [validationNote, setValidationNote] = useState('')
  const [validationError, setValidationError] = useState('')
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [completionResult, setCompletionResult] = useState('')
  const [completionError, setCompletionError] = useState('')
  const navigate = useNavigate()
  const context =
    window.sessionStorage.getItem('adminDetailContext') === 'history' ? 'history' : 'queue'
  const id = window.sessionStorage.getItem('adminDetailId') ?? 'LT-2026-0008'
  const [report, setReport] = useState(
    () => getWorkflowReports().find((item) => item.id === id) ?? workflowSeed[0],
  )
  const nextStatus: Record<WorkflowStatus, WorkflowStatus | null> = {
    Diterima: 'Diverifikasi',
    Diverifikasi: 'Menunggu Validasi',
    'Menunggu Validasi': 'Diproses',
    Diproses: 'Selesai',
    Selesai: null,
  }
  const validationRecorded = report.updates.some(
    (update) => update.title === 'Hasil validasi diterima dan dicatat',
  )
  const actionLabel =
    report.status === 'Diterima'
      ? 'Verifikasi Laporan'
      : report.status === 'Diverifikasi'
        ? 'Siapkan Validasi'
        : report.status === 'Menunggu Validasi'
          ? validationRecorded
            ? 'Perbarui Status'
            : 'Catat Hasil Validasi'
          : report.status === 'Selesai'
            ? null
            : 'Perbarui Status'
  const stageState = (index: number) => {
    const level = ['Diterima', 'Diverifikasi', 'Menunggu Validasi', 'Diproses', 'Selesai'].indexOf(
      report.status,
    )
    return index === 0
      ? 'done'
      : index === level
        ? level === 0
          ? 'next'
          : 'current'
        : index < level
          ? 'done'
          : 'upcoming'
  }
  const stageClass = (state: string) =>
    state === 'done'
      ? 'border-[#005BAC] bg-[#005BAC] text-white'
      : state === 'current'
        ? 'border-[#C99C20] bg-[#F2C94C] text-[#12355B]'
        : state === 'next'
          ? 'border-[#005BAC] bg-white text-[#005BAC]'
          : 'border-[#B9C8D7] bg-white text-[#7D8B99]'
  const advance = () => {
    const next = nextStatus[report.status]
    if (!next) return
    const title =
      next === 'Diverifikasi'
        ? 'Laporan diverifikasi'
        : next === 'Menunggu Validasi'
          ? 'Validasi disiapkan'
          : next === 'Diproses' && report.status === 'Menunggu Validasi'
            ? 'Laporan memasuki proses tindak lanjut'
            : next === 'Diproses'
              ? 'Laporan diproses'
              : 'Laporan selesai'
    const text =
      next === 'Diverifikasi'
        ? 'Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.'
        : next === 'Menunggu Validasi'
          ? 'Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait.'
          : next === 'Diproses' && report.status === 'Menunggu Validasi'
            ? 'Hasil validasi telah diterima dan dicatat. Laporan memasuki proses tindak lanjut.'
            : next === 'Diproses'
              ? 'Laporan diteruskan kepada pengelola Tutorial Online untuk tindak lanjut.'
              : 'Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.'
    const time = formatIndonesianDateTime(new Date())
    const updated = {
      ...report,
      status: next,
      updates: [...report.updates, { time, title, text }],
    }
    const all = getWorkflowReports().map((item) => (item.id === updated.id ? updated : item))
    try {
      saveWorkflowReports(all)
    } catch {
      return
    }
    setReport(updated)
    setModalOpen(false)
  }
  const recordValidation = () => {
    const result = validationResult.trim()
    if (!result) {
      setValidationError('Hasil Validasi wajib diisi.')
      return
    }
    const note = validationNote.trim()
    const updated = {
      ...report,
      updates: [
        ...report.updates,
        {
          time: formatIndonesianDateTime(new Date()),
          title: 'Hasil validasi diterima dan dicatat',
          text: `Hasil validasi dari Fakultas/Unit terkait telah diterima dan dicatat oleh Administrator. Hasil validasi: ${result}${
            note ? `. Catatan validasi: ${note}` : ''
          }`,
        },
      ],
    }
    const all = getWorkflowReports().map((item) => (item.id === updated.id ? updated : item))
    try {
      saveWorkflowReports(all)
    } catch {
      return
    }
    setReport(updated)
    setValidationModalOpen(false)
    setValidationResult('')
    setValidationNote('')
    setValidationError('')
  }
  const completeReport = () => {
    const result = completionResult.trim()
    if (!result) {
      setCompletionError('Tindak Lanjut / Hasil Penanganan wajib diisi.')
      return
    }
    const updated = {
      ...report,
      status: 'Selesai' as WorkflowStatus,
      updates: [
        ...report.updates,
        {
          time: formatIndonesianDateTime(new Date()),
          title: 'Laporan selesai',
          text: `Laporan telah selesai ditangani. Tindak lanjut / hasil penanganan: ${result}`,
        },
      ],
    }
    const all = getWorkflowReports().map((item) => (item.id === updated.id ? updated : item))
    try {
      saveWorkflowReports(all)
    } catch {
      return
    }
    setReport(updated)
    setCompletionModalOpen(false)
    setCompletionResult('')
    setCompletionError('')
  }
  const openPrimaryAction = () => {
    if (report.status === 'Diproses') {
      setCompletionError('')
      setCompletionModalOpen(true)
      return
    }
    if (report.status === 'Menunggu Validasi' && !validationRecorded) {
      setValidationError('')
      setValidationModalOpen(true)
      return
    }
    setModalOpen(true)
  }
  const [code, courseName = report.course] = report.course.split(' · ')
  const displayStatus = (status: WorkflowStatus) =>
    status === 'Diproses' ? 'Sedang Diproses' : status
  const labels = ['Diterima', 'Diverifikasi', 'Menunggu Validasi', 'Sedang Diproses', 'Selesai']
  const back =
    context === 'history' ? '/administrator/riwayat-laporan' : '/administrator/antrean-laporan'
  return (
    <AdminWorkflowShell activeIndex={context === 'history' ? 2 : 1}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / {context === 'history' ? 'RIWAYAT LAPORAN' : 'ANTREAN LAPORAN'} / DETAIL
            LAPORAN
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
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Status Laporan</h2>
            </div>
            <div className="p-6">
              <ol className="hidden grid-cols-5 md:grid">
                {labels.map((label, index) => (
                  <li key={label} className="relative pr-4 last:pr-0">
                    <div
                      className={`absolute left-3 right-0 top-3 h-px ${
                        index === labels.length - 1
                          ? 'hidden'
                          : stageState(index) === 'done'
                            ? 'bg-[#005BAC]'
                            : 'bg-[#D9E2EC]'
                      }`}
                    />
                    <span
                      className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === 'done' ? '✓' : index + 1}
                    </span>
                    <p className="mt-4 text-sm font-semibold text-[#12355B]">{label}</p>
                  </li>
                ))}
              </ol>
              <ol className="space-y-4 md:hidden">
                {labels.map((label, index) => (
                  <li key={label} className="flex items-center gap-4">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === 'done' ? '✓' : index + 1}
                    </span>
                    <p className="text-sm font-semibold text-[#12355B]">{label}</p>
                  </li>
                ))}
              </ol>
              {actionLabel && (
                <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                  <div>
                    <p className="text-sm font-semibold text-[#12355B]">Tindakan Administrator</p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      {report.status === 'Diterima'
                        ? 'Periksa informasi dan bukti pendukung sebelum melakukan verifikasi.'
                        : report.status === 'Diverifikasi'
                          ? 'Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait.'
                          : report.status === 'Menunggu Validasi'
                            ? validationRecorded
                              ? 'Hasil validasi telah dicatat dan laporan siap diperbarui ke status Sedang Diproses.'
                              : 'Hasil validasi dari Fakultas/Unit terkait telah diterima dan siap dicatat.'
                            : `Laporan siap diperbarui ke status ${displayStatus(nextStatus[report.status] ?? 'Selesai')}.`}
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
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Informasi Laporan</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1">
              {[
                ['Kategori Permasalahan', report.category],
                ['Jenis Mata Kuliah', 'Teori/Umum'],
                ['Kode Mata Kuliah', code],
                ['Nama Mata Kuliah', courseName],
                ['Kelas Mata Kuliah', report.className],
                ['Nama Tutor', report.tutor],
                ['Perkiraan Durasi Tidak Ada Aktivitas/Respons', '1 minggu atau lebih'],
                ['Judul Laporan', report.title],
              ].map(([label, value]) => (
                <ReadOnlyItem
                  key={label}
                  label={label}
                  value={value}
                  wide={label.includes('Perkiraan') || label === 'Judul Laporan'}
                />
              ))}
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                03 / PENJELASAN MAHASISWA
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Uraian Permasalahan</h2>
            </div>
            <p className="p-6 text-sm leading-7">
              Mahasiswa melaporkan kendala terkait “{report.title}” pada mata kuliah {report.course}{' '}
              selama kegiatan Tutorial Online.
            </p>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                04 / LAMPIRAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Bukti Pendukung</h2>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">bukti-pendukung-tuton.pdf</p>
                <p className="mt-1 font-mono text-[10px] text-[#52657A]">PDF · 824 KB</p>
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
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Pembaruan Pengelola</h2>
            </div>
            <div className="space-y-5 p-6">
              {report.updates.length ? (
                report.updates.map((update) => (
                  <div key={`${update.time}-${update.title}`} className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] text-[10px] text-[#005BAC]">
                      ●
                    </span>
                    <div>
                      <p className="font-mono text-[10px] text-[#52657A]">{update.time}</p>
                      <h3 className="mt-1 text-sm font-semibold text-[#12355B]">{update.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#52657A]">{update.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#52657A]">Belum ada tindak lanjut.</p>
              )}
            </div>
          </section>
        </div>
        <div className="mt-8 flex justify-between gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
          <button
            onClick={() => navigate(back)}
            className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B]"
          >
            Kembali ke {context === 'history' ? 'Riwayat Laporan' : 'Antrean Laporan'}
          </button>
          {actionLabel && (report.status !== 'Menunggu Validasi' || validationRecorded) && (
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
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">{actionLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              {report.status === 'Diterima'
                ? 'Pastikan informasi dan bukti pendukung laporan telah diperiksa sebelum melakukan verifikasi.'
                : report.status === 'Menunggu Validasi' && validationRecorded
                  ? 'Status laporan akan diubah menjadi Sedang Diproses. Hasil validasi telah diterima dan dicatat. Laporan dapat dilanjutkan ke proses tindak lanjut.'
                  : `Lanjutkan perubahan status laporan menjadi ${displayStatus(nextStatus[report.status] ?? 'Selesai')}?`}
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
                {report.status === 'Menunggu Validasi' && validationRecorded
                  ? 'Simpan'
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
            <h2 id="validation-modal-title" className="mt-3 font-slab text-2xl text-[#12355B]">
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
                  if (validationError) setValidationError('')
                }}
                placeholder="Masukkan hasil validasi dari Fakultas/Unit terkait"
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {validationError && <p className="mt-2 text-xs text-[#B42318]">{validationError}</p>}
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Catatan Validasi <span className="font-normal text-[#52657A]">(opsional)</span>
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
                  setValidationError('')
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
            <h2 id="completion-modal-title" className="mt-3 font-slab text-2xl text-[#12355B]">
              Selesaikan Laporan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Laporan akan ditandai sebagai Selesai setelah proses tindak lanjut dinyatakan selesai.
            </p>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Tindak Lanjut / Hasil Penanganan <span className="text-[#005BAC]">*</span>
              </span>
              <textarea
                required
                value={completionResult}
                onChange={(event) => {
                  setCompletionResult(event.target.value)
                  if (completionError) setCompletionError('')
                }}
                rows={4}
                placeholder="Masukkan hasil tindak lanjut atau penyelesaian laporan"
                className="mt-2 block w-full resize-y border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {completionError && <p className="mt-2 text-xs text-[#B42318]">{completionError}</p>}
            </label>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setCompletionModalOpen(false)
                  setCompletionError('')
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

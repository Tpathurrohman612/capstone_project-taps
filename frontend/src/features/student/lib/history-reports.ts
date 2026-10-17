import type { HistoryReport } from '../../../shared/types/history-report'
import { historyReports } from '../data/history-reports'
import { getWorkflowReports } from '../../../shared/lib/workflow-storage'
import { REGISTERED_GOOGLE_ACCOUNT_NIM } from '../../auth/lib/google-account'

/**
 * Riwayat laporan milik satu mahasiswa.
 *
 * Kunci pemilik wajib diberikan pemanggil, tidak lagi dibaca sendiri dari
 * localStorage. Sebelumnya fungsi ini memanggil getActiveStudentNim() yang
 * membaca peramban, sedangkan laporan kini disimpan dengan Firebase UID
 * sebagai pemilik. Keduanya tidak pernah cocok, sehingga riwayat selalu kosong
 * meskipun laporan berhasil dikirim.
 *
 * Menjadikan kunci pemilik sebagai parameter membuat ketidakcocokan semacam
 * itu tampak pada tanda tangan fungsi, bukan tersembunyi di dalamnya.
 */
export const getStudentHistoryReports = (ownerKey: string | undefined): HistoryReport[] => {
  // Tanpa pemilik, sesi ini tidak memiliki laporan apa pun.
  if (ownerKey === undefined || ownerKey === '') return []

  const activeNim = ownerKey

  const workflowHistory = getWorkflowReports()
    .filter((report) => report.studentNim === activeNim)
    .map<HistoryReport>((report) => ({
      id: report.id,
      title: report.title,
      status: report.status,
      category: report.category,
      courseType: report.courseType ?? 'Teori/Umum',
      course: report.course,
      className: report.className,
      tutor: report.tutor,
      submitted: report.submitted,
      duration: report.duration ?? '1 minggu atau lebih',
      description: report.description,
      attachments: report.attachments,
    }))

  // The static demo records belong to the registered demo student, so they are
  // only merged for that account. Merging them unconditionally would show one
  // student records filed by another.
  const demoHistory =
    activeNim === REGISTERED_GOOGLE_ACCOUNT_NIM
      ? historyReports.filter(
          (historyReport) =>
            !workflowHistory.some((workflowReport) => workflowReport.id === historyReport.id),
        )
      : []
  const allReports = [...workflowHistory, ...demoHistory]
  return allReports.sort((left, right) =>
    right.id.localeCompare(left.id, undefined, { numeric: true }),
  )
}

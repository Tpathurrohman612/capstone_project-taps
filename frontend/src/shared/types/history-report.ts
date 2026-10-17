import type { ReportStatus } from '../domain/report-status'

export type HistoryReport = {
  id: string
  title: string
  // Sebelumnya tipe ini memuat 'Perlu Verifikasi', status yang tidak ada pada
  // Tabel 4.1 maupun di tempat lain pada kode. Kini mengikuti satu definisi
  // status yang sama dengan seluruh sistem.
  status: ReportStatus
  course: string
  className: string
  tutor: string
  submitted: string
  category?: string
  courseType?: string
  duration?: string
  description?: string
  attachments?: { name: string; type: string; size: string }[]
}

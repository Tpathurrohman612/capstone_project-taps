export type HistoryReport = {
  id: string
  title: string
  status:
    | 'Diterima'
    | 'Perlu Verifikasi'
    | 'Diverifikasi'
    | 'Menunggu Validasi'
    | 'Sedang Diproses'
    | 'Selesai'
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

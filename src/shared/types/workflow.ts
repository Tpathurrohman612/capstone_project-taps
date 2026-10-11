export type WorkflowStatus =
  | "Diterima"
  | "Diverifikasi"
  | "Menunggu Validasi"
  | "Diproses"
  | "Selesai"

export type WorkflowUpdate = {
  time: string
  title: string
  text: string
}

export type WorkflowReport = {
  id: string
  title: string
  category: string
  course: string
  className: string
  tutor: string
  submitted: string
  status: WorkflowStatus
  updates: WorkflowUpdate[]
  courseType?: string
  duration?: string
  description?: string
  attachments?: { name: string; type: string; size: string }[]
}

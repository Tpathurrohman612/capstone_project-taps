import type { ReportStatus } from '../domain/report-status'

/**
 * Status laporan. Definisinya tunggal, berada di shared/domain/report-status.ts
 * sebagai penerjemahan Tabel 4.1 proposal, dan dialiaskan di sini supaya kode
 * lama yang mengimpor WorkflowStatus tidak perlu diubah serentak.
 */
export type WorkflowStatus = ReportStatus

export type WorkflowUpdate = {
  time: string
  title: string
  text: string
}

export type WorkflowReport = {
  id: string
  // NIM of the student who filed the report. This is the ownership key: student
  // facing queries must filter on it so one student never reads another's
  // report. Legacy records stored before this field existed carry an empty
  // string, which matches no signed-in student.
  studentNim: string
  title: string
  category: string
  course: string
  className: string
  tutor: string
  submitted: string
  status: WorkflowStatus
  updates: WorkflowUpdate[]
  courseType?: string
  studentFaculty?: string
  duration?: string
  description?: string
  attachments?: { name: string; type: string; size: string }[]
}

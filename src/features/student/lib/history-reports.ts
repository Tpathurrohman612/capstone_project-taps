import type { HistoryReport } from "../../../shared/types/history-report"
import { historyReports } from "../data/history-reports"
import { getWorkflowReports } from "../../../shared/lib/workflow-storage"

export const getStudentHistoryReports = (): HistoryReport[] => {
  const workflowHistory = getWorkflowReports().map<HistoryReport>((report) => ({
    id: report.id,
    title: report.title,
    status:
      report.status === "Diproses" ? "Sedang Diproses" : report.status,
    category: report.category,
    courseType: report.courseType ?? "Teori/Umum",
    course: report.course,
    className: report.className,
    tutor: report.tutor,
    submitted: report.submitted,
    duration: report.duration ?? "1 minggu atau lebih",
    description: report.description,
    attachments: report.attachments,
  }))
  const allReports = [
    ...workflowHistory,
    ...historyReports.filter(
      (historyReport) =>
        !workflowHistory.some(
          (workflowReport) => workflowReport.id === historyReport.id,
        ),
    ),
  ]
  return allReports.sort((left, right) =>
    right.id.localeCompare(left.id, undefined, { numeric: true }),
  )
}

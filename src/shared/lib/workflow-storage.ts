import type { WorkflowReport } from "../types/workflow"
import { workflowSeed } from "../data/workflow-seed"

const workflowStorageKey = "lapor-tuton-admin-workflow"
const workflowStorageVersionKey = "lapor-tuton-admin-workflow-version"
const workflowStorageVersion = "6"
const normalizeLt0007 = (reports: WorkflowReport[]): WorkflowReport[] =>
  reports.map((report) => {
    if (report.id !== "LT-2026-0007") return report
    const requiredUpdates = workflowSeed[0].updates
    const existingByTitle = new Map(
      report.updates.map((update) => [update.title, update]),
    )
    const requiredTitles = new Set(
      requiredUpdates.map((update) => update.title),
    )
    return {
      ...report,
      updates: [
        ...requiredUpdates.map((update) => ({
          ...update,
          ...(existingByTitle.get(update.title) ?? {}),
          time: update.time,
        })),
        ...report.updates.filter((update) => !requiredTitles.has(update.title)),
      ],
    }
  })
const reconcileCurrentWorkflowStatuses = (
  reports: WorkflowReport[],
): WorkflowReport[] =>
  reports.map((report) => {
    if (report.id === "LT-2026-0007") {
      return { ...report, status: "Selesai" }
    }
    if (report.id === "LT-2026-0005") {
      const sentUpdate = workflowSeed[1].updates.find(
        (update) =>
          update.title === "Data laporan dikirim ke Fakultas/Unit terkait",
      )
      return {
        ...report,
        status: "Menunggu Validasi",
        updates:
          sentUpdate &&
          !report.updates.some((update) => update.title === sentUpdate.title)
            ? [...report.updates, sentUpdate]
            : report.updates,
      }
    }
    return report
  })
const ensureSeedReports = (reports: WorkflowReport[]): WorkflowReport[] => [
  ...reports,
  ...workflowSeed.filter(
    (seedReport) => !reports.some((report) => report.id === seedReport.id),
  ),
]
export const getWorkflowReports = (): WorkflowReport[] => {
  try {
    if (
      window.sessionStorage.getItem(workflowStorageVersionKey) !==
      workflowStorageVersion
    ) {
      const stored = window.sessionStorage.getItem(workflowStorageKey)
      const migrated = reconcileCurrentWorkflowStatuses(
        normalizeLt0007(
          ensureSeedReports(stored ? JSON.parse(stored) : workflowSeed),
        ),
      )
      window.sessionStorage.setItem(
        workflowStorageVersionKey,
        workflowStorageVersion,
      )
      window.sessionStorage.setItem(
        workflowStorageKey,
        JSON.stringify(migrated),
      )
      return migrated
    }
    const stored = window.sessionStorage.getItem(workflowStorageKey)
    const reports = normalizeLt0007(stored ? JSON.parse(stored) : workflowSeed)
    window.sessionStorage.setItem(workflowStorageKey, JSON.stringify(reports))
    return reports
  } catch {
    return normalizeLt0007(workflowSeed)
  }
}

export const saveWorkflowReports = (reports: WorkflowReport[]) =>
  window.sessionStorage.setItem(workflowStorageKey, JSON.stringify(reports))

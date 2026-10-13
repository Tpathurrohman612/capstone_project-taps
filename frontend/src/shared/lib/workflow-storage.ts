import type { WorkflowReport, WorkflowStatus, WorkflowUpdate } from '../types/workflow'
import { workflowSeed } from '../data/workflow-seed'

const workflowStorageKey = 'lapor-tuton-admin-workflow'
const workflowStorageVersionKey = 'lapor-tuton-admin-workflow-version'
const workflowStorageVersion = '7'
const workflowStorageBackupKey = 'lapor-tuton-admin-workflow-corrupt-backup'
const workflowStorageWarningKey = 'taps-workflow-storage-warning'
const workflowStorageWarningEvent = 'taps:workflow-storage-warning'

const validStatuses: WorkflowStatus[] = [
  'Diterima',
  'Diverifikasi',
  'Menunggu Validasi',
  'Diproses',
  'Selesai',
]

export class WorkflowStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkflowStorageError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isWorkflowUpdate = (value: unknown): value is WorkflowUpdate =>
  isRecord(value) &&
  typeof value.time === 'string' &&
  typeof value.title === 'string' &&
  typeof value.text === 'string'

const isWorkflowReport = (value: unknown): value is WorkflowReport => {
  if (!isRecord(value)) return false

  const requiredStrings = ['id', 'title', 'category', 'course', 'className', 'tutor', 'submitted']

  if (!requiredStrings.every((field) => typeof value[field] === 'string')) {
    return false
  }

  if (
    typeof value.status !== 'string' ||
    !validStatuses.includes(value.status as WorkflowStatus) ||
    !Array.isArray(value.updates) ||
    !value.updates.every(isWorkflowUpdate)
  ) {
    return false
  }

  if (
    value.attachments !== undefined &&
    (!Array.isArray(value.attachments) ||
      !value.attachments.every(
        (attachment) =>
          isRecord(attachment) &&
          typeof attachment.name === 'string' &&
          typeof attachment.type === 'string' &&
          typeof attachment.size === 'string',
      ))
  ) {
    return false
  }

  return true
}

const isWorkflowReportArray = (value: unknown): value is WorkflowReport[] =>
  Array.isArray(value) && value.every(isWorkflowReport)

let lastConsoleWarning = ''

function announceStorageWarning(message: string) {
  try {
    window.sessionStorage.setItem(workflowStorageWarningKey, message)
  } catch {
    // Event-based notification may still work when storage writes fail.
  }

  try {
    window.dispatchEvent(new CustomEvent<string>(workflowStorageWarningEvent, { detail: message }))
  } catch {
    // The caller still receives the warning through its error path.
  }

  if (message !== lastConsoleWarning) {
    console.error(`[TAPS] ${message}`)
    lastConsoleWarning = message
  }
}

export function getWorkflowStorageWarning(): string | null {
  try {
    return window.sessionStorage.getItem(workflowStorageWarningKey)
  } catch {
    return null
  }
}

function preserveCorruptSnapshot(storage: Storage, raw: string, reason: string) {
  let backupMessage: string

  try {
    const existingBackup = storage.getItem(workflowStorageBackupKey)

    if (existingBackup === null) {
      storage.setItem(workflowStorageBackupKey, raw)
      backupMessage = `Salinan data mentah disimpan pada sessionStorage dengan kunci "${workflowStorageBackupKey}".`
    } else if (existingBackup === raw) {
      backupMessage = 'Salinan data mentah yang sama sudah tersedia.'
    } else {
      backupMessage = `Salinan sebelumnya tidak ditimpa. Data aktif tetap dipertahankan pada kunci "${workflowStorageKey}".`
    }
  } catch {
    backupMessage = `Browser tidak dapat membuat salinan tambahan. Data aktif tetap tidak ditimpa pada kunci "${workflowStorageKey}".`
  }

  announceStorageWarning(
    `Data workflow tidak valid (${reason}). ${backupMessage} Tampilan sementara dapat menggunakan data demo, tetapi penyimpanan laporan diblokir untuk melindungi data yang ada.`,
  )
}

const normalizeLt0007 = (reports: WorkflowReport[]): WorkflowReport[] =>
  reports.map((report) => {
    if (report.id !== 'LT-2026-0007') return report

    const requiredUpdates = workflowSeed[0].updates
    const existingByTitle = new Map(report.updates.map((update) => [update.title, update]))
    const requiredTitles = new Set(requiredUpdates.map((update) => update.title))

    return {
      ...report,
      updates: [
        ...requiredUpdates.map((update) => ({
          ...update,
          ...(existingByTitle.get(update.title) ?? {}),
        })),
        ...report.updates.filter((update) => !requiredTitles.has(update.title)),
      ],
    }
  })

const ensureSeedReports = (reports: WorkflowReport[]): WorkflowReport[] => [
  ...reports,
  ...workflowSeed.filter((seedReport) => !reports.some((report) => report.id === seedReport.id)),
]

const normalizeSeed = () => normalizeLt0007(workflowSeed)

export const getWorkflowReports = (): WorkflowReport[] => {
  let storage: Storage
  let raw: string | null
  let version: string | null

  try {
    storage = window.sessionStorage
    raw = storage.getItem(workflowStorageKey)
    version = storage.getItem(workflowStorageVersionKey)
  } catch {
    announceStorageWarning(
      'Browser tidak mengizinkan akses ke sessionStorage. Data demo ditampilkan sementara; perubahan laporan tidak dapat dijamin tersimpan.',
    )
    return normalizeSeed()
  }

  let storedReports: WorkflowReport[]

  if (raw === null) {
    storedReports = workflowSeed
  } else {
    let parsed: unknown

    try {
      parsed = JSON.parse(raw)
    } catch {
      preserveCorruptSnapshot(storage, raw, 'JSON tidak dapat dibaca')
      return normalizeSeed()
    }

    if (!isWorkflowReportArray(parsed)) {
      preserveCorruptSnapshot(storage, raw, 'struktur data tidak sesuai')
      return normalizeSeed()
    }

    storedReports = parsed
  }

  const needsMigration = version !== workflowStorageVersion
  const reports = normalizeLt0007(ensureSeedReports(storedReports))
  const serialized = JSON.stringify(reports)
  const needsWrite = raw === null || needsMigration || serialized !== raw

  if (needsWrite) {
    try {
      // Persist data first. Update the version only after that write succeeds.
      storage.setItem(workflowStorageKey, serialized)

      if (needsMigration) {
        storage.setItem(workflowStorageVersionKey, workflowStorageVersion)
      }
    } catch {
      announceStorageWarning(
        'Data laporan dapat dibaca, tetapi browser gagal menyimpan hasil inisialisasi atau migrasi. Perubahan belum dapat dipastikan tersimpan.',
      )
    }
  }

  return reports
}

export const saveWorkflowReports = (reports: WorkflowReport[]) => {
  if (!isWorkflowReportArray(reports)) {
    const message = 'Penyimpanan dibatalkan karena bentuk data laporan tidak valid.'
    announceStorageWarning(message)
    throw new WorkflowStorageError(message)
  }

  let storage: Storage

  try {
    storage = window.sessionStorage
    const raw = storage.getItem(workflowStorageKey)

    if (raw !== null) {
      let parsed: unknown

      try {
        parsed = JSON.parse(raw)
      } catch {
        preserveCorruptSnapshot(storage, raw, 'JSON tidak dapat dibaca')
        throw new WorkflowStorageError(
          'Laporan tidak disimpan karena data workflow yang ada tidak valid.',
        )
      }

      if (!isWorkflowReportArray(parsed)) {
        preserveCorruptSnapshot(storage, raw, 'struktur data tidak sesuai')
        throw new WorkflowStorageError(
          'Laporan tidak disimpan karena struktur data workflow tidak valid.',
        )
      }
    }

    storage.setItem(workflowStorageKey, JSON.stringify(reports))

    if (storage.getItem(workflowStorageBackupKey) === null) {
      storage.removeItem(workflowStorageWarningKey)
    }
  } catch (error) {
    if (error instanceof WorkflowStorageError) throw error

    const message =
      'Browser gagal menyimpan laporan. Perubahan tidak dapat dipastikan tersimpan; periksa ketersediaan penyimpanan sesi.'

    announceStorageWarning(message)
    throw new WorkflowStorageError(message)
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { workflowSeed } from '../data/workflow-seed'
import { getWorkflowReports, saveWorkflowReports, WorkflowStorageError } from './workflow-storage'

const REPORTS_KEY = 'lapor-tuton-admin-workflow'
const VERSION_KEY = 'lapor-tuton-admin-workflow-version'
const BACKUP_KEY = 'lapor-tuton-admin-workflow-corrupt-backup'
const WARNING_KEY = 'taps-workflow-storage-warning'

function createMockStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const failingWrites = new Set<string>()

  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      if (failingWrites.has(key)) {
        throw new Error('Simulated storage quota failure')
      }
      values.set(key, String(value))
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
  }

  return { values, failingWrites, storage }
}

class TestCustomEvent<T = unknown> extends Event {
  readonly detail: T | null

  constructor(type: string, init?: CustomEventInit<T>) {
    super(type)
    this.detail = init?.detail ?? null
  }
}

describe('workflow-storage', () => {
  let browser: ReturnType<typeof createMockStorage>

  beforeEach(() => {
    browser = createMockStorage()
    vi.stubGlobal('window', {
      sessionStorage: browser.storage,
      dispatchEvent: vi.fn(),
    })
    vi.stubGlobal('CustomEvent', TestCustomEvent)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('preserves existing activity timestamps when normalizing LT-2026-0007', () => {
    const existingReports = structuredClone(workflowSeed)
    const targetReport = existingReports.find((report) => report.id === 'LT-2026-0007')!
    const targetUpdate = targetReport.updates[0]
    targetUpdate.time = '13 Oktober 2026, 14:00'

    browser.values.set(REPORTS_KEY, JSON.stringify(existingReports))
    browser.values.set(VERSION_KEY, '7')

    const result = getWorkflowReports()
    const preservedUpdate = result
      .find((report) => report.id === 'LT-2026-0007')
      ?.updates.find((update) => update.title === targetUpdate.title)

    expect(preservedUpdate?.time).toBe('13 Oktober 2026, 14:00')
  })

  it('migrates version 6 without overwriting saved report statuses', () => {
    const existingReports = structuredClone(workflowSeed)
    existingReports.find((report) => report.id === 'LT-2026-0005')!.status = 'Diverifikasi'
    existingReports.find((report) => report.id === 'LT-2026-0007')!.status = 'Diproses'

    browser.values.set(REPORTS_KEY, JSON.stringify(existingReports))
    browser.values.set(VERSION_KEY, '6')

    const result = getWorkflowReports()

    expect(result.find((report) => report.id === 'LT-2026-0005')?.status).toBe('Diverifikasi')
    expect(result.find((report) => report.id === 'LT-2026-0007')?.status).toBe('Diproses')
    expect(browser.values.get(VERSION_KEY)).toBe('7')
  })

  it('preserves malformed JSON and creates a backup instead of overwriting it', () => {
    const corruptRaw = '{"broken":'
    browser.values.set(REPORTS_KEY, corruptRaw)
    browser.values.set(VERSION_KEY, '7')

    const result = getWorkflowReports()

    expect(result.length).toBe(workflowSeed.length)
    expect(browser.values.get(REPORTS_KEY)).toBe(corruptRaw)
    expect(browser.values.get(BACKUP_KEY)).toBe(corruptRaw)
    expect(browser.values.get(WARNING_KEY)).toContain('JSON tidak dapat dibaca')
  })

  it('preserves JSON whose structure does not match workflow reports', () => {
    const invalidRaw = JSON.stringify([{ id: 'INVALID-REPORT' }])
    browser.values.set(REPORTS_KEY, invalidRaw)
    browser.values.set(VERSION_KEY, '7')

    getWorkflowReports()

    expect(browser.values.get(REPORTS_KEY)).toBe(invalidRaw)
    expect(browser.values.get(BACKUP_KEY)).toBe(invalidRaw)
    expect(browser.values.get(WARNING_KEY)).toContain('struktur data tidak sesuai')
  })

  it('refuses to save over an existing malformed workflow value', () => {
    const corruptRaw = '{invalid-json'
    browser.values.set(REPORTS_KEY, corruptRaw)

    expect(() => saveWorkflowReports(structuredClone(workflowSeed))).toThrow(WorkflowStorageError)

    expect(browser.values.get(REPORTS_KEY)).toBe(corruptRaw)
    expect(browser.values.get(BACKUP_KEY)).toBe(corruptRaw)
  })

  it('throws when saving fails and leaves the previous data intact', () => {
    const original = JSON.stringify(workflowSeed)
    browser.values.set(REPORTS_KEY, original)
    browser.failingWrites.add(REPORTS_KEY)

    const changedReports = structuredClone(workflowSeed)
    changedReports[0] = {
      ...changedReports[0],
      title: 'Perubahan pengujian',
    }

    expect(() => saveWorkflowReports(changedReports)).toThrow(WorkflowStorageError)
    expect(browser.values.get(REPORTS_KEY)).toBe(original)
    expect(browser.values.get(WARNING_KEY)).toContain('gagal menyimpan laporan')
  })
})

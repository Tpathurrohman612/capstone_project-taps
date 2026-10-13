import { useEffect, useState } from 'react'
import { getWorkflowStorageWarning } from '../lib/workflow-storage'

const warningEvent = 'taps:workflow-storage-warning'

export function WorkflowStorageNotice() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const refreshWarning = () => setMessage(getWorkflowStorageWarning())

    const handleWarning = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      setMessage(detail || getWorkflowStorageWarning())
    }

    window.addEventListener(warningEvent, handleWarning)
    refreshWarning()

    return () => window.removeEventListener(warningEvent, handleWarning)
  }, [])

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-3xl items-start gap-3 border border-amber-500 bg-white px-4 py-3 text-sm text-slate-800 shadow-lg"
    >
      <span className="flex-1 whitespace-pre-wrap">{message}</span>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="shrink-0 border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100"
        aria-label="Tutup peringatan penyimpanan"
      >
        Tutup
      </button>
    </div>
  )
}

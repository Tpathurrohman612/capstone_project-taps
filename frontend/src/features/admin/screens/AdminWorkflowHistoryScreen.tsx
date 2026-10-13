import { useState } from 'react'
import { getWorkflowReports } from '../../../shared/lib/workflow-storage'
import { AdminWorkflowShell, WorkflowTable } from '../components/workflow-ui'

export function AdminWorkflowHistoryScreen() {
  const [status, setStatus] = useState('Semua')
  const [query, setQuery] = useState('')
  const reports = getWorkflowReports().filter(
    (report) =>
      report.status === 'Selesai' &&
      (status === 'Semua' || report.status === status) &&
      `${report.id} ${report.title}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <AdminWorkflowShell activeIndex={2}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / RIWAYAT LAPORAN
          </p>
          <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
            Riwayat Laporan
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Arsip laporan yang telah diselesaikan.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-[220px_minmax(0,1fr)] gap-4 max-[700px]:grid-cols-1">
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              STATUS LAPORAN
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
            >
              <option>Semua</option>
              <option>Selesai</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              CARI LAPORAN
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm"
              placeholder="Cari ID atau judul laporan"
            />
          </label>
        </div>
        <section className="mt-8">
          <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                DAFTAR RIWAYAT LAPORAN
              </p>
              <h2 className="mt-2 font-slab text-2xl text-[#12355B]">Riwayat Laporan</h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
              {String(reports.length).padStart(2, '0')} LAPORAN
            </span>
          </div>
          <WorkflowTable reports={reports} context="history" />
          {reports.length === 0 && (
            <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
              <p className="font-slab text-xl text-[#12355B]">Belum ada laporan selesai.</p>
            </div>
          )}
        </section>
      </section>
    </AdminWorkflowShell>
  )
}

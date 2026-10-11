import { useState } from "react"
import { Link } from "react-router"
import { getStudentHistoryReports } from "../lib/history-reports"
import { statusBadge } from "../lib/status-badge"

export function ReportHistoryScreen() {
  const [status, setStatus] = useState("Semua")
  const [query, setQuery] = useState("")
  const visibleReports = getStudentHistoryReports().filter(
    (report) =>
      (status === "Semua" || report.status === status) &&
      `${report.id} ${report.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )

  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / RIWAYAT LAPORAN
        </p>
        <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
          Riwayat Laporan
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#52657A]">
          Lihat seluruh laporan yang pernah Anda kirim.
        </p>
      </header>
      <div className="mt-8 grid grid-cols-[210px_minmax(0,1fr)] gap-4 max-[700px]:grid-cols-1">
        <label className="block">
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
            STATUS LAPORAN
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
          >
            <option>Semua</option>
            <option>Diterima</option>
            <option>Diverifikasi</option>
            <option>Sedang Diproses</option>
            <option>Selesai</option>
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
            CARI LAPORAN
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
            placeholder="Cari ID laporan atau judul laporan"
          />
        </label>
      </div>
      <section className="mt-8" aria-labelledby="daftar-laporan">
        <div className="flex items-end justify-between border-b-2 border-[#12355B] pb-3">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
              DAFTAR PENGAJUAN
            </p>
            <h2
              id="daftar-laporan"
              className="mt-2 font-slab text-2xl text-[#12355B]"
            >
              Laporan Anda
            </h2>
          </div>
          <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
            {String(visibleReports.length).padStart(2, "0")} LAPORAN
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {visibleReports.map((report) => (
            <article
              key={report.id}
              className="border border-[#D9E2EC] bg-white"
            >
              <div className="flex items-start justify-between gap-5 border-b border-[#D9E2EC] bg-[#F7F9FC] px-5 py-4 max-[620px]:block">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#005BAC]">
                    {report.id}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#12355B]">
                    {report.title}
                  </h3>
                </div>
                <span
                  className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.05em] ${statusBadge(report.status)} max-[620px]:mt-3 max-[620px]:inline-flex`}
                >
                  {report.status}
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1.55fr)_0.55fr_minmax(0,1fr)_auto] items-end gap-5 px-5 py-5 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                    MATA KULIAH
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {report.course}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                    KELAS
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {report.className}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                    TUTOR
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {report.tutor}
                  </p>
                  <p className="mt-1 text-xs text-[#52657A]">
                    Diterima {report.submitted}
                  </p>
                </div>
                <Link
                  to={`/riwayat-laporan/detail-laporan?report=${report.id}`}
                  className="inline-flex border-b border-[#005BAC] pb-1 text-sm font-semibold text-[#005BAC] transition hover:border-[#12355B] hover:text-[#12355B] max-[900px]:col-span-2 max-[620px]:col-auto"
                >
                  Lihat Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
        {visibleReports.length === 0 && (
          <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
            <p className="font-slab text-xl text-[#12355B]">
              Laporan tidak ditemukan
            </p>
            <p className="mt-2 text-sm text-[#52657A]">
              Coba ubah kata kunci atau status laporan Anda.
            </p>
          </div>
        )}
      </section>
    </section>
  )
}

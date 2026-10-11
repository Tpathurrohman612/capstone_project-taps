import { useLocation, useNavigate } from "react-router"
import { historyReports } from "../data/history-reports"
import { followUps, statusStages } from "../data/detail-report"
import { getStudentHistoryReports } from "../lib/history-reports"
import { statusBadge } from "../lib/status-badge"
import { getWorkflowReports } from "../../../shared/lib/workflow-storage"
import { ReadOnlyItem } from "../../../shared/components/ReadOnlyItem"

export function DetailReportScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedReportId = new URLSearchParams(location.search).get("report")
  const report =
    getStudentHistoryReports().find((item) => item.id === selectedReportId) ??
    historyReports[0]
  const [courseCode, courseName] = report.course.split(" · ")
  const administratorReport = getWorkflowReports().find(
    (item) => item.id === report.id,
  )
  const currentStage = {
    Diterima: 0,
    "Perlu Verifikasi": 0,
    Diverifikasi: 1,
    "Menunggu Validasi": 2,
    "Sedang Diproses": 3,
    Selesai: 4,
  }[report.status]
  const statusUpdateTitles: Record<string, string[]> = {
    Diterima: ["Laporan diterima"],
    Diverifikasi: ["Laporan diverifikasi"],
    "Menunggu Validasi": [
      "Validasi disiapkan",
      "Data laporan dikirim ke Fakultas/Unit terkait",
    ],
    "Sedang Diproses": [
      "Laporan memasuki proses tindak lanjut",
      "Laporan diproses",
    ],
    Selesai: ["Laporan selesai"],
  }
  const timelineTime = (label: string, index: number) => {
    const update = administratorReport?.updates.find((item) =>
      statusUpdateTitles[label]?.includes(item.title),
    )
    if (update) return update.time
    if (index > currentStage) return "Menunggu pembaruan"
    return "Belum ada catatan waktu"
  }
  const detailStatusStages = statusStages.map((stage, index) => ({
    ...stage,
    time: timelineTime(stage.label, index),
    state:
      index < currentStage
        ? "done"
        : index === currentStage
          ? "current"
          : "upcoming",
  }))
  const detailReportInformation = [
    [
      "Kategori Permasalahan",
      report.category ?? "Tutor tidak memberikan umpan balik",
    ],
    ["Jenis Mata Kuliah", report.courseType ?? "Teori/Umum"],
    ["Kode Mata Kuliah", courseCode],
    ["Nama Mata Kuliah", courseName],
    ["Kelas Mata Kuliah", report.className],
    ["Nama Tutor", report.tutor],
    [
      "Perkiraan Durasi Tidak Ada Aktivitas/Respons",
      report.duration ?? "1 minggu atau lebih",
    ],
    ["Judul Laporan", report.title],
  ]
  const detailFollowUps =
    administratorReport?.updates ?? followUps
  const detailAttachments = report.attachments ?? [
        { name: "tangkapan-layar-diskusi-minggu-3.png", type: "PNG" },
        { name: "riwayat-aktivitas-tuton.pdf", type: "PDF" },
      ]
  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / DETAIL LAPORAN
        </p>
        <div className="mt-3 flex items-start justify-between gap-6 max-[620px]:block">
          <div>
            <h1 className="font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
              Detail Laporan
            </h1>
            <p className="mt-2 font-mono text-xs font-semibold tracking-[0.08em] text-[#005BAC]">
              ID LAPORAN: {report.id}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] max-[620px]:mt-5 ${statusBadge(report.status)}`}
          >
            {report.status.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="status-laporan"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              01 / STATUS LAPORAN
            </p>
            <h2
              id="status-laporan"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Status Laporan
            </h2>
          </div>
          <div className="p-6 max-[620px]:p-5">
            <ol className="hidden grid-cols-5 md:grid">
              {detailStatusStages.map((stage, index) => (
                <li key={stage.label} className="relative pr-4 last:pr-0">
                  <div
                    className={`absolute left-3 right-0 top-3 h-px ${
                      index === detailStatusStages.length - 1
                        ? "hidden"
                        : stage.state === "upcoming"
                          ? "bg-[#D9E2EC]"
                          : "bg-[#005BAC]"
                    }`}
                  />
                  <span
                    className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${
                      stage.state === "done"
                        ? "border-[#005BAC] bg-[#005BAC] text-white"
                        : stage.state === "current"
                          ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
                          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
                    }`}
                  >
                    {stage.state === "done" ? "✓" : index + 1}
                  </span>
                  <p
                    className={`mt-4 text-sm font-semibold ${
                      stage.state === "upcoming"
                        ? "text-[#7D8B99]"
                        : "text-[#12355B]"
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="mt-1 max-w-[130px] text-xs leading-5 text-[#52657A]">
                    {stage.time}
                  </p>
                </li>
              ))}
            </ol>
            <ol className="space-y-0 md:hidden">
              {detailStatusStages.map((stage, index) => (
                <li
                  key={stage.label}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div
                    className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                      index === detailStatusStages.length - 1
                        ? "hidden"
                        : stage.state === "upcoming"
                          ? "bg-[#D9E2EC]"
                          : "bg-[#005BAC]"
                    }`}
                  />
                  <span
                    className={`relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${
                      stage.state === "done"
                        ? "border-[#005BAC] bg-[#005BAC] text-white"
                        : stage.state === "current"
                          ? "border-[#C99C20] bg-[#F2C94C] text-[#12355B]"
                          : "border-[#B9C8D7] bg-white text-[#7D8B99]"
                    }`}
                  >
                    {stage.state === "done" ? "✓" : index + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        stage.state === "upcoming"
                          ? "text-[#7D8B99]"
                          : "text-[#12355B]"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="mt-1 text-xs text-[#52657A]">{stage.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="informasi-laporan"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              02 / DATA PENGAJUAN
            </p>
            <h2
              id="informasi-laporan"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Informasi Laporan
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1 max-[620px]:px-5">
            {detailReportInformation.map(([label, value]) => (
              <ReadOnlyItem
                key={label}
                label={label}
                value={value}
                wide={
                  label === "Perkiraan Durasi Tidak Ada Aktivitas/Respons" ||
                  label === "Judul Laporan"
                }
              />
            ))}
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="uraian"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              03 / PENJELASAN MAHASISWA
            </p>
            <h2 id="uraian" className="mt-1 font-slab text-2xl text-[#12355B]">
              Uraian Permasalahan
            </h2>
          </div>
          <div className="p-6 max-[620px]:p-5">
            <p className="max-w-3xl text-sm leading-7 text-[#1F2937]">
              {report.description ??
                "Pada kegiatan diskusi minggu ke-3, saya telah mengirimkan tanggapan sesuai topik yang ditugaskan. Namun, hingga lebih dari satu minggu belum ada umpan balik maupun penilaian dari tutor. Saya berharap ada informasi terkait kelanjutan aktivitas diskusi tersebut."}
            </p>
          </div>
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="bukti"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              04 / LAMPIRAN
            </p>
            <h2 id="bukti" className="mt-1 font-slab text-2xl text-[#12355B]">
              Bukti Pendukung
            </h2>
          </div>
          {detailAttachments.length > 0 ? (
            <ul className="divide-y divide-[#D9E2EC]">
              {detailAttachments.map(({ name, type }) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:items-start max-[620px]:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-mono text-[10px] font-semibold text-[#005BAC]">
                      {type}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-[#1F2937]">
                      {name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                  >
                    Buka
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-5 text-sm text-[#52657A] max-[620px]:px-5">
              Tidak ada bukti pendukung yang dilampirkan.
            </p>
          )}
        </section>

        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="tindak-lanjut"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              05 / PEMBARUAN PENGELOLA
            </p>
            <h2
              id="tindak-lanjut"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Tindak Lanjut
            </h2>
          </div>
          <ol className="p-6 max-[620px]:p-5">
            {detailFollowUps.map((update, index) => (
              <li
                key={update.time}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                <div
                  className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                    index === detailFollowUps.length - 1
                      ? "hidden"
                      : "bg-[#B8D3E8]"
                  }`}
                />
                <span className="relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] bg-white text-[10px] text-[#005BAC]">
                  ●
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                    {update.time}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#12355B]">
                    {update.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#52657A]">
                    {update.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="mt-8 border-t border-[#D9E2EC] pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
        >
          ← Kembali ke Riwayat Laporan
        </button>
      </div>
    </section>
  )
}

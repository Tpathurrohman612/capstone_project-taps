import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router"
import type { WorkflowReport } from "../../../shared/types/workflow"
import {
  getWorkflowReports,
  saveWorkflowReports,
} from "../../../shared/lib/workflow-storage"

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#12355B]">
        {label} <span className="text-[#005BAC]">*</span>
      </span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs leading-5 text-[#52657A]">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-2 block text-xs leading-5 text-[#B42318]">
          {error}
        </span>
      )}
    </label>
  )
}

function GuideHeading({
  number,
  id,
  title,
}: {
  number: string
  id: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#12355B] font-mono text-[10px] font-semibold text-white">
        {number}
      </span>
      <h3 id={id} className="font-slab text-lg text-[#12355B]">
        {title}
      </h3>
    </div>
  )
}

const control =
  "mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"

export function CreateReportScreen() {
  const [duration, setDuration] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [guideOpen, setGuideOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [submittedReportId, setSubmittedReportId] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const submissionPending = useRef(false)
  const navigate = useNavigate()
  const inputClass = (field: string) =>
    errors[field]
      ? `${control} !border-[#B42318] focus:!border-[#B42318] focus:!ring-[#B42318]/15`
      : control
  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []).filter(
      (file) => file.size <= 10 * 1024 * 1024,
    )
    setFiles((current) => [...current, ...incoming].slice(0, 5))
    event.target.value = ""
  }
  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || submissionComplete || submissionPending.current) return

    const data = new FormData(event.currentTarget)
    const requiredFields = [
      ["category", "Pilih kategori permasalahan."],
      ["courseType", "Pilih jenis mata kuliah."],
      ["courseCode", "Masukkan kode mata kuliah."],
      ["courseName", "Masukkan nama mata kuliah."],
      ["className", "Masukkan kelas mata kuliah."],
      ["tutor", "Masukkan nama tutor."],
      ["duration", "Pilih perkiraan durasi."],
      ["title", "Masukkan judul laporan."],
      ["description", "Masukkan uraian permasalahan."],
    ] as const
    const nextErrors = requiredFields.reduce<Record<string, string>>(
      (current, [field, message]) => {
        if (!String(data.get(field) ?? "").trim()) current[field] = message
        return current
      },
      {},
    )

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalidField = requiredFields.find(
        ([field]) => nextErrors[field],
      )?.[0]
      window.setTimeout(() => {
        document
          .getElementById(`report-${firstInvalidField}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 0)
      return
    }

    setErrors({})
    const workflowReports = getWorkflowReports()
    const nextReportNumber =
      Math.max(
        0,
        ...workflowReports.map((report) => {
          const match = report.id.match(/^LT-2026-(\d{4})$/)
          return match ? Number(match[1]) : 0
        }),
      ) + 1
    const reportId = `LT-2026-${String(nextReportNumber).padStart(4, "0")}`
    const attachmentDetails = files.map((file) => {
      const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE"
      return {
        name: file.name,
        type: extension,
        size: `${Math.max(1, Math.ceil(file.size / 1024))} KB`,
      }
    })
    const newReport: WorkflowReport = {
      id: reportId,
      title: String(data.get("title")),
      category: String(data.get("category")),
      course: `${String(data.get("courseCode"))} · ${String(data.get("courseName"))}`,
      className: String(data.get("className")),
      tutor: String(data.get("tutor")),
      submitted: "20 September 2026",
      status: "Diterima",
      courseType: String(data.get("courseType")),
      duration: String(data.get("duration")),
      description: String(data.get("description")),
      attachments: attachmentDetails,
      updates: [
        {
          time: "20 September 2026, 09:00",
          title: "Laporan diterima",
          text: "Laporan berhasil diterima oleh sistem Lapor Tuton.",
        },
      ],
    }
    saveWorkflowReports([...workflowReports, newReport])
    setSubmittedReportId(reportId)
    submissionPending.current = true
    setIsSubmitting(true)
    window.setTimeout(() => {
      submissionPending.current = false
      setIsSubmitting(false)
      setSubmissionComplete(true)
    }, 500)
  }
  return (
    <section className="px-8 py-7 max-[620px]:px-5">
      <header className="border-b border-[#D9E2EC] pb-8">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / PENGAJUAN BARU
        </p>
        <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
          Buat Laporan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52657A]">
          Sampaikan masalah yang Anda alami terkait aktivitas tutor atau layanan
          selama Tutorial Online (Tuton).
        </p>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="mt-5 border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
        >
          Panduan Pengisian
        </button>
      </header>
      <form
        className="mt-8 space-y-8"
        noValidate
        onSubmit={submitReport}
      >
        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="info-laporan"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              01 / DATA LAPORAN
            </p>
            <h2
              id="info-laporan"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Informasi Laporan
            </h2>
          </div>
          <div className="space-y-6 p-6 max-[620px]:p-5">
            <Field
              label="Kategori Permasalahan"
              error={errors.category}
            >
              <select
                id="report-category"
                name="category"
                defaultValue=""
                onChange={() => clearError("category")}
                aria-invalid={Boolean(errors.category)}
                className={inputClass("category")}
              >
                <option value="" disabled>
                  Pilih kategori permasalahan
                </option>
                <option>Aktivitas tutor</option>
                <option>Layanan tutor</option>
                <option>Materi Tutorial Online</option>
              </select>
            </Field>
            <Field label="Jenis Mata Kuliah" error={errors.courseType}>
              <select
                id="report-courseType"
                name="courseType"
                defaultValue=""
                onChange={() => clearError("courseType")}
                aria-invalid={Boolean(errors.courseType)}
                className={inputClass("courseType")}
              >
                <option value="" disabled>
                  Pilih jenis mata kuliah
                </option>
                <option>Teori/Umum</option>
                <option>Berpraktik</option>
                <option>Praktik</option>
                <option>TAPS</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-6 max-[760px]:grid-cols-1">
              <Field label="Kode Mata Kuliah" error={errors.courseCode}>
                <input
                  id="report-courseCode"
                  name="courseCode"
                  onChange={() => clearError("courseCode")}
                  aria-invalid={Boolean(errors.courseCode)}
                  className={inputClass("courseCode")}
                  placeholder="Contoh: EKMA4111"
                />
              </Field>
              <Field label="Nama Mata Kuliah" error={errors.courseName}>
                <input
                  id="report-courseName"
                  name="courseName"
                  onChange={() => clearError("courseName")}
                  aria-invalid={Boolean(errors.courseName)}
                  className={inputClass("courseName")}
                  placeholder="Masukkan nama mata kuliah"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6 max-[760px]:grid-cols-1">
              <Field label="Kelas Mata Kuliah" error={errors.className}>
                <input
                  id="report-className"
                  name="className"
                  type="number"
                  inputMode="numeric"
                  onChange={() => clearError("className")}
                  aria-invalid={Boolean(errors.className)}
                  className={inputClass("className")}
                  placeholder="Contoh: 01"
                />
              </Field>
              <Field label="Nama Tutor" error={errors.tutor}>
                <input
                  id="report-tutor"
                  name="tutor"
                  onChange={() => clearError("tutor")}
                  aria-invalid={Boolean(errors.tutor)}
                  className={inputClass("tutor")}
                  placeholder="Masukkan nama tutor"
                />
              </Field>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-[#12355B]">
                Perkiraan Durasi Tidak Ada Aktivitas/Respons{" "}
                <span className="text-[#005BAC]">*</span>
              </span>
              <select
                id="report-duration"
                name="duration"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value)
                  clearError("duration")
                }}
                aria-invalid={Boolean(errors.duration)}
                className={inputClass("duration")}
              >
                <option value="">Pilih perkiraan durasi</option>
                <option>Kurang dari 3 hari</option>
                <option>3–6 hari</option>
                <option>1 minggu atau lebih</option>
                <option>Tidak pernah aktif sama sekali</option>
                <option>Lainnya</option>
              </select>
              {duration === "Lainnya" && (
                <input
                  className={control}
                  placeholder="Jelaskan perkiraan durasi"
                />
              )}
              {errors.duration && (
                <span className="mt-2 block text-xs leading-5 text-[#B42318]">
                  {errors.duration}
                </span>
              )}
            </label>
            <Field
              label="Judul Laporan"
              hint="Tuliskan ringkasan singkat mengenai masalah yang Anda laporkan."
              error={errors.title}
            >
              <input
                id="report-title"
                name="title"
                onChange={() => clearError("title")}
                aria-invalid={Boolean(errors.title)}
                className={inputClass("title")}
                placeholder="Contoh: Tidak ada umpan balik pada diskusi minggu ke-3"
              />
            </Field>
            <Field
              label="Uraian Permasalahan"
              hint="Jelaskan masalah secara jelas berdasarkan pengalaman yang Anda alami selama Tutorial Online."
              error={errors.description}
            >
              <textarea
                id="report-description"
                name="description"
                rows={7}
                onChange={() => clearError("description")}
                aria-invalid={Boolean(errors.description)}
                className={`${inputClass("description")} resize-y`}
                placeholder="Tuliskan uraian permasalahan Anda"
              />
            </Field>
          </div>
        </section>
        <section
          className="border border-[#D9E2EC] bg-white"
          aria-labelledby="bukti-pendukung"
        >
          <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              02 / LAMPIRAN
            </p>
            <h2
              id="bukti-pendukung"
              className="mt-1 font-slab text-2xl text-[#12355B]"
            >
              Bukti Pendukung
            </h2>
          </div>
          <div className="p-6 max-[620px]:p-5">
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={addFiles}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full flex-col items-center justify-center border border-dashed border-[#8CAEC9] bg-[#F7F9FC] px-5 py-8 text-center transition hover:border-[#005BAC] hover:bg-[#EEF5FB]"
            >
              <span className="flex h-10 w-10 items-center justify-center border border-[#005BAC] text-xl text-[#005BAC]">
                ↑
              </span>
              <span className="mt-3 text-sm font-semibold text-[#12355B]">
                Unggah bukti pendukung
              </span>
              <span className="mt-1 hidden text-xs text-[#52657A] sm:block">
                Maksimal 5 file · Maksimal 10 MB per file · .jpg, .jpeg, .png,
                .pdf
              </span>
              <span className="mt-2 flex flex-col gap-1 text-xs text-[#52657A] sm:hidden">
                <span>Maksimal 5 file</span>
                <span>Maksimal 10 MB per file</span>
                <span>Format: JPG, JPEG, PNG, PDF</span>
              </span>
            </button>
            {files.length > 0 && (
              <ul className="mt-5 divide-y divide-[#D9E2EC] border-y border-[#D9E2EC]">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-4 px-3 py-3"
                  >
                    <span className="min-w-0 truncate text-sm text-[#1F2937]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC]"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <div className="flex justify-end gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || submissionComplete}
            className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004784] focus:outline-2 focus:outline-offset-2 focus:outline-[#005BAC] disabled:cursor-not-allowed disabled:bg-[#7D8B99]"
          >
            {isSubmitting
              ? "Mengirim Laporan..."
              : submissionComplete
                ? "Laporan Terkirim"
                : "Kirim Laporan"}
          </button>
        </div>
      </form>
      {submissionComplete && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-success-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              LAPORAN BERHASIL DIBUAT
            </p>
            <h2
              id="submission-success-title"
              className="mt-3 font-slab text-2xl text-[#12355B]"
            >
              Laporan Berhasil Dikirim
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Laporan Anda telah dicatat pada prototype Lapor Tuton dan siap
              untuk ditindaklanjuti.
            </p>
            <p className="mt-5 border border-[#B8D3E8] bg-[#EEF5FB] px-4 py-3 font-mono text-sm font-semibold text-[#005BAC]">
              ID LAPORAN: {submittedReportId}
            </p>
            <p className="mt-4 text-xs leading-5 text-[#52657A]">
              Konfirmasi ini menggunakan data mock untuk prototype dan tidak
              mengirim laporan ke sistem produksi.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => setSubmissionComplete(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/riwayat-laporan/detail-laporan?report=${submittedReportId}`,
                  )
                }
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Lihat Laporan
              </button>
            </div>
          </div>
        </div>
      )}
      {guideOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#12355B]/30 p-4 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filling-guide-title"
        >
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden border-2 border-[#12355B] bg-white shadow-[8px_8px_0_#12355B] sm:max-h-[calc(100dvh-2.5rem)]">
            <div className="shrink-0 border-b border-[#D9E2EC] bg-[#EEF5FB] px-5 py-5 sm:px-7">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                PANDUAN PENGISIAN
              </p>
              <h2
                id="filling-guide-title"
                className="mt-2 font-slab text-2xl text-[#12355B] sm:text-[28px]"
              >
                Panduan Pengisian Laporan
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52657A]">
                Gunakan panduan ini untuk mengisi laporan sesuai kondisi yang
                Anda alami selama Tutorial Online (Tuton).
              </p>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
              <div className="space-y-7 text-[15px] leading-7 text-[#1F2937] sm:text-base">
                <section aria-labelledby="guide-category">
                  <GuideHeading
                    number="01"
                    id="guide-category"
                    title="Kategori Permasalahan"
                  />
                  <p className="mt-3">
                    Pilih kategori yang paling mendekati masalah yang benar-benar
                    Anda alami.
                  </p>
                  <ul className="mt-3 space-y-2 border-l-2 border-[#B8D3E8] pl-4">
                    <li>
                      <strong>Aktivitas tutor</strong> mencakup kegiatan tutor
                      dalam Tuton, misalnya tanggapan pada forum atau umpan
                      balik pembelajaran.
                    </li>
                    <li>
                      <strong>Layanan tutor</strong> mencakup layanan atau
                      respons tutor yang berkaitan dengan kelas Anda.
                    </li>
                    <li>
                      <strong>Materi Tutorial Online</strong> mencakup kendala
                      pada materi yang tersedia di Tuton.
                    </li>
                  </ul>
                </section>

                <section aria-labelledby="guide-course-type">
                  <GuideHeading
                    number="02"
                    id="guide-course-type"
                    title="Jenis Mata Kuliah"
                  />
                  <p className="mt-3">
                    Pilih jenis mata kuliah yang sesuai dengan informasi mata
                    kuliah Anda: <strong>Teori/Umum</strong>,{" "}
                    <strong>Berpraktik</strong>, <strong>Praktik</strong>, atau{" "}
                    <strong>TAPS</strong>. Jika ragu, periksa informasi yang
                    tersedia di Tuton atau informasi akademik mata kuliah Anda.
                  </p>
                </section>

                <section aria-labelledby="guide-course-identity">
                  <GuideHeading
                    number="03"
                    id="guide-course-identity"
                    title="Kode Mata Kuliah dan Nama Mata Kuliah"
                  />
                  <p className="mt-3">
                    Isi kode dan nama mata kuliah yang sama dengan mata kuliah
                    tempat masalah terjadi. Rujuk informasi mata kuliah resmi
                    yang tersedia untuk Anda; jangan menebak kode atau nama mata
                    kuliah.
                  </p>
                </section>

                <section aria-labelledby="guide-class">
                  <GuideHeading
                    number="04"
                    id="guide-class"
                    title="Kelas Mata Kuliah"
                  />
                  <p className="mt-3">
                    Masukkan kelas yang benar-benar Anda ikuti berdasarkan
                    informasi yang ditampilkan di Tuton. Contohnya, masukkan
                    “01” hanya jika itu adalah kelas Anda.
                  </p>
                </section>

                <section aria-labelledby="guide-tutor">
                  <GuideHeading number="05" id="guide-tutor" title="Nama Tutor" />
                  <p className="mt-3">
                    Isi nama tutor yang bertanggung jawab atas mata kuliah atau
                    kelas yang Anda laporkan. Jangan memasukkan nama Anda sendiri
                    pada kolom ini.
                  </p>
                </section>

                <section aria-labelledby="guide-duration">
                  <GuideHeading
                    number="06"
                    id="guide-duration"
                    title="Perkiraan Durasi Tidak Ada Aktivitas/Respons"
                  />
                  <p className="mt-3">
                    Perkirakan berapa lama tutor tidak aktif atau belum memberi
                    respons berdasarkan pengalaman Anda. Pilih opsi yang paling
                    sesuai pada daftar yang tersedia. Anda tidak perlu
                    menyebutkan durasi tepat apabila tidak mengetahuinya.
                  </p>
                </section>

                <section aria-labelledby="guide-title">
                  <GuideHeading number="07" id="guide-title" title="Judul Laporan" />
                  <p className="mt-3">
                    Buat judul yang singkat, spesifik, dan langsung menjelaskan
                    masalah. Contohnya:
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    <li>“Belum ada tanggapan pada forum inisiasi”</li>
                    <li>“Umpan balik tugas belum tersedia”</li>
                    <li>“Materi Tutorial Online tidak dapat diakses”</li>
                  </ul>
                </section>

                <section aria-labelledby="guide-description">
                  <GuideHeading
                    number="08"
                    id="guide-description"
                    title="Uraian Permasalahan"
                  />
                  <p className="mt-3">
                    Jelaskan masalah dengan bahasa yang jelas. Sertakan apa yang
                    terjadi, mata kuliah atau aktivitas Tuton yang terdampak,
                    kapan atau berapa lama masalah terjadi jika diketahui,
                    dampaknya pada kegiatan belajar Anda, serta langkah yang
                    sudah dilakukan apabila ada.
                  </p>
                  <div className="mt-4 border border-[#B8D3E8] bg-[#EEF5FB] px-4 py-4">
                    <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#005BAC]">
                      CONTOH URAIAN
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-[#12355B] sm:text-base">
                      “Pada mata kuliah yang saya ikuti, belum terdapat
                      tanggapan dari tutor pada forum diskusi setelah saya
                      menunggu selama beberapa hari. Kondisi tersebut membuat
                      saya belum memperoleh umpan balik untuk melanjutkan
                      diskusi.”
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#52657A]">
                    Contoh ini hanya sebagai panduan. Sesuaikan uraian dengan
                    keadaan Anda yang sebenarnya; jangan membuat fakta atau
                    memasukkan informasi yang tidak dapat Anda pastikan.
                  </p>
                </section>

                <section aria-labelledby="guide-evidence">
                  <GuideHeading
                    number="09"
                    id="guide-evidence"
                    title="Bukti Pendukung"
                  />
                  <p className="mt-3">
                    Jika tersedia, lampirkan tangkapan layar atau dokumen yang
                    relevan dengan masalah yang dilaporkan. Pastikan bukti
                    berkaitan dengan laporan dan tidak membuka informasi pribadi
                    lain yang tidak diperlukan.
                  </p>
                  <ul className="mt-3 grid gap-2 border border-[#D9E2EC] bg-[#F7F9FC] p-4 text-sm leading-6 sm:grid-cols-3">
                    <li>
                      <strong>Maksimal:</strong> 5 file
                    </li>
                    <li>
                      <strong>Ukuran:</strong> 10 MB per file
                    </li>
                    <li>
                      <strong>Format:</strong> JPG, JPEG, PNG, dan PDF
                    </li>
                  </ul>
                </section>

                <section aria-labelledby="guide-review">
                  <GuideHeading
                    number="10"
                    id="guide-review"
                    title="Pemeriksaan Sebelum Mengirim"
                  />
                  <p className="mt-3">
                    Sebelum mengirim, periksa kembali hal-hal berikut:
                  </p>
                  <ul className="mt-3 space-y-2 border-l-2 border-[#005BAC] pl-4">
                    <li>Kategori permasalahan sudah sesuai.</li>
                    <li>
                      Jenis dan identitas mata kuliah, kelas, serta tutor sudah
                      benar.
                    </li>
                    <li>
                      Judul dan uraian menjelaskan permasalahan dengan jelas.
                    </li>
                    <li>
                      Bukti pendukung sudah dilampirkan apabila tersedia dan
                      relevan.
                    </li>
                    <li>Seluruh informasi sudah diperiksa kembali.</li>
                  </ul>
                  <p className="mt-4">
                    Setelah laporan dikirim, baca konfirmasi pengiriman dan
                    simpan ID laporan Anda. ID tersebut dapat digunakan untuk
                    memantau perkembangan laporan melalui Dashboard, Riwayat
                    Laporan, atau Detail Laporan.
                  </p>
                </section>
              </div>
            </div>
            <div className="flex shrink-0 justify-end border-t border-[#D9E2EC] bg-white px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { statusStages } from '../data/detail-report'
import { useStudentReports } from '../lib/use-student-reports'
import {
  fetchAttachments,
  fetchPenanganan,
  fetchReportUpdates,
} from '../../../shared/data/report-store'
import type { Penanganan } from '../../../shared/data/laporan-repository'
import { formatIndonesianDateTime } from '../../../shared/lib/date-time'
import { statusBadge } from '../lib/status-badge'
import { getWorkflowReports } from '../../../shared/lib/workflow-storage'
import { ringkasanStatus } from '../../../shared/lib/ringkasan-status'
import { waktuTahap } from '../../../shared/lib/waktu-tahap'
import { alasanStatus, kelengkapanTerakhir } from '../../../shared/lib/alasan-status'
import { ReadOnlyItem } from '../../../shared/components/ReadOnlyItem'
import { STATUS_META, type ReportStatus } from '../../../shared/domain/report-status'
import type { WorkflowReport } from '../../../shared/types/workflow'

export function DetailReportScreen() {
  const { riwayat, reports, memuat: memuatLaporan } = useStudentReports()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedReportId = new URLSearchParams(location.search).get('report')
  // Jangan pernah jatuh ke rekaman contoh. Sebelumnya laporan yang tidak
  // ditemukan diganti historyReports[0], sehingga halaman menampilkan laporan
  // milik data demo lengkap dengan nama tutor dan lampirannya seolah itu
  // laporan pengguna. Kegagalan yang terlihat jauh lebih baik daripada data
  // palsu yang meyakinkan.
  // Seluruh hook wajib dipanggil tanpa syarat dan mendahului setiap return,
  // sehingga urutannya tetap sama pada setiap render. Menempatkannya setelah
  // penjaga "laporan tidak ditemukan" membuat React melihat jumlah hook yang
  // berubah-ubah dan menghentikan aplikasi.
  const laporanPenuh = reports.find((item) => item.id === selectedReportId)
  const administratorReport =
    laporanPenuh ?? getWorkflowReports().find((item) => item.id === selectedReportId)

  const [attachments, setAttachments] = useState<
    { name: string; type: string; size?: string; url?: string }[]
  >([])

  /** Gambar yang sedang dibuka besar. Null berarti tidak ada yang dibuka. */
  const [pratinjau, setPratinjau] = useState<{ nama: string; url: string } | null>(null)

  /**
   * Riwayat perubahan status laporan.
   *
   * Daftar laporan tidak membawa riwayatnya, karena menariknya pada setiap
   * pembacaan daftar akan menggandakan biaya tanpa ada yang memakainya. Di
   * layar ini riwayatnya justru yang ditampilkan, sehingga dibaca terpisah.
   */
  const [riwayatStatus, setRiwayatStatus] = useState<WorkflowReport['updates']>([])

  /**
   * Catatan penanganan dari Administrator.
   *
   * Riwayat status menjawab kapan laporan berpindah; catatan inilah yang
   * menjawab apa hasilnya. Mahasiswa sebelumnya hanya dapat membacanya pada
   * panel notifikasi, padahal halaman detail laporannya sendiri yang dibuka
   * ketika ingin mengetahui perkembangan.
   */
  const [penanganan, setPenanganan] = useState<Penanganan>({
    pengiriman: [],
    validasi: [],
    tindakLanjut: [],
  })

  useEffect(() => {
    let aktif = true

    fetchAttachments(administratorReport)
      .then((hasil) => {
        if (aktif) setAttachments(hasil)
      })
      .catch(() => {
        // Gagal membaca bukti pendukung tidak boleh mengosongkan laporannya.
        if (aktif) setAttachments([])
      })

    return () => {
      aktif = false
    }
  }, [administratorReport])

  useEffect(() => {
    let aktif = true

    fetchReportUpdates(administratorReport)
      .then((hasil) => {
        if (aktif) setRiwayatStatus(hasil)
      })
      .catch(() => {
        // Gagal membaca riwayat tidak boleh mengosongkan seluruh halaman.
        if (aktif) setRiwayatStatus([])
      })

    return () => {
      aktif = false
    }
  }, [administratorReport])

  useEffect(() => {
    let aktif = true

    fetchPenanganan(administratorReport)
      .then((hasil) => {
        if (aktif) setPenanganan(hasil)
      })
      .catch(() => {
        if (aktif) setPenanganan({ pengiriman: [], validasi: [], tindakLanjut: [] })
      })

    return () => {
      aktif = false
    }
  }, [administratorReport])

  const report = riwayat.find((item) => item.id === selectedReportId)

  if (!report) {
    return (
      <section className="px-8 py-10 max-[620px]:px-5">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
          LAPORAN / DETAIL LAPORAN
        </p>
        <h1 className="mt-3 font-slab text-[32px] tracking-[-0.035em] text-[#12355B]">
          {memuatLaporan ? 'Memuat laporan…' : 'Laporan tidak ditemukan'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#52657A]">
          {memuatLaporan
            ? 'Mengambil laporan Anda dari basis data.'
            : `Laporan ${selectedReportId ?? ''} tidak ada pada riwayat Anda.`}
        </p>
        {!memuatLaporan && (
          <button
            type="button"
            onClick={() => navigate('/riwayat-laporan')}
            className="mt-7 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
          >
            Kembali ke Riwayat Laporan
          </button>
        )}
      </section>
    )
  }

  const [courseCode, courseName] = report.course.split(' · ')

  // Lini masa menampilkan lima tahap alur utama. Dua status percabangan
  // dipetakan ke tahap tempat percabangan itu terjadi: keduanya bercabang dari
  // Menunggu Pemeriksaan, sehingga keduanya berhenti di tahap 0. Record ditulis lengkap
  // dan bertipe, agar penambahan status pada Tabel 4.1 memunculkan galat
  // kompilasi di sini daripada diam-diam menghasilkan nilai undefined.
  const stageByStatus: Record<ReportStatus, number> = {
    'Menunggu Pemeriksaan': 0,
    'Perlu Dilengkapi': 0,
    Ditolak: 0,
    'Lolos Pemeriksaan': 1,
    'Diteruskan ke Fakultas': 2,
    Ditindaklanjuti: 3,
    Selesai: 4,
  }
  const currentStage = stageByStatus[report.status]

  /** Status sekarang beserta apa yang terjadi berikutnya. */
  const ringkasan = ringkasanStatus(report.status)
  const timelineTime = (label: string, index: number) =>
    waktuTahap({
      riwayat: riwayatStatus,
      status: label,
      indeks: index,
      tahapSekarang: currentStage,
    })
  const detailStatusStages = statusStages.map((stage, index) => ({
    ...stage,
    time: timelineTime(stage.label, index),
    arti: STATUS_META[stage.label as ReportStatus]?.arti ?? '',
    // Laporan yang ditolak berhenti pada tahap tempatnya ditolak. Menandainya
    // sebagai tahap berjalan membuat lini status terbaca seolah laporan masih
    // diproses, padahal tidak ada lagi yang akan terjadi.
    state:
      report.status === 'Ditolak'
        ? index === currentStage
          ? 'rejected'
          : 'upcoming'
        : index < currentStage
          ? 'done'
          : index === currentStage
            ? 'current'
            : 'upcoming',
  }))
  const detailReportInformation = [
    ['Kategori Permasalahan', report.category ?? 'Tutor tidak memberikan umpan balik'],
    ['Jenis Mata Kuliah', report.courseType ?? 'Teori/Umum'],
    ['Kode Mata Kuliah', courseCode],
    ['Nama Mata Kuliah', courseName],
    ['Kelas Mata Kuliah', report.className],
    ['Nama Tutor', report.tutor],
    ['Perkiraan Durasi Tidak Ada Aktivitas/Respons', report.duration ?? '1 minggu atau lebih'],
    ['Judul Laporan', report.title],
  ]
  // Tidak ada lagi penggantian dengan rekaman contoh. Laporan yang belum
  // memiliki tindak lanjut atau bukti pendukung ditampilkan apa adanya sebagai
  // kosong, karena menampilkan berkas dan catatan milik data demo membuat
  // pengguna mengira unggahannya tersimpan padahal tidak.
  const detailFollowUps = riwayatStatus

  /** Alasan Administrator untuk status laporan sekarang, bila ada. */
  const alasanAdministrator = alasanStatus(riwayatStatus, report.status)

  /** Kelengkapan terakhir yang dikirim mahasiswa. */
  const kelengkapan = kelengkapanTerakhir(riwayatStatus)
  const detailAttachments = attachments
  return (
    <>
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
          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="status-laporan">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                01 / STATUS LAPORAN
              </p>
              <h2 id="status-laporan" className="mt-1 font-slab text-2xl text-[#12355B]">
                Status Laporan
              </h2>
            </div>
            <div className="p-6 max-[620px]:p-5">
              {/* Lini tahap menunjukkan di mana laporan berada, tetapi tidak
                  menjawab pertanyaan yang sebenarnya diajukan: siapa yang sedang
                  memegang laporan saya, dan apa yang terjadi berikutnya. Penjelasan
                  Tabel 4.1 sudah ada sejak awal, hanya tidak pernah ditampilkan. */}
              <div className="mb-7 border border-[#B8D3E8] bg-[#EEF5FB] px-5 py-4">
                <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
                  STATUS SEKARANG
                </p>
                <p className="mt-2 font-slab text-xl text-[#12355B]">{ringkasan.status}</p>
                <p className="mt-1 text-sm leading-6 text-[#1F2937]">{ringkasan.arti}</p>
                {ringkasan.selanjutnya ? (
                  <p className="mt-3 border-t border-[#B8D3E8] pt-3 text-sm leading-6 text-[#52657A]">
                    <span className="font-semibold text-[#12355B]">Selanjutnya: </span>
                    {ringkasan.selanjutnya}
                  </p>
                ) : null}
              </div>

              <ol className="hidden grid-cols-5 md:grid">
                {detailStatusStages.map((stage, index) => (
                  <li key={stage.label} className="relative pr-4 last:pr-0">
                    <div
                      className={`absolute left-3 right-0 top-3 h-px ${
                        index === detailStatusStages.length - 1
                          ? 'hidden'
                          : stage.state === 'upcoming'
                            ? 'bg-[#D9E2EC]'
                            : 'bg-[#005BAC]'
                      }`}
                    />
                    <span
                      className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${
                        stage.state === 'rejected'
                          ? 'border-[#B42318] bg-[#B42318] text-white'
                          : stage.state === 'done'
                            ? 'border-[#005BAC] bg-[#005BAC] text-white'
                            : stage.state === 'current'
                              ? 'border-[#C99C20] bg-[#F2C94C] text-[#12355B]'
                              : 'border-[#B9C8D7] bg-white text-[#7D8B99]'
                      }`}
                    >
                      {stage.state === 'rejected' ? '✕' : stage.state === 'done' ? '✓' : index + 1}
                    </span>
                    <p
                      className={`mt-4 text-sm font-semibold ${
                        stage.state === 'upcoming' ? 'text-[#7D8B99]' : 'text-[#12355B]'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#52657A]">{stage.arti}</p>
                    <p className="mt-1 max-w-[130px] text-xs leading-5 text-[#52657A]">
                      {stage.time}
                    </p>
                  </li>
                ))}
              </ol>
              <ol className="space-y-0 md:hidden">
                {detailStatusStages.map((stage, index) => (
                  <li key={stage.label} className="relative flex gap-4 pb-6 last:pb-0">
                    <div
                      className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                        index === detailStatusStages.length - 1
                          ? 'hidden'
                          : stage.state === 'upcoming'
                            ? 'bg-[#D9E2EC]'
                            : 'bg-[#005BAC]'
                      }`}
                    />
                    <span
                      className={`relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${
                        stage.state === 'rejected'
                          ? 'border-[#B42318] bg-[#B42318] text-white'
                          : stage.state === 'done'
                            ? 'border-[#005BAC] bg-[#005BAC] text-white'
                            : stage.state === 'current'
                              ? 'border-[#C99C20] bg-[#F2C94C] text-[#12355B]'
                              : 'border-[#B9C8D7] bg-white text-[#7D8B99]'
                      }`}
                    >
                      {stage.state === 'rejected' ? '✕' : stage.state === 'done' ? '✓' : index + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          stage.state === 'upcoming' ? 'text-[#7D8B99]' : 'text-[#12355B]'
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#52657A]">{stage.arti}</p>
                      <p className="mt-1 text-xs text-[#52657A]">{stage.time}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Jalur DET --> LENG pada Gambar 3.6. Ditempatkan di dalam
                    bagian status, bukan di kaki halaman, karena statusnya
                    sendiri yang menerangkan mengapa tombol ini ada; di kaki
                    halaman tombol itu terlewat tanpa pernah terbaca. */}
              {report.status === 'Perlu Dilengkapi' && (
                <div className="mt-6 border-t border-[#D9E2EC] pt-5">
                  <p className="text-sm font-semibold text-[#12355B]">
                    Administrator meminta kelengkapan
                  </p>
                  {alasanAdministrator ? (
                    <p className="mt-2 border-l-2 border-[#C9A227] bg-[#FDF8EC] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#1F2937]">
                      {alasanAdministrator}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm leading-6 text-[#52657A]">
                    Laporan akan kembali masuk antrean verifikasi setelah kelengkapannya dikirim.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/riwayat-laporan/lengkapi-laporan?report=${report.id}`)
                    }
                    className="mt-4 inline-flex items-center gap-3 bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004987]"
                  >
                    Lengkapi Laporan
                  </button>
                </div>
              )}

              {/* Laporan yang ditolak tidak dapat ditindaklanjuti mahasiswa,
                    tetapi alasannya tetap harus terbaca. Tanpa ini mahasiswa
                    hanya melihat laporannya berhenti tanpa penjelasan. */}
              {report.status === 'Ditolak' && (
                <div className="mt-6 border-t border-[#D9E2EC] pt-5">
                  <p className="text-sm font-semibold text-[#12355B]">Laporan ditolak</p>
                  {alasanAdministrator ? (
                    <p className="mt-2 border-l-2 border-[#B42318] bg-[#FDF0EF] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#1F2937]">
                      {alasanAdministrator}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-[#52657A]">
                    Laporan tidak diproses lebih lanjut. Bila keberatan, sampaikan melalui kanal
                    layanan mahasiswa.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="informasi-laporan">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                02 / DATA PENGAJUAN
              </p>
              <h2 id="informasi-laporan" className="mt-1 font-slab text-2xl text-[#12355B]">
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
                    label === 'Perkiraan Durasi Tidak Ada Aktivitas/Respons' ||
                    label === 'Judul Laporan'
                  }
                />
              ))}
            </div>
          </section>

          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="uraian">
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
                  'Pada kegiatan diskusi minggu ke-3, saya telah mengirimkan tanggapan sesuai topik yang ditugaskan. Namun, hingga lebih dari satu minggu belum ada umpan balik maupun penilaian dari tutor. Saya berharap ada informasi terkait kelanjutan aktivitas diskusi tersebut.'}
              </p>
            </div>
          </section>

          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="bukti">
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
                {detailAttachments.map(({ name, type, size, url }) => {
                  const gambar = url !== undefined && url.startsWith('data:image/')

                  return (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-5 px-6 py-4 max-[620px]:items-start max-[620px]:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Pratinjau kecil untuk gambar, agar isi bukti dapat
                            dikenali tanpa membukanya satu per satu. */}
                        {gambar ? (
                          <img
                            src={url}
                            alt={`Pratinjau ${name}`}
                            className="h-12 w-12 shrink-0 border border-[#B8D3E8] object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-mono text-[10px] font-semibold text-[#005BAC]">
                            {type}
                          </span>
                        )}
                        <span className="min-w-0 truncate text-sm font-medium text-[#1F2937]">
                          {name}
                          {size ? (
                            <span className="ml-2 text-xs font-normal text-[#52657A]">{size}</span>
                          ) : null}
                        </span>
                      </div>

                      {/* Tindakan hanya ditawarkan ketika berkasnya benar-benar
                          ada. Sebelumnya tombol "Buka" selalu ditampilkan padahal
                          tidak memiliki penangan apa pun. */}
                      {url === undefined ? (
                        <span
                          className="shrink-0 text-xs text-[#52657A]"
                          title="Berkas belum diunggah ke penyimpanan. Sistem baru mencatat keterangan berkasnya."
                        >
                          Berkas belum tersimpan
                        </span>
                      ) : gambar ? (
                        <button
                          type="button"
                          onClick={() => setPratinjau({ nama: name, url })}
                          className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                        >
                          Lihat
                        </button>
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          download={name}
                          className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                        >
                          Unduh
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="px-6 py-5 text-sm text-[#52657A] max-[620px]:px-5">
                Tidak ada bukti pendukung yang dilampirkan.
              </p>
            )}
          </section>

          {/* Hasil penanganan dari Administrator. Sebelumnya mahasiswa hanya
              dapat membacanya pada panel notifikasi, padahal halaman inilah yang
              dibuka ketika ingin mengetahui perkembangan laporannya. */}
          {(penanganan.validasi.length > 0 || penanganan.tindakLanjut.length > 0) && (
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="hasil-penanganan"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  05 / HASIL PENANGANAN
                </p>
                <h2 id="hasil-penanganan" className="mt-1 font-slab text-2xl text-[#12355B]">
                  Hasil Validasi dan Tindak Lanjut
                </h2>
              </div>
              <div className="divide-y divide-[#D9E2EC]">
                {penanganan.validasi.map((item, index) => (
                  <div key={`validasi-${index}`} className="px-6 py-5 max-[620px]:px-5">
                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                      HASIL VALIDASI
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#1F2937]">
                      {item.hasil_validasi}
                    </p>
                    {item.keterangan ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#52657A]">
                        {item.keterangan}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-[#52657A]">
                      Dicatat oleh {item.unit_validator || 'Fakultas/Unit terkait'}
                      {item.tanggal ? ` · ${formatIndonesianDateTime(item.tanggal)}` : ''}
                    </p>
                  </div>
                ))}
                {penanganan.tindakLanjut.map((item, index) => (
                  <div key={`tindak-${index}`} className="px-6 py-5 max-[620px]:px-5">
                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                      TINDAK LANJUT
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#1F2937]">
                      {item.keterangan}
                    </p>
                    {item.tanggal ? (
                      <p className="mt-2 text-xs text-[#52657A]">
                        {formatIndonesianDateTime(item.tanggal)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kelengkapan yang dikirim mahasiswa. Tersimpan sebagai keterangan
              riwayat, sehingga tanpa bagian ini ia hanya terbaca sebagai satu baris
              pada lini masa dan bercampur dengan catatan Administrator. Dipisahkan
              dari uraian permasalahan karena ditulis pada waktu dan untuk keperluan
              yang berbeda. */}
          {kelengkapan && (
            <section
              className="border border-[#D9E2EC] bg-white"
              aria-labelledby="kelengkapan-laporan"
            >
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  KELENGKAPAN DARI MAHASISWA
                </p>
                <h2 id="kelengkapan-laporan" className="mt-1 font-slab text-2xl text-[#12355B]">
                  Informasi Tambahan
                </h2>
              </div>
              <div className="px-6 py-5 max-[620px]:px-5">
                <p className="text-sm leading-6 whitespace-pre-wrap text-[#1F2937]">
                  {kelengkapan.penjelasan}
                </p>
                <p className="mt-2 text-xs text-[#52657A]">Diperbarui {kelengkapan.waktu}</p>
              </div>
            </section>
          )}

          <section className="border border-[#D9E2EC] bg-white" aria-labelledby="tindak-lanjut">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4 max-[620px]:px-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                05 / PEMBARUAN PENGELOLA
              </p>
              <h2 id="tindak-lanjut" className="mt-1 font-slab text-2xl text-[#12355B]">
                Tindak Lanjut
              </h2>
            </div>
            {/* Laporan yang belum ditangani ditandai demikian. Kotak kosong
                tanpa keterangan terbaca seperti tampilan yang gagal dimuat. */}
            {detailFollowUps.length === 0 ? (
              <p className="text-sm leading-6 text-[#52657A]">
                Belum ada tindak lanjut dari pengelola.
              </p>
            ) : (
              <ol className="p-6 max-[620px]:p-5">
                {detailFollowUps.map((update, index) => (
                  <li key={update.time} className="relative flex gap-4 pb-7 last:pb-0">
                    <div
                      className={`absolute left-3 top-6 h-[calc(100%-24px)] w-px ${
                        index === detailFollowUps.length - 1 ? 'hidden' : 'bg-[#B8D3E8]'
                      }`}
                    />
                    <span className="relative z-1 flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] bg-white text-[10px] text-[#005BAC]">
                      ●
                    </span>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.08em] text-[#52657A]">
                        {update.time}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-[#12355B]">{update.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#52657A]">
                        {update.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#D9E2EC] pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-3 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
          >
            ← Kembali ke Riwayat Laporan
          </button>
        </div>
      </section>

      {/* Pratinjau gambar ukuran penuh. Dibuka dari daftar bukti pendukung
            agar mahasiswa dapat memeriksa kembali berkas yang dikirimnya tanpa
            meninggalkan halaman. */}
      {pratinjau && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${pratinjau.nama}`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#12355B]/70 p-5"
          onClick={() => setPratinjau(null)}
        >
          <div
            className="flex max-h-full w-full max-w-3xl flex-col border-2 border-white bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#D9E2EC] px-5 py-3">
              <p className="min-w-0 truncate text-sm font-medium text-[#12355B]">
                {pratinjau.nama}
              </p>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={pratinjau.url}
                  download={pratinjau.nama}
                  className="border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC] hover:border-[#12355B] hover:text-[#12355B]"
                >
                  Unduh
                </a>
                <button
                  type="button"
                  onClick={() => setPratinjau(null)}
                  className="border border-[#12355B] px-3 py-1.5 text-xs font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-auto bg-[#F7F9FC] p-4">
              <img
                src={pratinjau.url}
                alt={pratinjau.nama}
                className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

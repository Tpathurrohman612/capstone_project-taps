import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { WorkflowReport, WorkflowStatus } from '../../../shared/types/workflow'
import { isTerminal, nextStatuses } from '../../../shared/domain/report-status'
import { judulRiwayat } from '../../../shared/lib/waktu-tahap'
import { fetchPelapor } from '../../../shared/data/report-store'
import type { IdentitasPelapor } from '../../../shared/data/laporan-repository'
import { useAdminReports } from '../lib/use-admin-reports'
import { fetchAttachments, fetchReportUpdates } from '../../../shared/data/report-store'
import { AdminWorkflowShell, workflowStatusClass } from '../components/workflow-ui'
import { ReadOnlyItem } from '../../../shared/components/ReadOnlyItem'
import { kelengkapanTerakhir } from '../../../shared/lib/alasan-status'

export function AdminWorkflowDetailScreen() {
  const [modalOpen, setModalOpen] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationResult, setValidationResult] = useState('')
  const [validationNote, setValidationNote] = useState('')
  const [validationError, setValidationError] = useState('')
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [completionResult, setCompletionResult] = useState('')
  const [completionError, setCompletionError] = useState('')
  /** Pesan kegagalan tindakan. Dideklarasikan bersama hook lain, karena hook
   * wajib dipanggil tanpa syarat dan mendahului setiap return. */
  const [aksiError, setAksiError] = useState('')

  /** Cabang penanganan yang sedang dikonfirmasi: ditolak atau minta kelengkapan. */
  const [cabang, setCabang] = useState<'Ditolak' | 'Perlu Dilengkapi' | null>(null)
  const [cabangAlasan, setCabangAlasan] = useState('')
  const [cabangError, setCabangError] = useState('')

  /**
   * Riwayat perubahan status laporan.
   *
   * Daftar laporan tidak membawa riwayatnya, karena menariknya pada setiap
   * pembacaan daftar akan menggandakan biaya tanpa ada yang memakainya. Di
   * layar ini riwayatnya justru yang ditampilkan, sehingga dibaca terpisah.
   */
  const [riwayatStatus, setRiwayatStatus] = useState<WorkflowReport['updates']>([])

  /**
   * Identitas pelapor.
   *
   * Administrator sebelumnya tidak dapat mengetahui siapa yang melapor sama
   * sekali, padahal ia yang memverifikasi kelayakan laporannya dan
   * meneruskannya ke Fakultas. Dokumen laporan hanya menyimpan uid_pelapor,
   * sehingga identitasnya dibaca terpisah dari koleksi pengguna.
   */
  const [pelapor, setPelapor] = useState<IdentitasPelapor | undefined>(undefined)

  const [lampiran, setLampiran] = useState<
    { name: string; type: string; size?: string; url?: string }[]
  >([])

  /** Gambar yang sedang dibuka besar. Null berarti tidak ada yang dibuka. */
  const [pratinjau, setPratinjau] = useState<{ nama: string; url: string } | null>(null)
  const navigate = useNavigate()
  const context =
    window.sessionStorage.getItem('adminDetailContext') === 'history' ? 'history' : 'queue'
  const id = window.sessionStorage.getItem('adminDetailId') ?? 'LT-2026-0008'
  const { reports: semuaLaporan, memuat: memuatLaporan, ubahStatus } = useAdminReports()

  // Laporan diambil dari daftar bersama, bukan disalin ke state tersendiri.
  // Menyalinnya membuat tampilan tertinggal setiap kali statusnya berubah,
  // karena salinannya tidak ikut diperbarui saat daftar dibaca ulang.
  // Jangan pernah jatuh ke laporan contoh. Menggantinya dengan workflowSeed[0]
  // membuat layar menampilkan laporan milik data demo lengkap dengan statusnya,
  // dan setiap tindakan yang dilakukan di sana mengenai laporan yang keliru.
  const report = semuaLaporan.find((item) => item.id === id)

  useEffect(() => {
    let aktif = true

    fetchReportUpdates(report)
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
  }, [report])

  useEffect(() => {
    let aktif = true

    fetchPelapor(report)
      .then((hasil) => {
        if (aktif) setPelapor(hasil)
      })
      .catch(() => {
        // Gagal membaca identitas tidak boleh menutup seluruh halaman detail.
        if (aktif) setPelapor(undefined)
      })

    return () => {
      aktif = false
    }
  }, [report])

  useEffect(() => {
    let aktif = true

    fetchAttachments(report)
      .then((hasil) => {
        if (aktif) setLampiran(hasil)
      })
      .catch(() => {
        // Gagal membaca bukti pendukung tidak boleh mengosongkan laporannya.
        if (aktif) setLampiran([])
      })

    return () => {
      aktif = false
    }
  }, [report])

  if (!memuatLaporan && !report) {
    return (
      <AdminWorkflowShell activeIndex={context === 'history' ? 2 : 1}>
        <section className="px-8 py-10 max-[620px]:px-5">
          <h1 className="font-slab text-2xl text-[#12355B]">Laporan tidak ditemukan</h1>
          <p className="mt-3 text-sm leading-6 text-[#52657A]">
            Laporan {id} tidak ada pada basis data.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                context === 'history'
                  ? '/administrator/riwayat-laporan'
                  : '/administrator/antrean-laporan',
              )
            }
            className="mt-7 border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
          >
            Kembali
          </button>
        </section>
      </AdminWorkflowShell>
    )
  }

  if (memuatLaporan || !report) {
    return (
      <AdminWorkflowShell activeIndex={context === 'history' ? 2 : 1}>
        <section className="px-8 py-10 max-[620px]:px-5">
          <p className="text-sm text-[#52657A]">Memuat laporan dari basis data…</p>
        </section>
      </AdminWorkflowShell>
    )
  }

  // Status berikutnya diturunkan dari Tabel 4.2, bukan dari peta yang ditulis
  // ulang di layar ini. Aturan pertama untuk setiap status adalah jalur utama,
  // sehingga tombol aksi mengikuti alur normal; cabang Perlu Informasi
  // Tambahan dan Ditolak dijalankan lewat tindakan tersendiri.
  const mainFlowNext = (status: WorkflowStatus): WorkflowStatus | null =>
    nextStatuses(status, 'Administrator')[0] ?? null
  /**
   * Apakah hasil validasi laporan ini sudah dicatat.
   *
   * Sebelumnya diperiksa dengan mencocokkan judul catatan riwayat terhadap
   * kalimat yang hanya ada pada data contoh, sehingga pada data sungguhan
   * nilainya selalu salah. Pencatatan hasil validasi memindahkan laporan ke
   * Ditindaklanjuti, dan status itulah penandanya.
   */
  const validationRecorded = riwayatStatus.some(
    (update) => update.title === judulRiwayat('Ditindaklanjuti'),
  )

  /** Kelengkapan terakhir yang dikirim mahasiswa. */
  const kelengkapan = kelengkapanTerakhir(riwayatStatus)
  // Status akhir tidak dapat dipindahkan lagi, dan Perlu Dilengkapi
  // menunggu mahasiswa, bukan Administrator. Sebelumnya keduanya jatuh ke
  // cabang terakhir dan tetap menawarkan Perbarui Status, padahal lapisan data
  // dan aturan keamanan akan menolaknya.
  const actionLabel =
    isTerminal(report.status) || report.status === 'Perlu Dilengkapi'
      ? null
      : report.status === 'Menunggu Pemeriksaan'
        ? 'Loloskan Pemeriksaan'
        : report.status === 'Lolos Pemeriksaan'
          ? 'Teruskan ke Fakultas'
          : report.status === 'Diteruskan ke Fakultas'
            ? 'Catat Tanggapan Fakultas'
            : 'Catat Tindak Lanjut'
  const stageState = (index: number) => {
    // Ditolak bukan bagian dari lima tahap jalur utama, sehingga indexOf
    // mengembalikan -1 dan seluruh lini terbaca seolah laporan masih berjalan.
    // Laporan yang ditolak berhenti pada tahap pertama dan ditandai di situ.
    if (report.status === 'Ditolak') return index === 0 ? 'rejected' : 'upcoming'

    const level = [
      'Menunggu Pemeriksaan',
      'Lolos Pemeriksaan',
      'Diteruskan ke Fakultas',
      'Ditindaklanjuti',
      'Selesai',
    ].indexOf(report.status)
    return index === 0
      ? 'done'
      : index === level
        ? level === 0
          ? 'next'
          : 'current'
        : index < level
          ? 'done'
          : 'upcoming'
  }
  const stageClass = (state: string) =>
    state === 'rejected'
      ? 'border-[#B42318] bg-[#B42318] text-white'
      : state === 'done'
        ? 'border-[#005BAC] bg-[#005BAC] text-white'
        : state === 'current'
          ? 'border-[#C99C20] bg-[#F2C94C] text-[#12355B]'
          : state === 'next'
            ? 'border-[#005BAC] bg-white text-[#005BAC]'
            : 'border-[#B9C8D7] bg-white text-[#7D8B99]'
  const advance = async () => {
    const next = mainFlowNext(report.status)
    if (!next) return
    const title =
      next === 'Lolos Pemeriksaan'
        ? 'Laporan diverifikasi'
        : next === 'Diteruskan ke Fakultas'
          ? 'Validasi disiapkan'
          : next === 'Ditindaklanjuti' && report.status === 'Diteruskan ke Fakultas'
            ? 'Laporan memasuki proses tindak lanjut'
            : next === 'Ditindaklanjuti'
              ? 'Laporan diproses'
              : 'Laporan selesai'
    const text =
      next === 'Lolos Pemeriksaan'
        ? 'Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.'
        : next === 'Diteruskan ke Fakultas'
          ? 'Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait.'
          : next === 'Ditindaklanjuti' && report.status === 'Diteruskan ke Fakultas'
            ? 'Hasil validasi telah diterima dan dicatat. Laporan memasuki proses tindak lanjut.'
            : next === 'Ditindaklanjuti'
              ? 'Laporan diteruskan kepada pengelola Tutorial Online untuk tindak lanjut.'
              : 'Tindak lanjut telah dilakukan dan laporan dinyatakan selesai.'
    // Syarat wajib tiap perpindahan diambil dari Tabel 4.2. Unit tujuan dan
    // kanal pengiriman hanya relevan pada perpindahan ke Diteruskan ke Fakultas,
    // sehingga disertakan bersyarat daripada selalu dikirim.
    const hasil = await ubahStatus({
      report,
      ke: next,
      keterangan: `${title}. ${text}`,
      data:
        next === 'Diteruskan ke Fakultas'
          ? {
              unit_tujuan: report.studentFaculty ?? 'Fakultas/Unit terkait',
              kanal_pengiriman: 'Surel',
            }
          : next === 'Ditindaklanjuti'
            ? {
                hasil_validasi: 'Terbukti',
                unit_validator: report.studentFaculty ?? 'Fakultas/Unit terkait',
              }
            : next === 'Selesai'
              ? { tindak_lanjut: text }
              : {},
    })

    if (!hasil.berhasil) {
      // Modal ditutup lebih dulu agar pesan kegagalan di halaman terlihat.
      // Membiarkannya terbuka membuat pengguna harus menutupnya sendiri untuk
      // mengetahui apa yang salah.
      setModalOpen(false)
      setAksiError(hasil.alasan)
      return
    }

    setAksiError('')
    setModalOpen(false)
  }
  /**
   * Menjalankan cabang penolakan atau permintaan kelengkapan.
   *
   * Tabel 4.2 menetapkan alasan wajib diisi untuk keduanya, dan lapisan data
   * menolak perpindahannya bila kosong. Pemeriksaan di sini hanya agar
   * pesannya muncul sebelum permintaan dikirim.
   */
  const jalankanCabang = async () => {
    if (!cabang) return

    const alasan = cabangAlasan.trim()
    if (!alasan) {
      setCabangError('Alasan wajib diisi.')
      return
    }

    const hasil = await ubahStatus({
      report,
      ke: cabang,
      keterangan:
        cabang === 'Ditolak'
          ? `Laporan ditolak. Alasan: ${alasan}`
          : `Administrator meminta kelengkapan. Alasan: ${alasan}`,
      data: { alasan },
    })

    if (!hasil.berhasil) {
      setCabang(null)
      setCabangError('')
      setAksiError(hasil.alasan)
      return
    }

    setCabang(null)
    setCabangAlasan('')
    setCabangError('')
  }

  const recordValidation = async () => {
    const result = validationResult.trim()
    if (!result) {
      setValidationError('Hasil Validasi wajib diisi.')
      return
    }
    const note = validationNote.trim()
    const hasil = await ubahStatus({
      report,
      ke: 'Ditindaklanjuti',
      keterangan:
        `Hasil validasi dari Fakultas/Unit terkait telah dicatat. Hasil validasi: ${result}` +
        (note ? `. Catatan validasi: ${note}` : ''),
      data: {
        hasil_validasi: result,
        unit_validator: report.studentFaculty ?? 'Fakultas/Unit terkait',
      },
    })

    if (!hasil.berhasil) {
      // Kegagalan dari basis data bukan kesalahan isian, sehingga modalnya
      // ditutup dan pesannya ditampilkan di halaman. Isian yang masih kosong
      // tetap ditahan di dalam modal, karena itu memang dapat diperbaiki
      // pengguna di tempat.
      setValidationModalOpen(false)
      setValidationError('')
      setAksiError(hasil.alasan)
      return
    }

    setValidationModalOpen(false)
    setValidationResult('')
    setValidationNote('')
    setValidationError('')
  }
  const completeReport = async () => {
    const result = completionResult.trim()
    if (!result) {
      setCompletionError('Tindak Lanjut / Hasil Penanganan wajib diisi.')
      return
    }
    // Perpindahan ke Selesai menuntut tindak lanjut terisi menurut Tabel 4.2,
    // dan isian itulah yang dicatat sebagai keterangannya.
    const hasil = await ubahStatus({
      report,
      ke: 'Selesai',
      keterangan: `Laporan telah selesai ditangani. Tindak lanjut: ${result}`,
      data: { tindak_lanjut: result },
    })

    if (!hasil.berhasil) {
      setCompletionModalOpen(false)
      setCompletionError('')
      setAksiError(hasil.alasan)
      return
    }
    setCompletionModalOpen(false)
    setCompletionResult('')
    setCompletionError('')
  }
  const openPrimaryAction = () => {
    if (report.status === 'Ditindaklanjuti') {
      setCompletionError('')
      setAksiError('')
      setCompletionModalOpen(true)
      return
    }
    if (report.status === 'Diteruskan ke Fakultas' && !validationRecorded) {
      setValidationError('')
      setAksiError('')
      setValidationModalOpen(true)
      return
    }
    setModalOpen(true)
  }
  const [code, courseName = report.course] = report.course.split(' · ')
  const displayStatus = (status: WorkflowStatus) =>
    status === 'Ditindaklanjuti' ? 'Ditindaklanjuti' : status
  const labels = [
    'Menunggu Pemeriksaan',
    'Lolos Pemeriksaan',
    'Diteruskan ke Fakultas',
    'Ditindaklanjuti',
    'Selesai',
  ]
  const back =
    context === 'history' ? '/administrator/riwayat-laporan' : '/administrator/antrean-laporan'
  // Selama laporan belum tiba, layar jangan menampilkan laporan contoh dari
  // workflowSeed seolah itu laporan yang diminta.
  return (
    <AdminWorkflowShell activeIndex={context === 'history' ? 2 : 1}>
      <section className="px-8 py-7 max-[620px]:px-5">
        {/* Kegagalan tindakan ditempatkan di bagian paling atas halaman.
            Sebelumnya pesannya berada jauh di tengah daftar, sehingga
            Administrator harus menggulir untuk mengetahui apa yang salah. */}

        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / {context === 'history' ? 'RIWAYAT LAPORAN' : 'ANTREAN LAPORAN'} / DETAIL
            LAPORAN
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
              className={`inline-flex border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] ${workflowStatusClass(report.status)} max-[620px]:mt-5`}
            >
              {displayStatus(report.status).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="mt-8 space-y-8">
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                01 / STATUS LAPORAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Status Laporan</h2>
            </div>
            <div className="p-6">
              <ol className="hidden grid-cols-5 md:grid">
                {labels.map((label, index) => (
                  <li key={label} className="relative pr-4 last:pr-0">
                    <div
                      className={`absolute left-3 right-0 top-3 h-px ${
                        index === labels.length - 1
                          ? 'hidden'
                          : stageState(index) === 'done'
                            ? 'bg-[#005BAC]'
                            : 'bg-[#D9E2EC]'
                      }`}
                    />
                    <span
                      className={`relative z-1 flex h-6 w-6 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === 'rejected'
                        ? '✕'
                        : stageState(index) === 'done'
                          ? '✓'
                          : index + 1}
                    </span>
                    <p className="mt-4 text-sm font-semibold text-[#12355B]">{label}</p>
                  </li>
                ))}
              </ol>
              <ol className="space-y-4 md:hidden">
                {labels.map((label, index) => (
                  <li key={label} className="flex items-center gap-4">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[10px] font-bold ${stageClass(stageState(index))}`}
                    >
                      {stageState(index) === 'rejected'
                        ? '✕'
                        : stageState(index) === 'done'
                          ? '✓'
                          : index + 1}
                    </span>
                    <p className="text-sm font-semibold text-[#12355B]">{label}</p>
                  </li>
                ))}
              </ol>
              {/* Status akhir tidak menawarkan tindakan, tetapi tetap perlu
                  menyatakan mengapa tidak ada yang dapat dilakukan. Tanpa ini
                  bagian tindakan hilang begitu saja dan terbaca seperti
                  tampilan yang belum selesai dimuat. */}
              {isTerminal(report.status) && (
                <div className="mt-7 border-t border-[#D9E2EC] pt-5">
                  <p className="text-sm font-semibold text-[#12355B]">
                    {report.status === 'Ditolak' ? 'Laporan ditolak' : 'Laporan selesai'}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#52657A]">
                    {report.status === 'Ditolak'
                      ? 'Laporan tidak diproses lebih lanjut dan statusnya tidak dapat diubah kembali.'
                      : 'Seluruh tahap penanganan telah dilalui dan statusnya tidak dapat diubah kembali.'}
                  </p>
                </div>
              )}

              {report.status === 'Perlu Dilengkapi' && (
                <div className="mt-7 border-t border-[#D9E2EC] pt-5">
                  <p className="text-sm font-semibold text-[#12355B]">
                    Menunggu kelengkapan dari mahasiswa
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#52657A]">
                    Laporan akan kembali masuk antrean verifikasi setelah mahasiswa mengirimkan
                    kelengkapannya.
                  </p>
                </div>
              )}

              {actionLabel && (
                <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                  <div>
                    <p className="text-sm font-semibold text-[#12355B]">Tindakan Administrator</p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      {report.status === 'Menunggu Pemeriksaan'
                        ? 'Periksa informasi dan bukti pendukung sebelum melakukan verifikasi.'
                        : report.status === 'Lolos Pemeriksaan'
                          ? 'Laporan siap masuk ke proses validasi oleh Fakultas/Unit terkait.'
                          : report.status === 'Diteruskan ke Fakultas'
                            ? validationRecorded
                              ? 'Hasil validasi telah dicatat dan laporan siap diperbarui ke status Ditindaklanjuti.'
                              : 'Hasil validasi dari Fakultas/Unit terkait telah diterima dan siap dicatat.'
                            : `Laporan siap diperbarui ke status ${displayStatus(mainFlowNext(report.status) ?? 'Selesai')}.`}
                    </p>
                  </div>
                  <button
                    onClick={openPrimaryAction}
                    className="bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white max-[620px]:mt-4"
                  >
                    {actionLabel}
                  </button>
                </div>
              )}

              {/* Dua cabang pada Activity Diagram Gambar 3.2 yang sebelumnya
                    tidak memiliki tombol sama sekali. Keduanya hanya tersedia
                    pada status Menunggu Pemeriksaan, karena hanya dari situ Tabel 4.2
                    mengizinkan perpindahannya. */}
              {report.status === 'Menunggu Pemeriksaan' && (
                <div className="mt-5 flex items-center justify-between gap-5 border-t border-[#D9E2EC] pt-5 max-[620px]:block">
                  <div>
                    <p className="text-sm font-semibold text-[#12355B]">
                      Laporan belum dapat diverifikasi
                    </p>
                    <p className="mt-1 text-sm text-[#52657A]">
                      Minta kelengkapan bila informasinya kurang, atau tolak bila laporan tidak
                      memenuhi syarat. Keduanya menuntut alasan.
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 max-[620px]:mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAksiError('')
                        setCabangError('')
                        setCabang('Perlu Dilengkapi')
                      }}
                      className="border border-[#8A4B12] px-4 py-3 text-sm font-semibold text-[#8A4B12] transition hover:bg-[#8A4B12] hover:text-white"
                    >
                      Minta Kelengkapan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAksiError('')
                        setCabangError('')
                        setCabang('Ditolak')
                      }}
                      className="border border-[#B42318] px-4 py-3 text-sm font-semibold text-[#B42318] transition hover:bg-[#B42318] hover:text-white"
                    >
                      Tolak Laporan
                    </button>
                  </div>
                </div>
              )}
              {/* Kegagalan tindakan ditempatkan tepat di bawah tombolnya,
                    bukan di bagian paling atas halaman, supaya terbaca pada
                    tempat Administrator sedang memusatkan perhatian. */}
              {aksiError && (
                <p
                  role="alert"
                  className="mt-5 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-sm leading-6 text-[#B42318]"
                >
                  {aksiError}
                </p>
              )}
            </div>
          </section>
          {/* Administrator memverifikasi kelayakan laporan dan meneruskannya ke
              Fakultas, sehingga ia perlu mengetahui siapa pelapornya. Identitasnya
              tidak tersimpan pada dokumen laporan dan karena itu dibaca terpisah. */}
          {pelapor && (
            <section className="border border-[#D9E2EC] bg-white" aria-labelledby="data-pelapor">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  02 / IDENTITAS
                </p>
                <h2 id="data-pelapor" className="mt-1 font-slab text-2xl text-[#12355B]">
                  Data Pelapor
                </h2>
              </div>
              <div className="flex items-start gap-5 px-6 py-5 max-[620px]:flex-col">
                {/* Tautan fotonya milik Google dan dapat berhenti berlaku, sehingga
                    gambar yang gagal dimuat diganti inisial, bukan ikon rusak. */}
                {pelapor.fotoUrl ? (
                  <img
                    src={pelapor.fotoUrl}
                    alt={`Foto profil ${pelapor.nama || 'pelapor'}`}
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                    className="h-16 w-16 shrink-0 border border-[#B8D3E8] object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#B8D3E8] bg-[#EEF5FB] font-slab text-xl text-[#005BAC]">
                    {(pelapor.nama.trim()[0] ?? '?').toUpperCase()}
                  </span>
                )}
                <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-8 gap-y-4 max-[760px]:grid-cols-1">
                  {[
                    ['Nama Mahasiswa', pelapor.nama],
                    ['NIM', pelapor.nim],
                    ['Surel', pelapor.email],
                    ['Fakultas', pelapor.fakultas],
                    ['Program Studi', pelapor.programStudi],
                    ['UT Daerah', pelapor.utDaerah],
                  ].map(([label, nilai]) => (
                    <div key={label}>
                      <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                        {label?.toUpperCase()}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 break-words text-[#1F2937]">
                        {nilai || 'Belum diisi'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          )}

          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                02 / DATA PENGAJUAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Informasi Laporan</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 px-6 max-[760px]:grid-cols-1">
              {[
                ['Kategori Permasalahan', report.category],
                ['Jenis Mata Kuliah', 'Teori/Umum'],
                ['Kode Mata Kuliah', code],
                ['Nama Mata Kuliah', courseName],
                ['Kelas Mata Kuliah', report.className],
                ['Nama Tutor', report.tutor],
                ['Perkiraan Durasi Tidak Ada Aktivitas/Respons', '1 minggu atau lebih'],
                ['Judul Laporan', report.title],
              ].map(([label, value]) => (
                <ReadOnlyItem
                  key={label}
                  label={label}
                  value={value}
                  wide={label.includes('Perkiraan') || label === 'Judul Laporan'}
                />
              ))}
            </div>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                03 / PENJELASAN MAHASISWA
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Uraian Permasalahan</h2>
            </div>
            {/* Uraian ditampilkan apa adanya dari laporannya. Sebelumnya bagian
                ini merakit kalimat dari judul dan mata kuliah, sehingga
                Administrator membaca kalimat buatan sistem dan bukan penjelasan
                yang ditulis mahasiswa. */}
            <p className="whitespace-pre-wrap p-6 text-sm leading-7">
              {report.description && report.description.trim() !== ''
                ? report.description
                : 'Mahasiswa tidak menuliskan uraian permasalahan.'}
            </p>
          </section>
          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                04 / LAMPIRAN
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Bukti Pendukung</h2>
            </div>
            {/* Bukti pendukung dibaca dari laporannya. Sebelumnya bagian ini
                menampilkan satu berkas yang ditulis langsung di dalam kode,
                sehingga Administrator memeriksa bukti yang tidak pernah
                diunggah siapa pun. */}
            {lampiran.length > 0 ? (
              <ul className="divide-y divide-[#D9E2EC]">
                {lampiran.map(({ name, type, size, url }) => {
                  const gambar = url !== undefined && url.startsWith('data:image/')

                  return (
                    <li key={name} className="flex items-center justify-between gap-5 px-6 py-4">
                      <div className="flex min-w-0 items-center gap-3">
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

                      {url === undefined ? (
                        <span className="shrink-0 text-xs text-[#52657A]">
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
              <p className="px-6 py-5 text-sm text-[#52657A]">
                Tidak ada bukti pendukung yang dilampirkan.
              </p>
            )}
          </section>
          {/* Kelengkapan yang dikirim mahasiswa setelah diminta. Administrator
              memerlukannya terpisah dari uraian permasalahan: uraian ditulis saat
              laporan dibuat, kelengkapan ditulis untuk menjawab permintaannya
              sendiri, dan keduanya diperiksa pada waktu yang berbeda. */}
          {kelengkapan && (
            <section className="border border-[#D9E2EC] bg-white">
              <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                  KELENGKAPAN DARI MAHASISWA
                </p>
                <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Informasi Tambahan</h2>
              </div>
              <div className="px-6 py-5 max-[620px]:px-5">
                <p className="text-sm leading-6 whitespace-pre-wrap text-[#1F2937]">
                  {kelengkapan.penjelasan}
                </p>
                <p className="mt-2 text-xs text-[#52657A]">Diperbarui {kelengkapan.waktu}</p>
              </div>
            </section>
          )}

          <section className="border border-[#D9E2EC] bg-white">
            <div className="border-b border-[#D9E2EC] bg-[#EEF5FB] px-6 py-4">
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
                05 / PEMBARUAN PENGELOLA
              </p>
              <h2 className="mt-1 font-slab text-2xl text-[#12355B]">Pembaruan Pengelola</h2>
            </div>
            <div className="space-y-5 p-6">
              {riwayatStatus.length ? (
                riwayatStatus.map((update) => (
                  <div key={`${update.time}-${update.title}`} className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#005BAC] text-[10px] text-[#005BAC]">
                      ●
                    </span>
                    <div>
                      <p className="font-mono text-[10px] text-[#52657A]">{update.time}</p>
                      <h3 className="mt-1 text-sm font-semibold text-[#12355B]">{update.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#52657A]">{update.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#52657A]">Belum ada tindak lanjut.</p>
              )}
            </div>
          </section>
        </div>
        <div className="mt-8 flex justify-between gap-3 border-t border-[#D9E2EC] pt-6 max-[500px]:flex-col-reverse">
          <button
            onClick={() => navigate(back)}
            className="border border-[#12355B] px-5 py-3 text-sm font-semibold text-[#12355B]"
          >
            Kembali ke {context === 'history' ? 'Riwayat Laporan' : 'Antrean Laporan'}
          </button>
        </div>
      </section>
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi tindakan"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI TINDAKAN
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">{actionLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              {report.status === 'Menunggu Pemeriksaan'
                ? 'Pastikan informasi dan bukti pendukung laporan telah diperiksa sebelum melakukan verifikasi.'
                : report.status === 'Diteruskan ke Fakultas' && validationRecorded
                  ? 'Status laporan akan diubah menjadi Ditindaklanjuti. Hasil validasi telah diterima dan dicatat. Laporan dapat dilanjutkan ke proses tindak lanjut.'
                  : `Lanjutkan perubahan status laporan menjadi ${displayStatus(mainFlowNext(report.status) ?? 'Selesai')}?`}
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={() => void advance()}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {report.status === 'Diteruskan ke Fakultas' && validationRecorded
                  ? 'Simpan'
                  : actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
      {validationModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="validation-modal-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              CATATAN VALIDASI
            </p>
            <h2 id="validation-modal-title" className="mt-3 font-slab text-2xl text-[#12355B]">
              Catat Hasil Validasi
            </h2>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Hasil Validasi <span className="text-[#005BAC]">*</span>
              </span>
              <input
                required
                value={validationResult}
                onChange={(event) => {
                  setValidationResult(event.target.value)
                  if (validationError) setValidationError('')
                }}
                placeholder="Masukkan hasil validasi dari Fakultas/Unit terkait"
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {validationError && <p className="mt-2 text-xs text-[#B42318]">{validationError}</p>}
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Catatan Validasi <span className="font-normal text-[#52657A]">(opsional)</span>
              </span>
              <textarea
                value={validationNote}
                onChange={(event) => setValidationNote(event.target.value)}
                rows={4}
                className="mt-2 block w-full resize-y border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
            </label>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setValidationModalOpen(false)
                  setValidationError('')
                }}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void recordValidation()}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      {completionModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-modal-title"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI PENYELESAIAN
            </p>
            <h2 id="completion-modal-title" className="mt-3 font-slab text-2xl text-[#12355B]">
              Selesaikan Laporan
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Laporan akan ditandai sebagai Selesai setelah proses tindak lanjut dinyatakan selesai.
            </p>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#12355B]">
                Tindak Lanjut / Hasil Penanganan <span className="text-[#005BAC]">*</span>
              </span>
              <textarea
                required
                value={completionResult}
                onChange={(event) => {
                  setCompletionResult(event.target.value)
                  if (completionError) setCompletionError('')
                }}
                rows={4}
                placeholder="Masukkan hasil tindak lanjut atau penyelesaian laporan"
                className="mt-2 block w-full resize-y border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#7D8B99] focus:border-[#005BAC] focus:ring-2 focus:ring-[#005BAC]/15"
              />
              {completionError && <p className="mt-2 text-xs text-[#B42318]">{completionError}</p>}
            </label>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setCompletionModalOpen(false)
                  setCompletionError('')
                }}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void completeReport()}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Selesaikan Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pratinjau gambar ukuran penuh, sama seperti pada layar mahasiswa,
          agar Administrator dapat memeriksa bukti tanpa meninggalkan halaman. */}
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

      {cabang && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
        >
          <div className="w-full max-w-lg border-2 border-[#12355B] bg-white p-6 shadow-[7px_7px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              {cabang === 'Ditolak' ? 'PENOLAKAN LAPORAN' : 'PERMINTAAN KELENGKAPAN'}
            </p>
            <h2 className="mt-2 font-slab text-2xl text-[#12355B]">
              {cabang === 'Ditolak' ? 'Tolak Laporan' : 'Minta Kelengkapan'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#52657A]">
              {cabang === 'Ditolak'
                ? 'Laporan yang ditolak tidak diproses lebih lanjut dan tidak dapat dikembalikan ke antrean.'
                : 'Laporan dikembalikan kepada mahasiswa untuk dilengkapi, lalu masuk kembali ke antrean verifikasi.'}
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-[#12355B]">
                Alasan <span className="text-[#005BAC]">*</span>
              </span>
              <textarea
                rows={4}
                value={cabangAlasan}
                onChange={(event) => {
                  setCabangAlasan(event.target.value)
                  if (cabangError) setCabangError('')
                }}
                className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                placeholder={
                  cabang === 'Ditolak'
                    ? 'Jelaskan mengapa laporan tidak memenuhi syarat'
                    : 'Jelaskan informasi apa yang perlu dilengkapi mahasiswa'
                }
                aria-invalid={Boolean(cabangError)}
              />
            </label>

            {cabangError && (
              <p role="alert" className="mt-3 text-xs leading-5 text-[#B42318]">
                {cabangError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCabang(null)
                  setCabangError('')
                }}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void jalankanCabang()}
                className={`px-4 py-2.5 text-sm font-semibold text-white ${
                  cabang === 'Ditolak' ? 'bg-[#B42318]' : 'bg-[#8A4B12]'
                }`}
              >
                {cabang === 'Ditolak' ? 'Tolak Laporan' : 'Minta Kelengkapan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminWorkflowShell>
  )
}

import { useEffect, useState } from 'react'
import { useAdminReports } from '../lib/use-admin-reports'
import {
  barisLaporan,
  buatBukuKerja,
  bukuKerjaKeArrayBuffer,
  namaBerkasEkspor,
  unduhBlob,
} from '../lib/report-export'
import { susunZipEkspor } from '../lib/berkas-ekspor'
import { fetchAttachments, fetchIdentitasPelapor } from '../../../shared/data/report-store'
import { jelaskanGalatFirestore } from '../../../shared/lib/firestore-error'
import {
  AdminWorkflowShell,
  FACULTIES,
  WorkflowTable,
  reportProgramStudy,
} from '../components/workflow-ui'
import { isTerminal } from '../../../shared/domain/report-status'
import { alasanEksporTertutup, STATUS_EKSPOR } from '../lib/alasan-ekspor'

export function AdminWorkflowQueueScreen() {
  const [status, setStatus] = useState('Semua')
  const [query, setQuery] = useState('')
  const [faculty, setFaculty] = useState('Semua')
  const [courseType, setCourseType] = useState('Semua')
  /** Penyusunan ZIP membaca lampiran seluruh laporan, sehingga perlu waktu. */
  const [menyusun, setMenyusun] = useState(false)
  /** Laporan yang dicentang Administrator untuk diekspor. */
  const [terpilih, setTerpilih] = useState<string[]>([])

  // Pilihan yang bertahan setelah penyaring berubah akan membawa laporan yang
  // tidak lagi terlihat ke dalam tindakan berikutnya.
  useEffect(() => {
    setTerpilih([])
  }, [status, faculty])
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const { reports: allReports, memuat: memuatLaporan, galat, ubahStatus } = useAdminReports()
  const [kirimError, setKirimError] = useState('')
  const reports = allReports.filter((report) => {
    return (
      !isTerminal(report.status) &&
      (status === 'Semua' || report.status === status) &&
      (faculty === 'Semua' || report.studentFaculty === faculty) &&
      (courseType === 'Semua' || report.courseType === courseType) &&
      `${report.id} ${report.title}`.toLowerCase().includes(query.toLowerCase())
    )
  })
  // Ekspor ditujukan ke satu unit, sehingga penyaringnya hanya fakultas dan
  // status. Jenis mata kuliah tidak membatasinya, karena seluruh laporan
  // fakultas yang sama ditujukan ke unit yang sama.
  const siapEkspor = allReports.filter(
    (report) =>
      faculty !== 'Semua' && report.status === STATUS_EKSPOR && report.studentFaculty === faculty,
  )
  const exportReports = siapEkspor.filter((report) => terpilih.includes(report.id))

  // Meneruskan laporan dan mengekspornya adalah dua langkah berurutan, dan
  // masing-masing bekerja pada status yang berbeda. Baris yang dapat dicentang
  // karena itu mengikuti penyaring status yang sedang aktif, sehingga satu
  // tabel melayani keduanya tanpa pilihan yang tercampur.
  const siapTeruskan = allReports.filter(
    (report) =>
      faculty !== 'Semua' &&
      report.status === 'Lolos Pemeriksaan' &&
      report.studentFaculty === faculty,
  )
  const statusTerpilih =
    status === STATUS_EKSPOR
      ? STATUS_EKSPOR
      : status === 'Lolos Pemeriksaan'
        ? ('Lolos Pemeriksaan' as const)
        : undefined
  const barisTerpilih = status === STATUS_EKSPOR ? siapEkspor : siapTeruskan
  const teruskanReports = siapTeruskan.filter((report) => terpilih.includes(report.id))
  /** Mengapa ekspor belum dapat dijalankan, bila memang belum. */
  const alasanEkspor = alasanEksporTertutup({
    fakultas: faculty,
    status,
    jumlahSiap: siapEkspor.length,
    jumlahTerpilih: exportReports.length,
  })
  const exportFaculty = faculty
  const namaExcel = namaBerkasEkspor(faculty)
  // Yang terunduh adalah ZIP, dan menampilkan nama berkas Excel di dalamnya
  // membuat Administrator mencari berkas yang tidak pernah ada di unduhannya.
  const fileName = namaExcel.replace(/\.xlsx$/, '.zip')
  /**
   * Mengunduh data laporan sebagai berkas Excel.
   *
   * Format Excel dipilih karena penerimanya membukanya sebagai lembar kerja.
   * Berkas CSV sering terbuka berantakan pada Excel berpengaturan Indonesia
   * yang memakai titik koma sebagai pemisah kolom.
   */
  const downloadExport = async (): Promise<boolean> => {
    if (exportReports.length === 0) {
      // Mengunduh berkas kosong tanpa penjelasan membuat Administrator
      // mengira ekspornya rusak, padahal memang tidak ada yang cocok.
      setKirimError(
        'Tidak ada laporan yang dapat diekspor. Ekspor hanya mencakup laporan ' +
          'berstatus Lolos Pemeriksaan pada fakultas yang dipilih.',
      )
      return false
    }

    setKirimError('')
    setMenyusun(true)

    try {
      // Identitas dan lampiran dibaca sekali untuk seluruh laporan, bukan satu
      // permintaan per laporan.
      const identitas = await fetchIdentitasPelapor(exportReports)
      const lampiran = await Promise.all(
        exportReports.map(async (report) => ({
          nomor: report.id,
          namaPelapor: identitas.get(report.studentNim)?.nama ?? '',
          lampiran: (await fetchAttachments(report)).map((berkas) => ({
            nama: berkas.name,
            ...(berkas.url ? { isiBase64: berkas.url } : {}),
          })),
        })),
      )

      const baris = exportReports.map((report) =>
        barisLaporan(
          report,
          reportProgramStudy(report),
          identitas.get(report.studentNim) ?? { nama: '', nim: '' },
        ),
      )

      const zip = await susunZipEkspor({
        excel: bukuKerjaKeArrayBuffer(buatBukuKerja(baris)),
        namaExcel,
        laporan: lampiran,
      })

      unduhBlob(zip, fileName)
      return true
    } catch (penyebab) {
      setKirimError(jelaskanGalatFirestore(penyebab, 'daftar-laporan-administrator'))
      return false
    } finally {
      setMenyusun(false)
    }
  }
  /**
   * Mencatat pengiriman data ke Fakultas/Unit terkait.
   *
   * Perpindahan ke Diteruskan ke Fakultas menuntut unit tujuan dan kanal
   * pengiriman menurut Tabel 4.2, sehingga keduanya disertakan. Laporan
   * diproses satu per satu karena masing-masing melewati pemeriksaan
   * kelayakannya sendiri; laporan yang tidak sah dilewati dan disebutkan,
   * bukan membatalkan seluruh pengiriman.
   */
  const confirmSend = async () => {
    setKirimError('')
    const gagal: string[] = []

    for (const report of teruskanReports) {
      const hasil = await ubahStatus({
        report,
        ke: 'Diteruskan ke Fakultas',
        keterangan:
          'Data laporan dikirim Administrator melalui kanal eksternal untuk proses validasi.',
        data: {
          unit_tujuan: report.studentFaculty ?? 'Fakultas/Unit terkait',
          kanal_pengiriman: 'Email',
        },
      })

      if (!hasil.berhasil) gagal.push(`${report.id}: ${hasil.alasan}`)
    }

    if (gagal.length > 0) {
      setKirimError(gagal.join(' · '))
      return
    }

    setExportReady(false)
    setSendModalOpen(false)
  }
  return (
    <AdminWorkflowShell activeIndex={1}>
      <section className="px-8 py-7 max-[620px]:px-5">
        <header className="border-b border-[#D9E2EC] pb-8">
          <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
            ADMINISTRATOR / ANTREAN LAPORAN
          </p>
          <h1 className="mt-3 font-slab text-[36px] tracking-[-0.035em] text-[#12355B]">
            Antrean Laporan
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#52657A]">
            Kelola dan tindak lanjuti laporan permasalahan terkait aktivitas dan layanan tutor.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              STATUS LAPORAN
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 pr-8 py-3 text-sm"
            >
              <option>Semua</option>
              <option>Menunggu Pemeriksaan</option>
              <option>Lolos Pemeriksaan</option>
              <option value="Diproses">Ditindaklanjuti</option>
              <option>Diteruskan ke Fakultas</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              FAKULTAS
            </span>
            <select
              value={faculty}
              onChange={(event) => setFaculty(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 pr-8 py-3 text-sm"
            >
              <option>Semua</option>
              {FACULTIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
              JENIS MATA KULIAH
            </span>
            <select
              value={courseType}
              onChange={(event) => setCourseType(event.target.value)}
              className="mt-2 block w-full border border-[#B9C8D7] bg-white px-3 pr-8 py-3 text-sm"
            >
              <option value="Semua">Semua Jenis</option>
              <option>Teori/Umum</option>
              <option>Berpraktik</option>
              <option>Praktik</option>
              <option>TAPS</option>
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
          <div className="flex items-end justify-between gap-5 border-b-2 border-[#12355B] pb-3 max-[620px]:items-start max-[620px]:flex-col">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#52657A]">
                DAFTAR LAPORAN MASUK
              </p>
              <h2 className="mt-2 font-slab text-2xl text-[#12355B]">Antrean Laporan</h2>
            </div>
            <div className="flex items-center gap-4 max-[620px]:w-full max-[620px]:justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#52657A]">
                {String(reports.length).padStart(2, '0')} LAPORAN
              </span>
              {/* Dua langkah berurutan, masing-masing pada statusnya sendiri.
                  Menampilkan keduanya sekaligus membuat Administrator menebak
                  mana yang berlaku untuk daftar yang sedang dilihatnya. */}
              {status === 'Lolos Pemeriksaan' ? (
                <button
                  onClick={() => setSendModalOpen(true)}
                  disabled={teruskanReports.length === 0}
                  title={
                    teruskanReports.length === 0
                      ? 'Centang laporan yang akan diteruskan ke Fakultas.'
                      : undefined
                  }
                  className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
                >
                  Teruskan ke Fakultas
                </button>
              ) : (
                <button
                  onClick={() => setExportModalOpen(true)}
                  disabled={Boolean(alasanEkspor)}
                  title={alasanEkspor}
                  className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
                >
                  Export Data Laporan
                </button>
              )}
            </div>
          </div>
          {/* Alasannya sebelumnya hanya muncul setelah tombol ditekan, padahal
              tombol itu justru dinonaktifkan ketika syaratnya belum terpenuhi,
              sehingga penjelasannya tidak pernah terbaca. */}
          {status !== 'Lolos Pemeriksaan' && alasanEkspor && (
            <p className="mt-3 border-l-2 border-[#B8D3E8] bg-[#EEF5FB] px-4 py-3 text-sm leading-6 text-[#52657A]">
              <span className="font-semibold text-[#12355B]">Ekspor belum dapat dijalankan. </span>
              {alasanEkspor}
            </p>
          )}
          {/* Tabel kosong saat memuat akan terbaca sebagai antrean kosong,
              padahal laporannya belum tiba dari basis data. */}
          {memuatLaporan ? (
            <p className="px-6 py-8 text-center text-sm text-[#52657A]">
              Memuat antrean laporan dari basis data…
            </p>
          ) : galat ? (
            /* Penolakan aturan keamanan dibedakan dari daftar kosong. Tanpa
               ini, akun yang belum terdaftar sebagai Administrator hanya
               melihat antrean kosong tanpa tahu sebabnya. */
            <p
              role="alert"
              className="m-6 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-sm leading-6 text-[#B42318]"
            >
              {galat}
            </p>
          ) : (
            <WorkflowTable
              reports={reports}
              context="queue"
              showProgramStudy
              selectable
              statusTerpilih={statusTerpilih}
              selectedIds={terpilih}
              onToggle={(id) =>
                setTerpilih((sekarang) =>
                  sekarang.includes(id)
                    ? sekarang.filter((lain) => lain !== id)
                    : [...sekarang, id],
                )
              }
              onToggleAll={(pilih) => setTerpilih(pilih ? barisTerpilih.map((r) => r.id) : [])}
            />
          )}
          {reports.length === 0 && (
            <div className="border border-[#D9E2EC] bg-white px-5 py-10 text-center">
              <p className="font-slab text-xl text-[#12355B]">Belum ada laporan pada status ini.</p>
            </div>
          )}
        </section>
      </section>
      {exportReady && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              EXPORT BERHASIL
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Data Siap Dikirim</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Data laporan berhasil diekspor dan siap dikirim melalui kanal eksternal.
            </p>
            <p className="mt-4 border border-[#D9E2EC] bg-[#F7F9FC] px-3 py-3 font-mono text-xs text-[#005BAC]">
              {fileName}
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setExportReady(false)}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              PERSIAPAN EXPORT
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Export Data Laporan</h2>
            <dl className="mt-6 space-y-4 border-y border-[#D9E2EC] py-4 text-sm">
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  FAKULTAS TUJUAN
                </dt>
                <dd className="mt-1 font-medium">{exportFaculty}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  JUMLAH LAPORAN
                </dt>
                <dd className="mt-1 font-medium">{exportReports.length} laporan</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-[0.12em] text-[#52657A]">
                  NAMA FILE
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-[#005BAC]">{fileName}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-[#52657A]">
              Berkas diunduh sebagai ZIP berisi satu berkas Excel dan satu folder bukti untuk setiap
              laporan. Yang diekspor adalah seluruh laporan berstatus Lolos Pemeriksaan pada
              Fakultas yang dipilih, dari Program Studi dan jenis mata kuliah mana pun, karena
              seluruhnya ditujukan ke unit yang sama.
            </p>
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setExportModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Modal ditahan sampai berkasnya selesai disusun. Menutupnya
                  // lebih dahulu membuat Administrator mengira ekspornya gagal,
                  // karena membaca lampiran seluruh laporan memakan waktu.
                  void downloadExport().then((berhasil) => {
                    if (!berhasil) return
                    setExportModalOpen(false)
                    setExportReady(true)
                  })
                }}
                disabled={menyusun}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#A9B8C8]"
              >
                {menyusun ? 'Menyusun berkas…' : 'Export Data Laporan'}
              </button>
            </div>
          </div>
          {/* Alasannya sebelumnya hanya muncul setelah tombol ditekan, padahal
              tombol itu justru dinonaktifkan ketika syaratnya belum terpenuhi,
              sehingga penjelasannya tidak pernah terbaca. */}
          {status !== 'Lolos Pemeriksaan' && alasanEkspor && (
            <p className="mt-3 border-l-2 border-[#B8D3E8] bg-[#EEF5FB] px-4 py-3 text-sm leading-6 text-[#52657A]">
              <span className="font-semibold text-[#12355B]">Ekspor belum dapat dijalankan. </span>
              {alasanEkspor}
            </p>
          )}
        </div>
      )}
      {sendModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#12355B]/30 p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border-2 border-[#12355B] bg-white p-6 shadow-[8px_8px_0_#12355B]">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#52657A]">
              KONFIRMASI PENGIRIMAN
            </p>
            <h2 className="mt-3 font-slab text-2xl text-[#12355B]">Konfirmasi Pengiriman Data</h2>
            <p className="mt-3 text-sm leading-6 text-[#52657A]">
              Pastikan data laporan telah dikirim kepada Fakultas/Unit terkait melalui kanal
              eksternal sebelum melanjutkan.
            </p>
            {kirimError && (
              <p
                role="alert"
                className="mb-4 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-xs leading-5 text-[#B42318]"
              >
                {kirimError}
              </p>
            )}
            <div className="mt-7 flex justify-end gap-3 max-[500px]:flex-col-reverse">
              <button
                onClick={() => setSendModalOpen(false)}
                className="border border-[#12355B] px-4 py-2.5 text-sm font-semibold text-[#12355B]"
              >
                Batal
              </button>
              <button
                onClick={() => void confirmSend()}
                className="bg-[#005BAC] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Konfirmasi Pengiriman
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminWorkflowShell>
  )
}

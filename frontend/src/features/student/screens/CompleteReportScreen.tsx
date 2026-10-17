import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getStudentHistoryReports } from '../lib/history-reports'
import { getWorkflowReports, saveWorkflowReports } from '../../../shared/lib/workflow-storage'
import { checkTransition } from '../../../shared/domain/report-status'
import { formatIndonesianDateTime } from '../../../shared/lib/date-time'
import { ReadOnlyItem } from '../../../shared/components/ReadOnlyItem'
import { useStudentIdentity } from '../lib/student-identity'

/**
 * Halaman Lengkapi Laporan.
 *
 * Mewujudkan langkah "Melengkapi laporan" pada Activity Diagram dan halaman
 * dengan nama sama pada Gambar 3.6. Halaman ini satu-satunya cara laporan
 * berstatus Perlu Informasi Tambahan kembali menjadi Diterima, sesuai baris
 * kelima Tabel 4.2 yang menetapkan Mahasiswa sebagai pemicunya.
 */
export function CompleteReportScreen() {
  const identity = useStudentIdentity()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedReportId = new URLSearchParams(location.search).get('report')

  const report = getStudentHistoryReports(identity.ownerKey).find(
    (item) => item.id === selectedReportId,
  )
  const [penjelasan, setPenjelasan] = useState('')
  const [error, setError] = useState('')

  const fieldClass =
    'mt-2 block w-full border border-[#B9C8D7] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#7B8EA3] focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]'

  if (!report) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-slab text-2xl text-[#12355B]">Laporan tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-[#52657A]">
          Laporan yang hendak dilengkapi tidak ada pada riwayat Anda.
        </p>
        <button
          type="button"
          onClick={() => navigate('/riwayat-laporan')}
          className="mt-6 border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#F7F9FC]"
        >
          Kembali ke Riwayat Laporan
        </button>
      </section>
    )
  }

  // Laporan yang tidak berstatus Perlu Informasi Tambahan tidak boleh
  // dilengkapi. Pemeriksaan memakai aturan Tabel 4.2, bukan perbandingan
  // status yang ditulis ulang di layar ini.
  const izin = checkTransition({ dari: report.status, ke: 'Diterima', oleh: 'Mahasiswa' })

  if (!izin.diizinkan) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-slab text-2xl text-[#12355B]">Laporan belum perlu dilengkapi</h1>
        <p className="mt-3 text-sm leading-6 text-[#52657A]">
          Laporan ini berstatus {report.status}. Halaman melengkapi laporan hanya tersedia ketika
          Administrator meminta kelengkapan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/riwayat-laporan')}
          className="mt-6 border border-[#12355B] px-4 py-2.5 text-sm text-[#12355B] transition hover:bg-[#F7F9FC]"
        >
          Kembali ke Riwayat Laporan
        </button>
      </section>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (penjelasan.trim() === '') {
      setError('Tuliskan kelengkapan yang diminta Administrator.')
      return
    }

    const reports = getWorkflowReports()
    const target = reports.find((item) => item.id === report.id)

    if (!target) {
      setError('Laporan tidak ditemukan saat menyimpan. Muat ulang halaman lalu coba lagi.')
      return
    }

    const pemeriksaan = checkTransition({
      dari: target.status,
      ke: 'Diterima',
      oleh: 'Mahasiswa',
    })

    if (!pemeriksaan.diizinkan) {
      setError(pemeriksaan.alasan)
      return
    }

    target.status = 'Diterima'
    target.updates = [
      {
        time: formatIndonesianDateTime(new Date()),
        title: 'Laporan dilengkapi mahasiswa',
        text: penjelasan.trim(),
      },
      ...target.updates,
    ]

    saveWorkflowReports(reports)
    navigate('/riwayat-laporan')
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
        MELENGKAPI LAPORAN
      </p>
      <h1 className="mt-3 font-slab text-3xl leading-none text-[#12355B]">{report.title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#52657A]">
        Administrator meminta kelengkapan atas laporan ini. Setelah dikirim, status laporan kembali
        menjadi Diterima dan masuk antrean verifikasi.
      </p>

      <div className="mt-7 border border-[#D9E2EC] bg-white">
        <ReadOnlyItem label="Nomor Laporan" value={report.id} />
        <ReadOnlyItem label="Mata Kuliah" value={report.course} />
        <ReadOnlyItem label="Tutor" value={report.tutor} />
        <ReadOnlyItem label="Status Saat Ini" value={report.status} />
      </div>

      <form className="mt-7" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-[#12355B]">Kelengkapan yang Ditambahkan</span>
          <textarea
            required
            rows={6}
            value={penjelasan}
            onChange={(event) => {
              setPenjelasan(event.target.value)
              if (error) setError('')
            }}
            className={fieldClass}
            placeholder="Jelaskan informasi tambahan yang diminta Administrator"
            aria-describedby={error ? 'lengkapi-error' : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>

        {error && (
          <p id="lengkapi-error" className="mt-3 text-xs leading-5 text-[#B42318]">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="submit"
            className="bg-[#005BAC] px-5 py-3.5 text-sm text-white transition hover:bg-[#004987] focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:ring-offset-2"
          >
            Kirim Kelengkapan
          </button>
          <button
            type="button"
            onClick={() => navigate('/riwayat-laporan')}
            className="border border-[#12355B] px-5 py-3.5 text-sm text-[#12355B] transition hover:bg-[#F7F9FC]"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  )
}

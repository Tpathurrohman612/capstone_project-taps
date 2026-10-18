import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useStudentReports } from '../lib/use-student-reports'
import { addAttachments, changeReportStatus } from '../../../shared/data/report-store'
import { checkTransition } from '../../../shared/domain/report-status'
import {
  compressImage,
  fileKeDataUrl,
  isCompressibleImage,
} from '../../../shared/domain/image-compression'
import { formatFileSize } from '../../../shared/domain/attachment-rules'
import { jelaskanGalatFirestore } from '../../../shared/lib/firestore-error'
import { useAuth } from '../../../shared/lib/auth-context'
import { AttachmentPicker } from '../../../shared/components/AttachmentPicker'
import { ReadOnlyItem } from '../../../shared/components/ReadOnlyItem'

/**
 * Halaman Lengkapi Laporan.
 *
 * Mewujudkan langkah "Melengkapi laporan" pada Activity Diagram dan halaman
 * dengan nama sama pada Gambar 3.6. Halaman ini satu-satunya cara laporan
 * berstatus Perlu Informasi Tambahan kembali menjadi Diterima, sesuai baris
 * kelima Tabel 4.2 yang menetapkan Mahasiswa sebagai pemicunya.
 */
export function CompleteReportScreen() {
  const { reports } = useStudentReports()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedReportId = new URLSearchParams(location.search).get('report')

  const report = reports.find((item) => item.id === selectedReportId)
  const [penjelasan, setPenjelasan] = useState('')
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const { user } = useAuth()

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (penjelasan.trim() === '') {
      setError('Tuliskan kelengkapan yang diminta Administrator.')
      return
    }

    if (!user) {
      setError('Sesi masuk sudah berakhir. Masuk kembali lalu coba lagi.')
      return
    }

    // Kelayakan perpindahan diperiksa di sini agar pesannya muncul lebih awal;
    // aturan keamanan memeriksanya lagi di server.
    const pemeriksaan = checkTransition({
      dari: report.status,
      ke: 'Diterima',
      oleh: 'Mahasiswa',
    })

    if (!pemeriksaan.diizinkan) {
      setError(pemeriksaan.alasan)
      return
    }

    setMengirim(true)
    setError('')

    try {
      // Lampiran disimpan lebih dahulu. Bila statusnya yang dipindahkan lebih
      // dulu lalu penyimpanan lampiran gagal, laporan sudah kembali ke antrean
      // tanpa membawa kelengkapan yang justru diminta.
      const berkas: { name: string; type: string; size: string; data?: string }[] = []

      for (const file of files) {
        const extension = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
        const data = isCompressibleImage(file.type)
          ? await compressImage(file).then((hasil) => {
              if (!hasil.berhasil) throw new Error(`${file.name}: ${hasil.alasan}`)
              return hasil.dataUrl
            })
          : await fileKeDataUrl(file)

        berkas.push({
          name: file.name,
          type: extension,
          size: formatFileSize(file.size),
          ...(data ? { data } : {}),
        })
      }

      await addAttachments({ report, attachments: berkas })

      await changeReportStatus({
        docId: report.docId,
        reportNumber: report.id,
        ke: 'Diterima',
        oleh: 'Mahasiswa',
        uidPencatat: user.uid,
        keterangan: `Mahasiswa melengkapi laporan. ${penjelasan.trim()}`,
      })

      navigate('/riwayat-laporan')
    } catch (penyebab) {
      setError(jelaskanGalatFirestore(penyebab, 'ubah-status'))
      setMengirim(false)
    }
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

      <div className="mt-7 border border-[#D9E2EC] bg-white px-6 max-[620px]:px-5">
        <ReadOnlyItem label="Nomor Laporan" value={report.id} />
        <ReadOnlyItem label="Mata Kuliah" value={report.course} />
        <ReadOnlyItem label="Tutor" value={report.tutor} />
        <ReadOnlyItem label="Status Saat Ini" value={report.status} />
      </div>

      <form className="mt-7" onSubmit={(event) => void handleSubmit(event)}>
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

        {/* Permintaan kelengkapan sering berarti bukti yang kurang, bukan
            penjelasan yang kurang. Tanpa pemilih berkas di sini, mahasiswa
            harus membuat laporan baru hanya untuk melampirkan satu gambar. */}
        <div className="mt-7">
          <p className="text-sm font-medium text-[#12355B]">
            Bukti Pendukung Tambahan <span className="font-normal text-[#52657A]">(opsional)</span>
          </p>
          <div className="mt-2">
            <AttachmentPicker
              files={files}
              setFiles={setFiles}
              error={fileError}
              setError={setFileError}
            />
          </div>
        </div>

        {error && (
          <p id="lengkapi-error" className="mt-3 text-xs leading-5 text-[#B42318]">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="submit"
            disabled={mengirim}
            className="bg-[#005BAC] px-5 py-3.5 text-sm text-white transition hover:bg-[#004987] focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#7B8EA3]"
          >
            {mengirim ? 'Mengirim…' : 'Kirim Kelengkapan'}
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

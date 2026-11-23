import { useRef, type ChangeEvent } from 'react'
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_LABEL,
  MAX_UNCOMPRESSIBLE_LABEL,
  checkAttachments,
} from '../domain/attachment-rules'

/**
 * Pemilih bukti pendukung.
 *
 * Layar Buat Laporan dan Lengkapi Laporan sama-sama menerima lampiran dengan
 * batas yang sama. Menyalin markup-nya akan membuat keduanya dapat berbeda
 * aturan tanpa ada yang menyadarinya, sehingga pemilihnya dijadikan satu
 * komponen yang memegang pemeriksaan batasnya sekaligus.
 */
export function AttachmentPicker({
  files,
  setFiles,
  error,
  setError,
}: {
  files: File[]
  setFiles: (ubah: (current: File[]) => File[]) => void
  error: string
  setError: (pesan: string) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])
    event.target.value = ''

    // Berkas yang ditolak selalu disertai alasan; membuangnya diam-diam
    // membuat pengguna mengira berkasnya ikut terkirim.
    setError('')
    setFiles((current) => {
      const hasil = checkAttachments({ sudahAda: current, tambahan: incoming })
      if (!hasil.diterima) setError(hasil.alasan)
      return hasil.berkas as File[]
    })
  }

  return (
    <>
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
        <span className="mt-3 text-sm font-semibold text-[#12355B]">Unggah bukti pendukung</span>
        <span className="mt-1 hidden text-xs text-[#52657A] sm:block">
          Maksimal {MAX_FILE_COUNT} file · Gambar maksimal {MAX_FILE_SIZE_LABEL} dan akan
          dimampatkan · PDF maksimal {MAX_UNCOMPRESSIBLE_LABEL} · .jpg, .jpeg, .png, .pdf
        </span>
        <span className="mt-2 flex flex-col gap-1 text-xs text-[#52657A] sm:hidden">
          <span>Maksimal {MAX_FILE_COUNT} file</span>
          <span>Maksimal {MAX_FILE_SIZE_LABEL} per file</span>
          <span>Format: JPG, JPEG, PNG, PDF</span>
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 border border-[#E3AFAB] bg-[#FDF0EF] px-4 py-3 text-xs leading-5 text-[#B42318]"
        >
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-5 divide-y divide-[#D9E2EC] border-y border-[#D9E2EC]">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-4 px-3 py-3"
            >
              <span className="min-w-0 truncate text-sm text-[#1F2937]">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                className="shrink-0 border-b border-[#005BAC] pb-0.5 text-xs font-semibold text-[#005BAC]"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

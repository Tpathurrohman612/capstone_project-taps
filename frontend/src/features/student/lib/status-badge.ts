import type { ReportStatus } from '../../../shared/domain/report-status'

/**
 * Warna lencana status.
 *
 * Record ditulis lengkap dan bertipe agar penambahan status pada Tabel 4.1
 * memunculkan galat kompilasi, bukan diam-diam jatuh ke warna netral. Dua
 * status yang menuntut perhatian dibedakan dengan jelas: Ditolak memakai warna
 * merah karena laporan berhenti, dan Perlu Dilengkapi memakai warna
 * oranye karena menunggu tindakan mahasiswa.
 */
const badgeByStatus: Record<ReportStatus, string> = {
  'Menunggu Pemeriksaan': 'border-[#B9C8D7] bg-white text-[#52657A]',
  'Perlu Dilengkapi': 'border-[#E8B882] bg-[#FDF3E8] text-[#8A4B12]',
  Ditolak: 'border-[#E3AFAB] bg-[#FDF0EF] text-[#B42318]',
  'Lolos Pemeriksaan': 'border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]',
  'Diteruskan ke Fakultas': 'border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]',
  Ditindaklanjuti: 'border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]',
  Selesai: 'border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]',
}

export const statusBadge = (status: ReportStatus) => badgeByStatus[status]

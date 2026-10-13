export const statusStages = [
  { label: 'Diterima', time: '12 Sep 2026 · 09:14', state: 'done' },
  { label: 'Diverifikasi', time: '13 Sep 2026 · 10:32', state: 'done' },
  {
    label: 'Menunggu Validasi',
    time: 'Menunggu hasil validasi',
    state: 'upcoming',
  },
  { label: 'Sedang Diproses', time: '14 Sep 2026 · 15:20', state: 'current' },
  { label: 'Selesai', time: 'Menunggu penyelesaian', state: 'upcoming' },
] as const

export const followUps = [
  {
    time: '14 September 2026, 15:20',
    title: 'Laporan sedang diproses',
    text: 'Laporan telah diteruskan kepada pengelola Tutorial Online untuk dilakukan peninjauan.',
  },
  {
    time: '13 September 2026, 10:32',
    title: 'Laporan diverifikasi',
    text: 'Informasi laporan dan bukti pendukung telah diperiksa oleh pengelola.',
  },
  {
    time: '12 September 2026, 09:14',
    title: 'Laporan diterima',
    text: 'Laporan berhasil diterima oleh sistem Lapor Tuton.',
  },
]

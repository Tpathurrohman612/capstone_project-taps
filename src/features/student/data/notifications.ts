export type StudentNotification = {
  id: string
  reportId: string
  message: string
  time: string
  unread: boolean
}

export const studentNotifications: StudentNotification[] = [
  {
    id: "status-lt-0005",
    reportId: "LT-2026-0005",
    message:
      "Status laporan LT-2026-0005 diperbarui menjadi Menunggu Validasi.",
    time: "Hari ini · 15.20",
    unread: true,
  },
  {
    id: "follow-up-lt-0010",
    reportId: "LT-2026-0010",
    message: "Terdapat pembaruan tindak lanjut untuk laporan LT-2026-0010.",
    time: "Kemarin · 10.15",
    unread: true,
  },
]

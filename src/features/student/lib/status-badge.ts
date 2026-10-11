import type { HistoryReport } from "../../../shared/types/history-report"

export const statusBadge = (status: HistoryReport["status"]) => {
  if (status === "Sedang Diproses")
    return "border-[#E4C66C] bg-[#FFF8E2] text-[#735A13]"
  if (status === "Selesai")
    return "border-[#B8D3E8] bg-[#EEF5FB] text-[#12355B]"
  if (status === "Diverifikasi")
    return "border-[#A8C5DC] bg-[#F2F7FB] text-[#005BAC]"
  return "border-[#B9C8D7] bg-white text-[#52657A]"
}

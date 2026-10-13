import type { ReactNode } from 'react'
import universitasTerbukaLogo from '../../../assets/universitas-terbuka-logo.png'

function AuthBrand() {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={universitasTerbukaLogo}
        alt="Universitas Terbuka"
        className="h-auto w-[168px] max-[520px]:w-[142px]"
      />
      <div className="mt-5 border-t border-[#D9E2EC] pt-5">
        <p className="font-slab text-[30px] leading-none text-[#12355B] max-[520px]:text-[26px]">
          Lapor Tuton
        </p>
        <p className="mt-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#52657A]">
          TUTORIAL ONLINE
        </p>
      </div>
    </div>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5 py-10 text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="w-full max-w-[540px] border border-[#D9E2EC] bg-white p-8 shadow-[8px_8px_0_#12355B] max-[520px]:p-6">
        <AuthBrand />
        {children}
      </div>
    </main>
  )
}

import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import universitasTerbukaLogo from '../../../assets/universitas-terbuka-logo.png'
import { handlePrototypeLogout } from '../../../shared/lib/auth-session'
import { navItems } from '../data/navigation'

const navButton = (active: boolean) =>
  `group flex items-center gap-3 border px-3 py-3 text-left text-sm transition-colors ${
    active
      ? 'border-[#12355B] bg-[#12355B] font-medium text-white'
      : 'border-transparent hover:border-[#D9E2EC] hover:bg-white'
  }`

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isActive = (to: string) => to !== '#' && location.pathname === to
  const isCreateReportPage = location.pathname === '/buat-laporan'

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#1F2937] selection:bg-[#DCEBF8]">
      <div className="mx-auto grid min-h-screen max-w-[1536px] grid-cols-[254px_minmax(0,1fr)] border-x border-[#D9E2EC] bg-white max-[900px]:block">
        <header
          className={`sticky top-0 z-10 hidden items-center justify-between border-b border-[#D9E2EC] bg-[#F7F9FC] pb-4 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(4rem,env(safe-area-inset-top))] max-[900px]:flex`}
        >
          <div className={`flex items-center gap-3 ${isCreateReportPage ? 'min-w-0 flex-1' : ''}`}>
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-10 shrink-0"
            />
            <span
              className={`${
                isCreateReportPage ? 'whitespace-nowrap' : ''
              } font-slab text-xl leading-none max-[360px]:text-lg`}
            >
              Lapor Tuton
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-10 w-10 items-center justify-center border border-[#12355B] text-[#12355B] ${
              isCreateReportPage ? 'ml-3 shrink-0' : ''
            }`}
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
        </header>

        <aside className="flex min-h-screen flex-col border-r border-[#D9E2EC] bg-[#F7F9FC] px-5 py-7 max-[900px]:hidden">
          <div className="flex flex-col items-center border-b border-[#D9E2EC] pb-7 text-center">
            <img
              src={universitasTerbukaLogo}
              alt="Universitas Terbuka"
              className="h-auto w-[142px]"
            />
            <div className="mt-4 flex items-baseline justify-center">
              <span className="p-0 font-slab text-[26px] leading-none">Lapor Tuton</span>
            </div>
          </div>
          <nav className="mt-7 flex flex-col gap-1" aria-label="Navigasi utama">
            {navItems.map((item, index) =>
              item.to === '#' ? (
                <button key={item.label} className={navButton(false)}>
                  <NavNumber active={false} number={index + 1} />
                  {item.label}
                </button>
              ) : (
                <Link key={item.label} to={item.to} className={navButton(isActive(item.to))}>
                  <NavNumber active={isActive(item.to)} number={index + 1} />
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <button
            className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A] transition hover:border-[#D9E2EC] hover:bg-white hover:text-[#12355B]"
            onClick={handlePrototypeLogout}
          >
            <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
              ↗
            </span>
            Keluar
          </button>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 hidden bg-[#12355B]/30 max-[900px]:block"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi utama"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-[78vw] max-w-[360px] flex-col overflow-x-hidden bg-[#F7F9FC] pb-5 pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-[max(4rem,env(safe-area-inset-top))] shadow-[8px_0_0_#12355B]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={universitasTerbukaLogo}
                    alt="Universitas Terbuka"
                    className="h-auto w-9 shrink-0"
                  />
                  <span className="truncate font-slab text-xl leading-none max-[360px]:text-lg">
                    Lapor Tuton
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center border border-[#12355B] text-lg text-[#12355B]"
                  aria-label="Tutup menu"
                >
                  ×
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item, index) =>
                  item.to === '#' ? (
                    <button key={item.label} className={navButton(false)}>
                      <NavNumber active={false} number={index + 1} />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={navButton(isActive(item.to))}
                    >
                      <NavNumber active={isActive(item.to)} number={index + 1} />
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
              <button
                className="mt-auto flex items-center gap-3 border border-transparent px-3 py-3 text-left text-sm text-[#52657A]"
                onClick={handlePrototypeLogout}
              >
                <span className="flex h-5 w-5 items-center justify-center border border-[#A9B8C8] text-[13px]">
                  ↗
                </span>
                Keluar
              </button>
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </main>
  )
}

function NavNumber({ active, number }: { active: boolean; number: number }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center border text-[10px] ${
        active ? 'border-[#9FC8EA] text-[#DCEBF8]' : 'border-[#A9B8C8] text-[#52657A]'
      }`}
    >
      0{number}
    </span>
  )
}

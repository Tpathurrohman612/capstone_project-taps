import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// React Testing Library tidak membersihkan dirinya sendiri pada Vitest,
// sehingga komponen dari satu pengujian akan tersisa dan mengacaukan pencarian
// elemen pada pengujian berikutnya.
afterEach(() => {
  cleanup()
})

// jsdom tidak mengimplementasikan tata letak, sehingga scrollIntoView tidak
// ada. Kode yang memanggilnya untuk menggulirkan ke pesan galat bukan sedang
// salah, jadi fungsinya disediakan sebagai tiruan daripada pengujian dipenuhi
// galat yang tidak berarti.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

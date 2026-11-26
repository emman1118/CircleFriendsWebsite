'use client'

import dynamic from 'next/dynamic'

// This private, browser-driven workspace has no member data to prerender.
// Mount controls after hydration so autofill extensions cannot mutate their
// server-rendered attributes before React attaches to them.
const Circle = dynamic(() => import('./circle'), {
  ssr: false,
  loading: () => (
    <main aria-busy="true" aria-label="Loading Circle" className="flex min-h-screen items-center justify-center bg-[#f8f9f6] font-sans text-[#30362f]">
      <div role="status" className="text-center">
        <span className="mx-auto mb-4 block h-10 w-10 rounded-full border-[8px] border-[#e9826b]" />
        <p className="text-lg font-semibold">Opening your circle…</p>
      </div>
    </main>
  ),
})

export default function HomePage() {
  return <Circle />
}

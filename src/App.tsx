import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import ServicesGrid from './components/ServicesGrid'
import Features from './components/Features'
import Preloader from './components/Preloader'
import Imprint from './components/Imprint'
import FAQPage from './components/FAQ'
import NotFound from './components/NotFound'
import { LAST_UPDATED_DISPLAY, usePageMetadata } from './seo'

const BASE_URL = import.meta.env.BASE_URL

function SiteFooter() {
  return (
    <footer className="bg-black px-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 py-6 text-[10px] text-[#DEDBC8]/55 sm:text-xs md:py-7">
        <p>
          lmautomations <span className="hidden lg:inline">· Custom AI automation, built by two people.</span>{' '}
          <span className="text-[#DEDBC8]/40">· Last updated {LAST_UPDATED_DISPLAY}</span>
        </p>
        <nav aria-label="Footer navigation" className="flex items-center gap-4 sm:gap-6">
          <a href={`${BASE_URL}#solutions`} className="transition-colors duration-200 hover:text-[#E1E0CC]">Solutions</a>
          <a href={`${BASE_URL}faq/`} className="transition-colors duration-200 hover:text-[#E1E0CC]">FAQ</a>
          <a href={`${BASE_URL}imprint/`} className="transition-colors duration-200 hover:text-[#E1E0CC]">Imprint</a>
        </nav>
      </div>
    </footer>
  )
}

export default function App({ url }: { url?: string }) {
  const [path, setPath] = useState(() => resolveInitialPath(url))
  const [preloaderDone, setPreloaderDone] = useState(false)

  usePageMetadata(path)

  useEffect(() => {
    const handleNavigation = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  if (path === '/imprint') return <Imprint />
  if (path === '/faq') return <FAQPage />
  if (path !== '/') return <NotFound />

  return (
    <>
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="flex min-h-[100dvh] flex-col bg-black">
        <main id="main-content">
          <Hero />
          <ServicesGrid />
          <Features />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// On the server the route comes in as a prop; on the client it's read from the
// URL (falling back to the URL only when the prop is absent).
function resolveInitialPath(url?: string) {
  if (url != null) return normalizePath(url)
  if (typeof window !== 'undefined') return normalizePath(window.location.pathname)
  return '/'
}

function normalizePath(path: string) {
  const basePath = BASE_URL.replace(/\/$/, '')
  const pathWithoutBase = basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path
  const normalizedPath = pathWithoutBase === '/index.html'
    ? '/'
    : pathWithoutBase.replace(/\.html$/, '')
  return normalizedPath.length > 1 ? normalizedPath.replace(/\/+$/, '') : normalizedPath
}

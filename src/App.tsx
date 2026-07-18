import { lazy, Suspense, useEffect, useState } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import { usePageMetadata } from './seo'

const BASE_URL = import.meta.env.BASE_URL

const Imprint = lazy(() => import('./components/Imprint'))
const NotFound = lazy(() => import('./components/NotFound'))

function SiteFooter() {
  return (
    <footer className="bg-black px-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 py-6 text-[10px] text-[#DEDBC8]/55 sm:text-xs md:py-7">
        <p>lmautomations <span className="hidden sm:inline">— Focused systems. Measurable outcomes.</span></p>
        <nav aria-label="Footer navigation" className="flex items-center gap-4 sm:gap-6">
          <a href={`${BASE_URL}#about`} className="transition-colors duration-200 hover:text-[#E1E0CC]">About</a>
          <a href={`${BASE_URL}#solutions`} className="transition-colors duration-200 hover:text-[#E1E0CC]">Solutions</a>
          <a href={`${BASE_URL}imprint.html`} className="transition-colors duration-200 hover:text-[#E1E0CC]">Imprint</a>
        </nav>
      </div>
    </footer>
  )
}

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))

  usePageMetadata(path)

  useEffect(() => {
    const handleNavigation = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  if (path === '/imprint') {
    return <Suspense fallback={<RouteFallback />}><Imprint /></Suspense>
  }

  if (path !== '/') {
    return <Suspense fallback={<RouteFallback />}><NotFound /></Suspense>
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="flex min-h-[100dvh] flex-col bg-black">
        <main id="main-content">
          <Hero />
          <About />
          <Features />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}

function normalizePath(path: string) {
  const basePath = BASE_URL.replace(/\/$/, '')
  const pathWithoutBase = basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path
  const normalizedPath = pathWithoutBase === '/index.html'
    ? '/'
    : pathWithoutBase.replace(/\.html$/, '')
  return normalizedPath.length > 1 ? normalizedPath.replace(/\/+$/, '') : normalizedPath
}

function RouteFallback() {
  return <div className="min-h-[100dvh] bg-[#101010]" aria-busy="true" aria-label="Loading page" />
}

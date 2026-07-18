export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#101010] px-6 text-[#E1E0CC]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-20">
        <p className="text-xs tracking-[0.18em] text-[#DEDBC8]/55">404</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">Page not found.</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#DEDBC8]/65 md:text-base">
          The page you requested does not exist or may have moved. Return home to explore our custom AI automation services.
        </p>
        <a
          href={import.meta.env.BASE_URL}
          className="mt-8 self-start rounded-full bg-primary px-5 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5 active:translate-y-px"
        >
          Return to homepage
        </a>
      </main>
    </div>
  )
}

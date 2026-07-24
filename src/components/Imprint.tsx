const details = [
  {
    label: 'Business address',
    value: (
      <>
        Houthulststraat 59
        <br />
        2170 Merksem
        <br />
        Belgium
      </>
    ),
  },
  //{ label: 'Enterprise number', value: '1012.768.189' },
  { label: 'VAT number', value: 'BE1012768189' },
]

export default function Imprint() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#101010] text-[#E1E0CC]">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 md:py-28">
        <a
          href={import.meta.env.BASE_URL}
          className="text-xs text-[#DEDBC8]/60 transition-colors duration-200 hover:text-[#E1E0CC] md:text-sm"
        >
          &larr; Back to home
        </a>

        <header className="mt-10">
          <p className="text-[10px] tracking-[0.18em] text-[#DEDBC8]/55 md:text-xs">LEGAL</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">Imprint.</h1>
          <p className="mt-4 text-base leading-relaxed text-[#DEDBC8]/60 md:text-lg">
            lmautomations is the trade name of Liam Ryngaert.
          </p>
        </header>

        <section
          aria-label="Company details"
          className="mt-12 rounded-3xl border border-white/15 bg-[#171717] p-8 md:p-10"
        >
          <dl className="grid gap-8 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-[#DEDBC8]/55">{item.label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#E1E0CC] md:text-base">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="px-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 py-6 text-[10px] text-[#DEDBC8]/55 sm:text-xs md:py-7">
          <p>lmautomations <span className="hidden sm:inline">· Focused systems. Measurable outcomes.</span></p>
          <span>Imprint</span>
        </div>
      </footer>
    </div>
  )
}

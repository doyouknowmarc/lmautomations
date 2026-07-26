import { ReactNode } from 'react'
import { DATE_MODIFIED, LAST_UPDATED_DISPLAY } from '../seo'

interface SiteFooterProps {
  /** Shown from `lg` up, where there is room for it. */
  tagline?: string
  /** The date is small enough to keep everywhere; only its "Last updated" label is dropped below `sm`. */
  showLastUpdated?: boolean
  /** Right-hand slot: the nav on the homepage, a plain page label elsewhere. */
  children?: ReactNode
  className?: string
}

export default function SiteFooter({ tagline, showLastUpdated = false, children, className = '' }: SiteFooterProps) {
  return (
    <footer className={`px-4 md:px-6 ${className}`}>
      {/* Stacked below sm on purpose. As one row at 375px the nav cannot shrink past
          "Solutions FAQ Imprint", so all the pressure landed on the paragraph, which
          wrapped mid-phrase and orphaned the year. */}
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 border-t border-white/10 py-6 text-[10px] text-[#DEDBC8]/55 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-xs md:py-7">
        <p>
          lmautomations
          {tagline && <span className="hidden lg:inline"> · {tagline}</span>}{' '}
          {showLastUpdated && (
            <span className="text-[#DEDBC8]/40">
              · <span className="hidden sm:inline">Last updated </span>
              <time dateTime={DATE_MODIFIED}>{LAST_UPDATED_DISPLAY}</time>
            </span>
          )}
        </p>
        {children && <div className="shrink-0 whitespace-nowrap">{children}</div>}
      </div>
    </footer>
  )
}

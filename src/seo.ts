import { useEffect } from 'react'
import { FAQ_ITEMS } from './content/faq'
import { SERVICE_TIERS } from './content/services'

export const SITE_URL = 'https://lmautomations.com'
const SOCIAL_IMAGE = `${SITE_URL}/liam-marc-automations-og.jpg`
// The general enquiry booking link, as used by the hero call to action.
const BOOKING_URL = 'https://tidycal.com/doyouknowmarc/ai-discovery-call'

// Public profile URLs (LinkedIn, Instagram, YouTube, GitHub, X) that let search
// engines tie this Organization to a known entity. Listing one here is inert: a
// sameAs entry is a plain string in JSON-LD, so it loads no third-party resource
// and sets no cookie — unlike an embedded widget, it needs no consent banner.
const SAME_AS: string[] = []

// Bump DATE_MODIFIED whenever page content changes. This module is the only
// source of the JSON-LD: scripts/prerender.mjs injects it into the built HTML.
const DATE_PUBLISHED = '2026-07-18'
const DATE_MODIFIED = '2026-07-24'
export const LAST_UPDATED_DISPLAY = 'July 24, 2026'

interface PageMetadata {
  title: string
  description: string
  canonicalPath: string
  robots?: string
}

const HOME_METADATA: PageMetadata = {
  title: 'AI Automations | Liam & Marc',
  description:
    'Liam and Marc build secure custom AI automations and intelligent agents that reduce manual work, streamline operations, and deliver measurable business results.',
  canonicalPath: '/',
}

const IMPRINT_METADATA: PageMetadata = {
  title: 'Imprint and Legal Information | Liam & Marc Automations',
  description:
    'Company and legal information for Liam & Marc Automations, including the registered business address and Belgian VAT identification details.',
  canonicalPath: '/imprint/',
  robots: 'noindex, follow',
}

const FAQ_METADATA: PageMetadata = {
  title: 'FAQ | Liam & Marc Automations',
  description:
    'Answers to common questions about our custom AI automation services, project timelines, target customers, and team at Liam & Marc Automations.',
  canonicalPath: '/faq/',
}

const NOT_FOUND_METADATA: PageMetadata = {
  title: 'Page Not Found | Liam & Marc Automations',
  description: 'The requested page could not be found. Return to Liam & Marc Automations to explore our custom AI automation services.',
  canonicalPath: '/404',
  robots: 'noindex, follow',
}

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

// The three tiers as an offer catalog. Services are modelled as Service inside
// Offer rather than as Product: Google's product rich results only cover pages
// focused on a single purchasable product, and these are price ranges for
// consulting engagements with no checkout.
function createOfferCatalog() {
  return {
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/#offercatalog`,
    name: 'AI automation projects',
    itemListElement: SERVICE_TIERS.map((tier) => ({
      '@type': 'Offer',
      name: tier.serviceName,
      url: tier.bookingUrl,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        ...(tier.minPrice === undefined ? {} : { minPrice: tier.minPrice }),
        ...(tier.maxPrice === undefined ? {} : { maxPrice: tier.maxPrice }),
      },
      itemOffered: {
        '@type': 'Service',
        name: tier.serviceName,
        description: tier.serviceDescription,
        serviceType: 'AI automation',
        provider: { '@id': `${SITE_URL}/#organization` },
      },
    })),
  }
}

// Home → page trail. Breadcrumbs are the one rich result still rendered by
// Google among the markup on this site.
function createBreadcrumb(path: string, name: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${path}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
    ],
  }
}

function createHomeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'lmautomations',
        alternateName: 'Liam & Marc Automations',
        legalName: 'Liam Ryngaert',
        url: `${SITE_URL}/`,
        description: 'Custom AI automation systems, intelligent agents, and secure enterprise AI solutions.',
        logo: { '@id': `${SITE_URL}/#logo` },
        image: { '@id': `${SITE_URL}/#primaryimage` },
        vatID: 'BE1012768189',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Houthulststraat 59',
          postalCode: '2170',
          addressLocality: 'Merksem',
          addressCountry: 'BE',
        },
        founder: { '@type': 'Person', name: 'Liam Ryngaert' },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          url: BOOKING_URL,
          availableLanguage: 'en',
        },
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        knowsAbout: ['AI automation', 'AI agents', 'Workflow automation', 'Enterprise AI'],
        hasOfferCatalog: createOfferCatalog(),
        ...(SAME_AS.length === 0 ? {} : { sameAs: SAME_AS }),
      },
      {
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/#logo`,
        url: `${SITE_URL}/apple-touch-icon.png`,
        contentUrl: `${SITE_URL}/apple-touch-icon.png`,
        width: 180,
        height: 180,
        caption: 'Liam & Marc Automations',
      },
      {
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/#primaryimage`,
        url: SOCIAL_IMAGE,
        contentUrl: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        caption: 'Liam & Marc Automations, custom AI automation systems',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'lmautomations',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: HOME_METADATA.title,
        description: HOME_METADATA.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        primaryImageOfPage: { '@id': `${SITE_URL}/#primaryimage` },
        inLanguage: 'en',
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED,
      },
    ],
  }
}

function createImprintSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/imprint/#webpage`,
        url: `${SITE_URL}/imprint/`,
        name: IMPRINT_METADATA.title,
        description: IMPRINT_METADATA.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${SITE_URL}/imprint/#breadcrumb` },
        inLanguage: 'en',
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED,
      },
      // The imprint is noindexed, so this trail never surfaces as a rich
      // result; it is here so every page carries the same shape.
      createBreadcrumb('/imprint/', 'Imprint'),
    ],
  }
}

// FAQPage, not QAPage: these answers are written by the site with no way for
// visitors to submit their own, which Google's QAPage guidelines exclude.
function createFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/faq/#faq`,
        url: `${SITE_URL}/faq/`,
        name: FAQ_METADATA.title,
        description: FAQ_METADATA.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${SITE_URL}/faq/#breadcrumb` },
        inLanguage: 'en',
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: [item.intro, ...(item.bullets ?? []), item.answer].filter(Boolean).join(' '),
          },
        })),
      },
      createBreadcrumb('/faq/', 'FAQ'),
    ],
  }
}

// Single source of the page JSON-LD, consumed by usePageMetadata at runtime and
// by scripts/prerender.mjs at build time (re-exported via src/entry-server.tsx).
export function schemaForPath(path: string): Record<string, unknown> | null {
  if (path === '/') return createHomeSchema()
  if (path === '/imprint') return createImprintSchema()
  if (path === '/faq') return createFaqSchema()
  return null
}

export function usePageMetadata(path: string) {
  useEffect(() => {
    const metadata = path === '/' ? HOME_METADATA : path === '/imprint' ? IMPRINT_METADATA : path === '/faq' ? FAQ_METADATA : NOT_FOUND_METADATA
    const canonicalUrl = `${SITE_URL}${metadata.canonicalPath}`

    document.title = metadata.title
    upsertMeta('meta[name="description"]', 'name', 'description', metadata.description)
    upsertMeta('meta[name="robots"]', 'name', 'robots', metadata.robots ?? 'index, follow, max-image-preview:large')
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description)

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    canonical?.setAttribute('href', canonicalUrl)

    const schema = document.getElementById('structured-data')
    if (schema) {
      const pageSchema = schemaForPath(path)
      schema.textContent = pageSchema ? JSON.stringify(pageSchema) : ''
    }
  }, [path])
}

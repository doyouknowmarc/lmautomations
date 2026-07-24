import { useEffect } from 'react'
import { FAQ_ITEMS } from './content/faq'

export const SITE_URL = 'https://lmautomations.com'
const SOCIAL_IMAGE = `${SITE_URL}/liam-marc-automations-og.jpg`

// Bump DATE_MODIFIED whenever page content changes; keep in sync with the
// matching JSON-LD hardcoded into index.html / imprint/index.html / faq/index.html.
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

function createHomeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'lmautomations',
        alternateName: 'Liam & Marc Automations',
        url: `${SITE_URL}/`,
        description: 'Custom AI automation systems, intelligent agents, and secure enterprise AI solutions.',
        logo: { '@id': `${SITE_URL}/#logo` },
        image: { '@id': `${SITE_URL}/#primaryimage` },
        knowsAbout: ['AI automation', 'AI agents', 'Workflow automation', 'Enterprise AI'],
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
    '@type': 'WebPage',
    '@id': `${SITE_URL}/imprint/#webpage`,
    url: `${SITE_URL}/imprint/`,
    name: IMPRINT_METADATA.title,
    description: IMPRINT_METADATA.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
  }
}

function createFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq/#faq`,
    url: `${SITE_URL}/faq/`,
    name: FAQ_METADATA.title,
    description: FAQ_METADATA.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
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
  }
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
      schema.textContent = path === '/'
        ? JSON.stringify(createHomeSchema())
        : path === '/imprint'
          ? JSON.stringify(createImprintSchema())
          : path === '/faq'
            ? JSON.stringify(createFaqSchema())
            : ''
    }
  }, [path])
}

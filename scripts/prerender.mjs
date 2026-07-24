import { readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const ROOT_PLACEHOLDER = '<div id="root"></div>'
const SCHEMA_PLACEHOLDER = '<script id="structured-data" type="application/ld+json"></script>'

// Route path (as it appears in the URL) -> built HTML file to inject into.
// schemaPath is the un-slashed form that src/seo.ts keys its schemas on.
const routes = [
  { url: '/', schemaPath: '/', file: 'dist/index.html' },
  { url: '/faq/', schemaPath: '/faq', file: 'dist/faq/index.html' },
  { url: '/imprint/', schemaPath: '/imprint', file: 'dist/imprint/index.html' },
]

const ssrEntry = join(root, '.prerender-tmp/entry-server.js')
const { render, schemaForPath } = await import(pathToFileURL(ssrEntry).href)

for (const { url, schemaPath, file } of routes) {
  const path = join(root, file)
  const template = await readFile(path, 'utf8')

  for (const placeholder of [ROOT_PLACEHOLDER, SCHEMA_PLACEHOLDER]) {
    if (!template.includes(placeholder)) {
      throw new Error(`Prerender aborted: "${placeholder}" not found in ${file}`)
    }
  }

  const appHtml = render(url)
  if (!appHtml.trim()) {
    throw new Error(`Prerender aborted: empty markup rendered for ${url}`)
  }

  const schema = schemaForPath(schemaPath)
  if (!schema) {
    throw new Error(`Prerender aborted: no structured data defined for ${schemaPath}`)
  }
  // Escaping "<" keeps any future string value from closing the script element.
  const schemaJson = JSON.stringify(schema).replaceAll('<', '\\u003c')

  const html = template
    .replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`)
    .replace(SCHEMA_PLACEHOLDER, SCHEMA_PLACEHOLDER.replace('></script>', `>${schemaJson}</script>`))

  await writeFile(path, html)
  console.log(`✓ prerendered ${url} → ${file} (${appHtml.length.toLocaleString()} chars markup, ${schemaJson.length.toLocaleString()} chars JSON-LD)`)
}

// The SSR bundle is a build artifact only; keep it out of the deployed dist/.
await rm(join(root, '.prerender-tmp'), { recursive: true, force: true })

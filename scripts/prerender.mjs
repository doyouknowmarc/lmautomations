import { readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const ROOT_PLACEHOLDER = '<div id="root"></div>'

// Route path (as it appears in the URL) -> built HTML file to inject into.
const routes = [
  { url: '/', file: 'dist/index.html' },
  { url: '/faq/', file: 'dist/faq/index.html' },
  { url: '/imprint/', file: 'dist/imprint/index.html' },
]

const ssrEntry = join(root, '.prerender-tmp/entry-server.js')
const { render } = await import(pathToFileURL(ssrEntry).href)

for (const { url, file } of routes) {
  const path = join(root, file)
  const template = await readFile(path, 'utf8')

  if (!template.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`Prerender aborted: "${ROOT_PLACEHOLDER}" not found in ${file}`)
  }

  const appHtml = render(url)
  if (!appHtml.trim()) {
    throw new Error(`Prerender aborted: empty markup rendered for ${url}`)
  }

  await writeFile(path, template.replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`))
  console.log(`✓ prerendered ${url} → ${file} (${appHtml.length.toLocaleString()} chars)`)
}

// The SSR bundle is a build artifact only; keep it out of the deployed dist/.
await rm(join(root, '.prerender-tmp'), { recursive: true, force: true })

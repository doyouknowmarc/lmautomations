import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const failures = []

const check = (condition, message) => {
  if (condition) console.log(`✓ ${message}`)
  else failures.push(message)
}

const text = async (path) => readFile(join(root, path), 'utf8')
const bytes = async (path) => (await stat(join(root, path))).size

const homepage = await text('dist/index.html')
const imprint = await text('dist/imprint/index.html')
const faq = await text('dist/faq/index.html')
const robots = await text('dist/robots.txt')
const sitemap = await text('dist/sitemap.xml')
const cssSource = await text('src/index.css')
const assetNames = await readdir(join(dist, 'assets'))

for (const file of ['dist/index.html', 'dist/imprint/index.html', 'dist/faq/index.html', 'dist/404.html', 'dist/robots.txt', 'dist/sitemap.xml', 'dist/.nojekyll']) {
  check((await bytes(file)) > 0, `${file} exists`)
}

const getContent = (html, selector) => html.match(selector)?.[1]?.replaceAll('&amp;', '&') ?? ''
const homeTitle = getContent(homepage, /<title>([^<]+)<\/title>/)
const homeDescription = getContent(homepage, /<meta\s+name="description"\s+content="([^"]+)"/)
const imprintTitle = getContent(imprint, /<title>([^<]+)<\/title>/)
const imprintDescription = getContent(imprint, /<meta\s+name="description"\s+content="([^"]+)"/)
const faqTitle = getContent(faq, /<title>([^<]+)<\/title>/)
const faqDescription = getContent(faq, /<meta\s+name="description"\s+content="([^"]+)"/)

check(homeTitle === 'AI Automations | Liam & Marc', 'homepage title matches the approved brand title')
check(homeDescription.length >= 140 && homeDescription.length <= 160, 'homepage description is 140–160 characters')
check(imprintTitle.length >= 50 && imprintTitle.length <= 60, 'imprint title is 50–60 characters')
check(imprintDescription.length >= 140 && imprintDescription.length <= 160, 'imprint description is 140–160 characters')
check(faqTitle.length > 0, 'faq page has a title')
check(faqDescription.length >= 140 && faqDescription.length <= 160, 'faq description is 140–160 characters')

for (const [name, html] of [['homepage', homepage], ['imprint', imprint], ['faq', faq]]) {
  check(/rel="canonical" href="https:\/\//.test(html), `${name} has an absolute canonical`)
  check(/property="og:url" content="https:\/\//.test(html), `${name} has an absolute og:url`)
  check(/name="twitter:card" content="summary_large_image"/.test(html), `${name} has a large Twitter card`)
  check(/type="application\/ld\+json"/.test(html), `${name} has structured data`)
  check(/"dateModified":\s*"\d{4}-\d{2}-\d{2}"/.test(html), `${name} structured data declares dateModified`)
  check(!/<script[^>]+src="https?:\/\//.test(html), `${name} has no third-party scripts`)
  check(!/<div id="root">\s*<\/div>/.test(html), `${name} prerenders content into #root (not an empty SPA shell)`)
}

// Prerendered copy must reach the static HTML so non-JS crawlers see real content.
check(homepage.includes('We build custom AI automations'), 'homepage prerenders the hero copy')
check(homepage.includes('Liam and Marc met in Bali'), 'homepage prerenders the about copy')
check(homepage.includes('Small Projects.') && homepage.includes('Growth Projects.'), 'homepage prerenders the solutions cards')
check(faq.includes('What services do you offer?'), 'faq prerenders its questions')
check(imprint.includes('VAT number'), 'imprint prerenders its company details')

check(robots.includes('Allow: /'), 'robots.txt allows public crawling')
check(/Sitemap: https:\/\/[^\s]+\/sitemap\.xml/.test(robots), 'robots.txt declares the absolute sitemap URL')
check(sitemap.includes('<loc>https://lmautomations.com/</loc>'), 'sitemap includes the homepage')
check(sitemap.includes('<loc>https://lmautomations.com/faq/</loc>'), 'sitemap includes the faq page')
check(!sitemap.includes('imprint'), 'sitemap excludes the noindexed imprint page')
check(/<meta\s+name="robots"\s+content="noindex, follow"/.test(imprint), 'imprint page is noindexed')
check(/<meta\s+name="robots"\s+content="index, follow/.test(faq), 'faq page is indexable')
check(!homepage.includes('.ai') && !imprint.includes('.ai') && !faq.includes('.ai'), 'built metadata contains no obsolete .ai domain references')
check(homepage.includes('/assets/main-'), 'homepage assets use the custom-domain root path')
check(imprint.includes('/assets/main-'), 'imprint assets use the custom-domain root path')
check(faq.includes('/assets/main-'), 'faq assets use the custom-domain root path')
check((await text('dist/CNAME')).trim() === 'lmautomations.com', 'GitHub Pages artifact includes the custom domain')
check(cssSource.includes('font-display: swap'), 'self-hosted fonts use font-display: swap')

const videoNames = assetNames.filter((name) => name.endsWith('.mp4'))
const mainJsName = assetNames.find((name) => /^main-.*\.js$/.test(name))
const mainCssName = assetNames.find((name) => /^main-.*\.css$/.test(name))
check(videoNames.length === 2, 'responsive mobile and desktop hero videos are built')
check(videoNames.length > 0 && (await Promise.all(videoNames.map((name) => bytes(`dist/assets/${name}`)))).every((size) => size < 4_000_000), 'each hero video is below the 4 MB launch budget')
check(Boolean(mainJsName) && (await bytes(`dist/assets/${mainJsName}`)) < 350_000, 'initial JavaScript is below the 350 KB launch budget')
check(Boolean(mainCssName) && (await bytes(`dist/assets/${mainCssName}`)) < 25_000, 'CSS is below the 25 KB launch budget')
check((await bytes('dist/liam-marc-team-1672.webp')) < 200_000, 'largest responsive team image is below 200 KB')

if (failures.length) {
  console.error(`\n${failures.length} deployment check(s) failed:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nDeployment artifact checks passed.')

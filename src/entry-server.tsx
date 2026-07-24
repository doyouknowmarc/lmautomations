import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Re-exported so scripts/prerender.mjs can bake the JSON-LD into the static HTML
// from the same builders the client uses.
export { schemaForPath } from './seo'

// Called by scripts/prerender.mjs for each route. The returned markup is injected
// into the matching built HTML file's #root so crawlers receive real content;
// the client then hydrates it (see src/main.tsx).
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <App url={url} />
    </StrictMode>,
  )
}

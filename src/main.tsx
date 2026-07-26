import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// The preloader locks <html> overflow and resets to the top, so letting the browser
// also restore a saved offset means two parties fight over scroll position on reload.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const container = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// The production build prerenders content into #root (see scripts/prerender.mjs),
// so hydrate it. The dev server serves an empty #root, so render fresh instead.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}

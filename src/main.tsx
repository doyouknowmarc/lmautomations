import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

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

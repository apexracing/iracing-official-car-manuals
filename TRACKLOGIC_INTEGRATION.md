# Tracklogic integration

The site accepts Tracklogic preferences from the URL. URL values take priority
over saved preferences and are saved for navigation to other pages.

```text
/?theme=dark&lang=zh-CN
/?theme=light&lang=en-US
/?theme=system&lang=zh
```

Supported themes are `light`, `dark`, and `system`. Supported languages are
`zh`, `zh-CN`, `en`, and `en-US`.

An embedded page can be updated without reloading:

```js
iframe.contentWindow.postMessage({
  type: 'tracklogic:preferences',
  theme: 'dark',
  language: 'zh-CN',
}, '*');
```

For a top-level WebView, dispatch `tracklogic:preferences` or call:

```js
window.RaceDocsPreferences.set({ theme: 'dark', language: 'zh-CN' });
```

The page posts `racedocs:ready` when it can receive preferences, and posts
`racedocs:preferences-changed` after applying a change.

## Cloudflare Pages

- Production branch: `main`
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js: `24.14.0`
- Environment variable `SITE_URL`: the final `https://` site or custom-domain URL

Every push, including an automatic upstream synchronization, is rebuilt and
published by Cloudflare Pages Git integration.

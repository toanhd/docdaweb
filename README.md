# DocDaWeb

Browser extension that converts web page content to LLM-friendly formats with one click. Strips junk HTML (classes, inline styles, ads, navigation) and outputs clean Markdown or pure HTML, copied straight to your clipboard.

## Features

- **Element Picker** -- Hover and click to select a specific section of the page. The converted content is instantly copied to your clipboard.
- **Full Page Conversion** -- Extracts the main article content using Mozilla's Readability engine (same technology behind Firefox Reader View).
- **Two output formats**
  - **Markdown** -- ATX headings, fenced code blocks, proper list formatting
  - **Clean HTML** -- All classes, inline styles, and tracking attributes stripped
- **Privacy-first** -- Everything runs locally in your browser. No data is collected, stored, or sent to any server.

## Install

Available on:

- [Chrome Web Store](#) *(link coming soon)*
- [Microsoft Edge Add-ons](#) *(link coming soon)*

### Load from source

```bash
git clone https://github.com/your-username/docdaweb.git
cd docdaweb
npm install
npm run build
```

Then go to `chrome://extensions`, enable **Developer Mode**, click **Load unpacked**, and select the `dist/` folder.

## Development

```bash
npm run dev          # Watch mode -- rebuilds on file changes
npm run build        # Type-check + production build
npm run build:dev    # Dev build without type-checking
npm run typecheck    # Type-check only
npm run lint         # ESLint
```

## How it works

1. Click the extension icon to open the popup
2. Choose a format (Markdown or Clean HTML)
3. Click **Pick Element** to select a specific section, or **Convert Entire Page** for the full article
4. Converted content is copied to your clipboard, ready to paste into any LLM

### Architecture

```
manifest.json           Extension manifest (MV3)
src/
  popup/                Popup UI (HTML/CSS/TS)
  content/content.ts    Content script -- runs Readability + Turndown on page DOM
  content/picker.ts     Element picker -- hover highlight + click to select
  background/           Service worker
  utils/converter.ts    Core conversion logic
```

The content script uses [@mozilla/readability](https://github.com/mozilla/readability) to extract article content and [turndown](https://github.com/mixmark-io/turndown) to convert HTML to Markdown.

## Privacy

DocDaWeb does not collect, store, or transmit any data. See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## License

MIT

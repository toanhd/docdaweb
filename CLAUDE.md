# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

DocDaWeb is a Chrome extension (Manifest V3) that converts web page content to LLM-friendly formats with one click. It strips junk HTML (classes, inline styles, ads, nav) and outputs clean Markdown or pure HTML, copied to clipboard.

## Commands

```bash
npm run build        # Type-check (tsc --noEmit) then production build → dist/
npm run build:dev    # Dev build without type-checking (faster iteration)
npm run dev          # Watch mode — rebuilds on file changes
npm run typecheck    # Type-check only, no emit
npm run lint         # ESLint on src/
```

**Load in Chrome:** Go to `chrome://extensions`, enable Developer Mode, click "Load unpacked", select the `dist/` folder.

## Architecture

```
manifest.json          ← Extension entry point (MV3), references all scripts
src/
  content/content.ts   ← Content script injected into every page. Listens for
                         "convert" messages, runs Readability + Turndown on the
                         page DOM, returns the result.
  popup/               ← Extension popup UI (vanilla HTML/CSS/TS)
    popup.html         ← Popup markup
    popup.css          ← Styles (light mode, green accent)
    popup.ts           ← Handles format selection, sends message to content
                         script, copies result to clipboard
  background/          ← Service worker (minimal, placeholder for future use)
  utils/
    converter.ts       ← Core conversion logic, used by content script
```

### Data Flow

1. User clicks extension icon → popup opens
2. User selects format (Markdown / Clean HTML) and clicks "Convert & Copy"
3. Popup sends `{ action: "convert", format }` message to content script via `chrome.tabs.sendMessage`
4. Content script runs `convert(document, format, url)` which:
   - Clones the DOM and passes it through `@mozilla/readability` to extract article content
   - For Markdown: pipes Readability's HTML output through `turndown`
   - For Clean HTML: strips scripts, styles, classes, inline styles, tracking attrs
5. Content script sends back `{ success, content }` → popup copies to clipboard and shows preview

### Key Libraries

- **@mozilla/readability** — Extracts main article content from page DOM (same engine as Firefox Reader View). Strips ads, nav, sidebars.
- **turndown** — Converts HTML to Markdown. Configured with ATX headings, fenced code blocks, `-` bullet markers.
- **vite-plugin-web-extension** — Vite plugin that handles manifest parsing, multi-entry bundling (popup, content script, service worker), and dev mode for browser extensions.

## Conventions

- TypeScript strict mode. Types from `chrome-types` package (not `@anthropic-ai/chrome-types`).
- Content script communicates with popup via `chrome.runtime.onMessage` / `chrome.tabs.sendMessage`. No background script relay needed for this pattern.
- Output format type is `"markdown" | "html"` (defined as `OutputFormat` in `converter.ts`).
- The `formatOutput()` function adds metadata header (title, author, source, URL) for Markdown output only.
- Popup UI uses light mode with `#10b981` (green) as the accent color. No blue.

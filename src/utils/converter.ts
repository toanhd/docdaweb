import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export type OutputFormat = "markdown" | "html";

export interface ConversionResult {
  title: string;
  byline: string | null;
  siteName: string | null;
  content: string;
  excerpt: string;
  format: OutputFormat;
  url: string;
}

function createTurndownService(): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    hr: "---",
  });

  service.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });

  service.addRule("removeImages", {
    filter: "img",
    replacement: (_content, node) => {
      const el = node as HTMLImageElement;
      const alt = el.getAttribute("alt") || "";
      const src = el.getAttribute("src") || "";
      if (!src) return "";
      return `![${alt}](${src})`;
    },
  });

  return service;
}

interface ParsedArticle {
  title: string;
  content: string;
  textContent: string;
  byline: string | null;
  siteName: string | null;
  excerpt: string;
}

function extractReadableContent(doc: Document): ParsedArticle | null {
  const clone = doc.cloneNode(true) as Document;
  const reader = new Readability(clone, {
    charThreshold: 100,
    keepClasses: false,
  });
  const result = reader.parse();
  if (!result || !result.content || !result.title) return null;

  return {
    title: result.title,
    content: result.content,
    textContent: result.textContent ?? "",
    byline: result.byline ?? null,
    siteName: result.siteName ?? null,
    excerpt: result.excerpt ?? "",
  };
}

function cleanHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("script, style, noscript, iframe, svg").forEach((el) =>
    el.remove()
  );

  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("id");
    el.removeAttribute("onclick");
    el.removeAttribute("onload");
    el.removeAttribute("data-ad");
    el.removeAttribute("data-tracking");
  });

  return doc.body.innerHTML;
}

export function convert(
  doc: Document,
  format: OutputFormat,
  url: string
): ConversionResult | null {
  const article = extractReadableContent(doc);

  if (!article) {
    return null;
  }

  let content: string;

  if (format === "markdown") {
    const turndown = createTurndownService();
    content = turndown.turndown(article.content);
  } else {
    content = cleanHtml(article.content);
  }

  return {
    title: article.title,
    byline: article.byline,
    siteName: article.siteName,
    content,
    excerpt: article.excerpt,
    format,
    url,
  };
}

export function formatOutput(result: ConversionResult): string {
  const header = [
    `# ${result.title}`,
    result.byline ? `**Author:** ${result.byline}` : null,
    result.siteName ? `**Source:** ${result.siteName}` : null,
    `**URL:** ${result.url}`,
    "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  if (result.format === "markdown") {
    return header + result.content;
  }

  return result.content;
}

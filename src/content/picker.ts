import { convertElement, formatOutput, type OutputFormat } from "../utils/converter";

let active = false;
let overlay: HTMLDivElement | null = null;
let currentTarget: Element | null = null;
let format: OutputFormat = "markdown";

function createOverlay(): HTMLDivElement {
  const el = document.createElement("div");
  el.id = "__docdaweb-overlay";
  el.style.cssText = `
    position: fixed;
    pointer-events: none;
    border: 2px solid #10b981;
    background: rgba(16, 185, 129, 0.08);
    z-index: 2147483647;
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(el);
  return el;
}

function positionOverlay(target: Element) {
  if (!overlay) return;
  const rect = target.getBoundingClientRect();
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.display = "block";
}

function onMouseMove(e: MouseEvent) {
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || target.id === "__docdaweb-overlay") return;
  currentTarget = target;
  positionOverlay(target);
}

function onMouseDown(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function onClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  if (!currentTarget) return;

  const result = convertElement(currentTarget, format, window.location.href);
  if (result) {
    const output = formatOutput(result);
    navigator.clipboard.writeText(output);
    showToast("Copied to clipboard!");
  } else {
    showToast("Could not convert this element", true);
  }

  stop();
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    stop();
  }
}

function showToast(message: string, isError = false) {
  const toast = document.createElement("div");
  toast.id = "__docdaweb-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    transition: opacity 0.3s ease;
    background: ${isError ? "#fef2f2" : "#ecfdf5"};
    color: ${isError ? "#991b1b" : "#065f46"};
    border: 1px solid ${isError ? "#fca5a5" : "#6ee7b7"};
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function start(fmt: OutputFormat) {
  if (active) return;
  active = true;
  format = fmt;
  overlay = createOverlay();
  document.body.style.cursor = "crosshair";
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("keydown", onKeyDown, true);
}

function stop() {
  if (!active) return;
  active = false;
  currentTarget = null;
  document.body.style.cursor = "";
  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("click", onClick, true);
  document.removeEventListener("mousedown", onMouseDown, true);
  document.removeEventListener("keydown", onKeyDown, true);
  overlay?.remove();
  overlay = null;
}

export function initPicker() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "start-picker") {
      start(message.format);
    }
  });
}

import type { OutputFormat } from "../utils/converter";

let selectedFormat: OutputFormat = "markdown";
let lastContent: string | null = null;

const formatButtons = document.querySelectorAll<HTMLButtonElement>(".format-btn");
const convertBtn = document.getElementById("convert-btn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const previewSection = document.getElementById("preview-section") as HTMLDivElement;
const previewEl = document.getElementById("preview") as HTMLPreElement;
const copyBtn = document.getElementById("copy-btn") as HTMLButtonElement;

formatButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    formatButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedFormat = btn.dataset.format as OutputFormat;
  });
});

function showStatus(message: string, type: "success" | "error" | "loading") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

convertBtn.addEventListener("click", async () => {
  convertBtn.disabled = true;
  showStatus("Converting...", "loading");
  previewSection.classList.add("hidden");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      showStatus("No active tab found", "error");
      convertBtn.disabled = false;
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "convert",
      format: selectedFormat,
    });

    if (!response?.success) {
      showStatus(response?.error || "Conversion failed", "error");
      convertBtn.disabled = false;
      return;
    }

    lastContent = response.content;
    await copyToClipboard(response.content);

    showStatus("Copied to clipboard!", "success");
    previewEl.textContent = response.content;
    previewSection.classList.remove("hidden");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    showStatus(`Error: ${message}`, "error");
  } finally {
    convertBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  if (lastContent) {
    await copyToClipboard(lastContent);
    showStatus("Copied to clipboard!", "success");
  }
});

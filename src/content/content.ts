import { convert, formatOutput, type OutputFormat } from "../utils/converter";

interface ConvertMessage {
  action: "convert";
  format: OutputFormat;
}

interface ConvertResponse {
  success: boolean;
  content?: string;
  error?: string;
}

chrome.runtime.onMessage.addListener(
  (
    message: ConvertMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ConvertResponse) => void
  ) => {
    if (message.action !== "convert") return;

    try {
      const result = convert(document, message.format, window.location.href);

      if (!result) {
        sendResponse({
          success: false,
          error: "Could not extract content from this page",
        });
        return;
      }

      const output = formatOutput(result);
      sendResponse({ success: true, content: output });
    } catch (err) {
      sendResponse({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    return true;
  }
);

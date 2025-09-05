export const GA_ID = "G-81394D4BVC";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const isProduction = import.meta.env.MODE === "production";

export function sendPageview(path: string): void {
  if (!isProduction || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    send_to: GA_ID,
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (!isProduction || typeof window.gtag !== "function") return;
  window.gtag("event", name, { send_to: GA_ID, ...params });
}

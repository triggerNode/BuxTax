declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtmInitialized?: boolean;
  }
}

export function initGTM(): void {
  const gtmId = (import.meta as any).env?.VITE_GTM_ID as string | undefined;
  if (!gtmId || window.gtmInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  const firstScript = document.getElementsByTagName("script")[0];
  const gtmScript = document.createElement("script");
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  firstScript?.parentNode?.insertBefore(gtmScript, firstScript);

  // Add noscript iframe for non-JS environments (best-effort)
  const noScriptEl = document.createElement("noscript");
  noScriptEl.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body?.prepend(noScriptEl);

  window.gtmInitialized = true;
}

export function pushDataLayer(data: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

import html2canvas from "html2canvas";
import domtoimage from "dom-to-image-more";

export interface ExportOptions {
  format: "png" | "pdf";
  quality?: number;
  filename?: string;
  addWatermark?: boolean;
}

// Helper function to resolve CSS custom properties to actual color values
function resolveBackgroundColor(): string {
  try {
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--background").trim();
    if (bgColor) {
      // Already a concrete color function or hex
      if (
        bgColor.startsWith("hsl(") ||
        bgColor.startsWith("rgb(") ||
        bgColor.startsWith("#")
      ) {
        return bgColor;
      }
      // Support HSL channel tokens like "60 56.5% 95.5%"
      if (bgColor.match(/^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/)) {
        return `hsl(${bgColor})`;
      }
    }
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isDarkMode ? "#0a0a0a" : "#ffffff";
  } catch (error) {
    console.warn("Failed to resolve background color, using default:", error);
    return "#ffffff";
  }
}

async function waitForFonts(): Promise<void> {
  try {
    const f: any = (document as any).fonts;
    if (f?.ready) await f.ready;
  } catch {}
  await new Promise((r) => setTimeout(r, 100));
}

function visibleCenter(el: HTMLElement) {
  try {
    (el as any).scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "instant" as any,
    });
  } catch {}
}

async function rasterizeWithH2C(node: HTMLElement): Promise<HTMLCanvasElement> {
  // html2canvas expects a valid CSS color. Our design tokens store HSL channels
  // like "220 14% 96%" in `--background`, which breaks html2canvas' parser.
  // Resolve to a concrete color string first.
  const backgroundColor = resolveBackgroundColor() || "#fff";
  const c = await html2canvas(node, {
    backgroundColor,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: false,
    scrollX: 0,
    scrollY: 0,
    onclone: (doc: Document) => {
      try {
        doc.querySelectorAll("[data-share-exclude]").forEach((n) => {
          (n as HTMLElement).style.display = "none";
        });
        const s = doc.createElement("style");
        s.textContent = `*{animation:none!important;transition:none!important}
          .rounded-full{display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important}`;
        doc.head.appendChild(s);
      } catch (e) {
        console.warn("Export: onclone normalization failed", e);
      }
    },
  });
  return c;
}

async function rasterizeWithDomToImage(
  node: HTMLElement
): Promise<HTMLCanvasElement> {
  const backgroundColor = resolveBackgroundColor() || "#fff";
  const dataUrl: string = await domtoimage.toPng(node, {
    bgcolor: backgroundColor,
    style: {
      animation: "none",
      transition: "none",
    },
    filter: (n: Node) =>
      !(n instanceof Element && n.hasAttribute("data-share-exclude")),
    // Force deterministic viewport
    quality: 1,
    cacheBust: true,
  });
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve as any;
    img.onerror = reject as any;
  });
  const canvas = document.createElement("canvas");
  const scale = 1; // dom-to-image already renders sharply; adjust if needed
  canvas.width = Math.max(
    1,
    Math.floor((img.naturalWidth || img.width) * scale)
  );
  canvas.height = Math.max(
    1,
    Math.floor((img.naturalHeight || img.height) * scale)
  );
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

async function rasterize(element: HTMLElement): Promise<HTMLCanvasElement> {
  visibleCenter(element);
  await waitForFonts();
  try {
    const c = await rasterizeWithH2C(element);
    return c;
  } catch (e) {
    console.warn(
      "Export: html2canvas failed, attempting dom-to-image fallback",
      e
    );
    try {
      const c2 = await rasterizeWithDomToImage(element);
      return c2;
    } catch (e2) {
      console.error("Export: dom-to-image fallback failed", e2);
      throw new Error("Export failed: Unable to rasterize card");
    }
  }
}

export async function exportCard(
  elementId: string,
  options: ExportOptions = { format: "png" }
): Promise<void> {
  let element = document.getElementById(elementId);

  if (!element) {
    console.warn(
      `Element with ID "${elementId}" not found. Trying fallback IDs...`
    );
    const fallbackIds = ["main-content", "root"];
    for (const fallbackId of fallbackIds) {
      element = document.getElementById(fallbackId);
      if (element) {
        console.log(`Found fallback element with ID: ${fallbackId}`);
        break;
      }
    }
  }

  if (!element) {
    console.error('Available elements with "buxtax" in ID:');
    document.querySelectorAll('[id*="buxtax"]').forEach((el) => {
      console.log(`- ${(el as HTMLElement).id}`);
    });
    throw new Error(
      `Element with ID "${elementId}" not found. Also tried fallback IDs: main-content, root.`
    );
  }

  try {
    console.log("Found element to export:", element);
    console.log("Element dimensions:", {
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
    });

    element.classList.add("exporting");
    await new Promise((resolve) => setTimeout(resolve, 300));
    const canvas = await rasterize(element as HTMLElement);
    element.classList.remove("exporting");

    if (options.addWatermark !== false) {
      addBuxTaxWatermark(canvas);
    }

    const filename = options.filename || `buxtax-${Date.now()}`;
    if (options.format === "png") {
      downloadCanvas(canvas, `${filename}.png`);
    } else if (options.format === "pdf") {
      await exportToPDF(canvas, `${filename}.pdf`);
    }
  } catch (error) {
    element.classList.remove("exporting");
    console.error("Export pipeline error:", error);
    if (error instanceof Error) {
      throw new Error(`Export failed: ${error.message}`);
    }
    throw error;
  }
}

export async function captureCardImageBlob(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(
      `captureCardImageBlob: element with ID "${elementId}" not found.`
    );
  }
  await waitForFonts();
  const canvas = await rasterize(element as HTMLElement);
  return await new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png"
    )
  );
}

function addBuxTaxWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#3F3F46";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  const text = "BuxTax.com";
  const padding = 16;
  const x = canvas.width - padding;
  const y = canvas.height - padding;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png", 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function exportToPDF(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  // A4 page size in mm
  const pageWidth = 210;
  const pageHeight = 297;

  // Add comfortable margins and center the card on the page
  const margin = 12; // mm
  const maxImgWidth = pageWidth - margin * 2;
  const maxImgHeight = pageHeight - margin * 2;

  // Maintain aspect ratio
  let imgWidth = maxImgWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;
  if (imgHeight > maxImgHeight) {
    imgHeight = maxImgHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }

  const isLandscape = imgWidth > imgHeight;
  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Recompute page size according to orientation
  const effectivePageWidth = isLandscape ? pageHeight : pageWidth;
  const effectivePageHeight = isLandscape ? pageWidth : pageHeight;

  const x = (effectivePageWidth - imgWidth) / 2;
  const y = (effectivePageHeight - imgHeight) / 2;

  const imgData = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
  pdf.save(filename);
}

export function generateShareableURL(data: any, cardType: string): string {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    utm_source: "share",
    utm_medium: "link",
    utm_campaign: "user_share",
    card: cardType,
    data: btoa(JSON.stringify(data)),
  });
  return `${baseURL}?${params.toString()}`;
}

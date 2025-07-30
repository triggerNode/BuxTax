import html2canvas from "html2canvas";

export interface ExportOptions {
  format: "png" | "pdf";
  quality?: number;
  filename?: string;
  addWatermark?: boolean;
}

// Helper function to resolve CSS custom properties to actual color values
function resolveBackgroundColor(): string {
  try {
    // Try to get the computed background color from the document body or html element
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--background").trim();

    if (bgColor) {
      // If we have a custom property value, try to resolve it
      if (
        bgColor.startsWith("hsl(") ||
        bgColor.startsWith("rgb(") ||
        bgColor.startsWith("#")
      ) {
        return bgColor;
      }
      // Handle space-separated HSL values like "0 0% 100%"
      if (bgColor.match(/^\d+\s+\d+%\s+\d+%$/)) {
        return `hsl(${bgColor})`;
      }
    }

    // Fallback: check if we're in dark mode by looking at common indicators
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Return appropriate background color
    return isDarkMode ? "#0a0a0a" : "#ffffff";
  } catch (error) {
    console.warn("Failed to resolve background color, using default:", error);
    return "#ffffff"; // Safe fallback
  }
}

export async function exportCard(
  elementId: string,
  options: ExportOptions = { format: "png" }
): Promise<void> {
  let element = document.getElementById(elementId);

  // Fallback strategy: try alternative element IDs if primary not found
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
    // Log all elements with IDs containing "buxtax" for debugging
    console.error('Available elements with "buxtax" in ID:');
    document.querySelectorAll('[id*="buxtax"]').forEach((el) => {
      console.log(`- ${el.id}`);
    });

    throw new Error(
      `Element with ID "${elementId}" not found. Also tried fallback IDs: main-content, root. Check console for available elements.`
    );
  }

  try {
    console.log("Found element to export:", element);
    console.log("Element dimensions:", {
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Resolve background color before rendering
    const backgroundColor = resolveBackgroundColor();
    console.log("Resolved background color:", backgroundColor);

    // Add export class for styling during capture
    element.classList.add("exporting");

    // Wait a bit for any dynamic content to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      backgroundColor: backgroundColor,
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        try {
          // Ensure styles are preserved in the clone and fix CSS custom properties
          const clonedElement = clonedDoc.getElementById(element.id);
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.position = "static";

            // Fix any CSS custom properties in the cloned document
            const allElements = clonedDoc.querySelectorAll("*");
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;

              // Fix background colors with CSS custom properties
              if (
                htmlEl.style.backgroundColor &&
                htmlEl.style.backgroundColor.includes("var(")
              ) {
                const computedStyle = getComputedStyle(htmlEl);
                const resolvedBg = computedStyle.backgroundColor;
                if (resolvedBg && resolvedBg !== "rgba(0, 0, 0, 0)") {
                  htmlEl.style.backgroundColor = resolvedBg;
                }
              }

              // Fix color properties with CSS custom properties
              if (htmlEl.style.color && htmlEl.style.color.includes("var(")) {
                const computedStyle = getComputedStyle(htmlEl);
                const resolvedColor = computedStyle.color;
                if (resolvedColor) {
                  htmlEl.style.color = resolvedColor;
                }
              }
            });
          }
        } catch (cloneError) {
          console.warn("Error processing cloned document:", cloneError);
        }
      },
    });

    // Remove export class
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
    // Remove export class in case of error
    element.classList.remove("exporting");
    console.error("html2canvas error details:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("angle")) {
        throw new Error(
          "Export failed due to unsupported CSS properties. This may be caused by gradients or CSS custom properties that html2canvas cannot process."
        );
      } else if (error.message.includes("taint")) {
        throw new Error(
          "Export failed due to cross-origin image restrictions. Some images may not be accessible."
        );
      } else {
        throw new Error(`Export failed: ${error.message}`);
      }
    }
    throw error;
  }
}

function addBuxTaxWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Add subtle BuxTax watermark in bottom right
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#6b7280"; // Use a proper color value instead of CSS custom properties
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

  // Calculate dimensions to fit the canvas in the PDF
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  pdf.save(filename);
}

export function generateShareableURL(data: any, cardType: string): string {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    utm_source: "share",
    utm_medium: "link",
    utm_campaign: "user_share",
    card: cardType,
    // Add data as base64 encoded JSON for shareability
    data: btoa(JSON.stringify(data)),
  });

  return `${baseURL}?${params.toString()}`;
}

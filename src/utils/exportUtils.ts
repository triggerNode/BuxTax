import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'png' | 'pdf';
  quality?: number;
  filename?: string;
  addWatermark?: boolean;
}

export async function exportCard(
  elementId: string, 
  options: ExportOptions = { format: 'png' }
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Add export class for styling during capture
    element.classList.add('exporting');

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Remove export class
    element.classList.remove('exporting');

    if (options.addWatermark !== false) {
      addBuxTaxWatermark(canvas);
    }

    const filename = options.filename || `buxtax-${Date.now()}`;

    if (options.format === 'png') {
      downloadCanvas(canvas, `${filename}.png`);
    } else if (options.format === 'pdf') {
      await exportToPDF(canvas, `${filename}.pdf`);
    }
  } catch (error) {
    // Remove export class in case of error
    element.classList.remove('exporting');
    throw error;
  }
}

function addBuxTaxWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Add subtle BuxTax watermark in bottom right
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#666666';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  
  const text = 'BuxTax.com';
  const padding = 16;
  const x = canvas.width - padding;
  const y = canvas.height - padding;
  
  ctx.fillText(text, x, y);
  ctx.restore();
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function exportToPDF(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  // For now, we'll export as PNG since PDF generation requires additional libraries
  // This can be enhanced with jsPDF later
  const dataURL = canvas.toDataURL('image/png', 1.0);
  
  // Convert to blob for download
  const response = await fetch(dataURL);
  const blob = await response.blob();
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.replace('.pdf', '.png'); // Fallback to PNG for now
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
}

export function generateShareableURL(data: any, cardType: string): string {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'link',
    utm_campaign: 'user_share',
    card: cardType,
    // Add data as base64 encoded JSON for shareability
    data: btoa(JSON.stringify(data)),
  });
  
  return `${baseURL}?${params.toString()}`;
}
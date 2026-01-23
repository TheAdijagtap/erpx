import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


/**
 * Generates a PDF from an HTML element and downloads it
 * Uses the same styling as the print function for consistent output
 * @param htmlContent - The HTML string to render
 * @param filename - The filename for the PDF (without extension)
 */
export async function downloadAsPdf(htmlContent: string, filename: string): Promise<void> {
  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.background = '#ffffff';
  document.body.appendChild(tempDiv);

  // Use the EXACT same styles as print.ts for consistent formatting
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 8px; color: #0f172a; font-size: 14px; line-height: 1.4; }
    .doc { max-width: 100%; margin: 0 auto; border: 2px solid #0f172a; padding: 16px; border-radius: 8px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .brand { font-size: 20px; font-weight: 700; }
    .muted { color: #64748b; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 8px 0; }
    h2 { font-size: 18px; font-weight: 700; margin: 0; padding: 0; text-align: center; }
    strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; font-size: 13px; }
    th { background: #f8fafc; font-weight: 600; }
    .totals { margin-top: 8px; width: 100%; }
    .totals td { border: none; padding: 4px 8px; font-size: 14px; }
    .totals .label { color: #64748b; }
    .totals .value { text-align: right; font-weight: 600; }
    .footer { margin-top: 16px; font-size: 12px; color: #64748b; }
    .section { border: 1px solid #e2e8f0; margin: 6px 0; padding: 12px; border-radius: 4px; }
    .amount-words { font-style: italic; color: #64748b; margin-top: 4px; font-size: 12px; }
    .terms { margin-top: 8px; }
    .signature-section { margin-top: 12px; text-align: right; }
    .signature-image { max-width: 100px; max-height: 50px; }
    img { max-height: 36px; }
  `;
  tempDiv.appendChild(styleEl);

  // Create the document container with same structure as print
  const docDiv = document.createElement('div');
  docDiv.className = 'doc';
  docDiv.innerHTML = htmlContent;
  tempDiv.appendChild(docDiv);

  try {
    // Wait for images to load
    const images = tempDiv.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
          setTimeout(() => resolve(true), 2000);
        }
      });
    }));

    // Small delay to ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    // Calculate dimensions for A4
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (handle multi-page if needed)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download
    pdf.save(`${filename}.pdf`);
  } finally {
    // Cleanup
    document.body.removeChild(tempDiv);
  }
}

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


/**
 * Generates a PDF from an HTML element and downloads it
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
  tempDiv.style.padding = '20px';
  tempDiv.innerHTML = htmlContent;
  document.body.appendChild(tempDiv);

  // Add print styles inline
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .section { margin-bottom: 16px; }
    .header { display: flex; align-items: flex-start; gap: 16px; }
    .header img { max-height: 60px; object-fit: contain; }
    .brand { font-size: 20px; font-weight: 700; color: #1f2937; }
    .muted { font-size: 12px; color: #6b7280; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    h2 { font-size: 18px; font-weight: 600; margin: 0; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    .totals { width: auto; margin-left: auto; border: none; }
    .totals td { border: none; padding: 4px 8px; }
    .totals .label { text-align: right; color: #6b7280; }
    .totals .value { text-align: right; font-weight: 500; }
    .amount-words { margin-top: 8px; font-style: italic; font-size: 12px; color: #374151; }
    .terms { font-size: 11px; }
    .signature-section { margin-top: 24px; text-align: right; }
    .signature-image { max-height: 50px; }
    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
  `;
  tempDiv.prepend(styleEl);

  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ShareOptions {
  phoneNumber?: string;
  message?: string;
  fileName: string;
}

/**
 * Generate a PDF from an HTML element and share via WhatsApp
 */
export async function shareToWhatsApp(
  elementId: string,
  options: ShareOptions
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Generate PDF from the element
  const pdf = await generatePdfFromElement(element, options.fileName);
  const pdfBlob = pdf.output("blob");
  const pdfFile = new File([pdfBlob], `${options.fileName}.pdf`, {
    type: "application/pdf",
  });

  // Check if Web Share API with file sharing is supported
  const canShareFiles = navigator.canShare?.({ files: [pdfFile] });

  if (canShareFiles) {
    // Mobile: Use native share with PDF file
    try {
      await navigator.share({
        files: [pdfFile],
        title: options.fileName,
        text: options.message || `Please find attached: ${options.fileName}`,
      });
      return;
    } catch (error) {
      // User cancelled or share failed, fall through to WhatsApp web
      if ((error as Error).name === "AbortError") {
        return; // User cancelled, don't fall through
      }
      console.log("Native share failed, falling back to WhatsApp Web");
    }
  }

  // Desktop/Fallback: Download PDF and open WhatsApp with message
  // First download the PDF
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = `${options.fileName}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);

  // Then open WhatsApp with a message
  const message = encodeURIComponent(
    options.message ||
      `Please find the ${options.fileName} document. I have downloaded and will share it with you shortly.`
  );
  const whatsappUrl = options.phoneNumber
    ? `https://wa.me/${options.phoneNumber.replace(/[^0-9]/g, "")}?text=${message}`
    : `https://wa.me/?text=${message}`;

  window.open(whatsappUrl, "_blank");
}

/**
 * Generate a PDF from an HTML element
 */
async function generatePdfFromElement(
  element: HTMLElement,
  fileName: string
): Promise<jsPDF> {
  // Clone the element for rendering
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "800px";
  clone.style.background = "white";
  clone.style.padding = "20px";
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  } finally {
    document.body.removeChild(clone);
  }
}

/**
 * Check if native file sharing is supported
 */
export function canShareFiles(): boolean {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }
  // Create a dummy file to test
  const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
  return navigator.canShare({ files: [testFile] });
}

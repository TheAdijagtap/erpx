import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export interface ShareOptions {
  phoneNumber?: string;
  message?: string;
  fileName: string;
}

/**
 * Generate a PDF from an HTML element, upload to storage, and share via WhatsApp Web
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

  // Upload PDF to storage and get public URL
  const timestamp = Date.now();
  const filePath = `${timestamp}-${options.fileName}.pdf`;

  const { data, error } = await supabase.storage
    .from("shared-documents")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("shared-documents")
    .getPublicUrl(data.path);

  const pdfUrl = urlData.publicUrl;

  // Open WhatsApp Web with the message including PDF link
  const message = encodeURIComponent(
    (options.message || `Please find the ${options.fileName} document.`) +
      `\n\n📄 Download PDF: ${pdfUrl}`
  );
  const whatsappUrl = options.phoneNumber
    ? `https://web.whatsapp.com/send?phone=${options.phoneNumber.replace(/[^0-9]/g, "")}&text=${message}`
    : `https://web.whatsapp.com/send?text=${message}`;

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
  const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
  return navigator.canShare({ files: [testFile] });
}

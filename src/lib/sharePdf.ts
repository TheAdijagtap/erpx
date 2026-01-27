import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function shareAsPdf(elementId: string, filename: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) {
    throw new Error("Element not found");
  }
  
  // Create canvas from element
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
  });
  
  // Create PDF
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;
  
  pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  
  // Generate blob for sharing
  const pdfBlob = pdf.output("blob");
  const pdfFile = new File([pdfBlob], `${filename}.pdf`, { type: "application/pdf" });
  
  // Check if Web Share API is available and supports file sharing
  const canShare = navigator.share && navigator.canShare?.({ files: [pdfFile] });
  
  if (canShare) {
    try {
      await navigator.share({
        title: title,
        files: [pdfFile],
      });
      return { shared: true };
    } catch (err) {
      // User cancelled or share failed, fall back to download
      if ((err as Error).name === "AbortError") {
        return { shared: false, cancelled: true };
      }
    }
  }
  
  // Fallback: download the PDF
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return { shared: false, downloaded: true };
}

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

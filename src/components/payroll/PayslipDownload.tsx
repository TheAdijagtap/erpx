import { useData } from "@/store/SupabaseDataContext";
import { formatINR } from "@/lib/format";
import { numberToWords } from "@/lib/numberToWords";
import { escapeHtml } from "@/lib/htmlEscape";

interface PayslipData {
  employee_name: string;
  employee_designation?: string;
  employee_department?: string;
  employee_bank_name?: string;
  employee_bank_account?: string;
  employee_bank_ifsc?: string;
  employee_uan?: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  days_worked: number;
  total_days: number;
  leaves_taken: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  paid_date: string | null;
}

interface BusinessData {
  name: string;
  address: string;
  logo?: string;
  signature?: string;
  phone: string;
  email: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function generatePayslipHTML(payslip: PayslipData, business: BusinessData) {
  const monthName = MONTHS[payslip.month - 1];
  const amountWords = numberToWords(payslip.net_salary);
  const bName = escapeHtml(business.name);
  const bAddr = escapeHtml(business.address);
  const bPhone = escapeHtml(business.phone);
  const bEmail = escapeHtml(business.email);
  const eName = escapeHtml(payslip.employee_name);
  const eDept = escapeHtml(payslip.employee_department || "—");
  const eDesig = escapeHtml(payslip.employee_designation || "—");
  const eBankName = escapeHtml(payslip.employee_bank_name || "—");
  const eBankAcc = escapeHtml(payslip.employee_bank_account || "—");
  const eBankIfsc = escapeHtml(payslip.employee_bank_ifsc || "—");
  const eUan = escapeHtml(payslip.employee_uan || "—");
  const logoImg = business.logo ? `<img src="${escapeHtml(business.logo)}" alt="Logo" style="max-height:48px;max-width:120px;object-fit:contain;" />` : "";
  const signatureImg = business.signature ? `<img src="${escapeHtml(business.signature)}" alt="Signature" style="max-height:60px;max-width:150px;object-fit:contain;" />` : "";

  return `<!doctype html><html><head><title>Payslip - ${eName} - ${monthName} ${payslip.year}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; font-size: 13px; line-height: 1.5; }
  .payslip { max-width: 800px; margin: 20px auto; border: 2px solid #1e293b; border-radius: 8px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .company-name { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
  .company-detail { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
  .payslip-title { background: #f1f5f9; text-align: center; padding: 8px; font-size: 15px; font-weight: 700; letter-spacing: 1px; color: #334155; border-bottom: 1px solid #e2e8f0; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #e2e8f0; }
  .info-section { padding: 16px 24px; }
  .info-section:first-child { border-right: 1px solid #e2e8f0; }
  .info-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .info-value { font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; }
  .earnings-table { width: 100%; border-collapse: collapse; }
  .earnings-table th { background: #f8fafc; padding: 10px 24px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
  .earnings-table td { padding: 10px 24px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .earnings-table .amount { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .earnings-table tr:last-child td { border-bottom: none; }
  .summary-row { background: #f8fafc; }
  .summary-row td { font-weight: 700; font-size: 14px; border-top: 2px solid #e2e8f0; }
  .net-row { background: #1e293b; }
  .net-row td { color: #fff; font-weight: 700; font-size: 15px; padding: 12px 24px; }
  .amount-words { padding: 12px 24px; font-style: italic; color: #64748b; font-size: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .footer { padding: 16px 24px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; }
  .footer-note { font-size: 11px; color: #94a3b8; }
  .stamp { text-align: right; }
  .stamp-line { border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 11px; color: #64748b; min-width: 150px; text-align: center; }
  .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .status-paid { background: #dcfce7; color: #166534; }
  .status-approved { background: #dbeafe; color: #1e40af; }
  .status-draft { background: #f1f5f9; color: #475569; }
  @media print {
    @page { margin: 10mm; size: A4; }
    body { margin: 0; }
    .payslip { border: 2px solid #1e293b; margin: 0; }
  }
</style>
</head><body>
<div class="payslip">
  <div class="header">
    <div class="header-left">
      ${logoImg}
      <div>
        <div class="company-name">${bName}</div>
        <div class="company-detail">${bAddr}</div>
        <div class="company-detail">${bPhone} · ${bEmail}</div>
      </div>
    </div>
    <div>
      <span class="status-badge status-${payslip.status}">${payslip.status}</span>
    </div>
  </div>

  <div class="payslip-title">PAYSLIP FOR ${monthName.toUpperCase()} ${payslip.year}</div>

  <div class="info-grid">
    <div class="info-section">
      <div class="info-label">Employee Name</div>
      <div class="info-value">${eName}</div>
      <div class="info-label">Department</div>
      <div class="info-value">${eDept}</div>
      <div class="info-label">Designation</div>
      <div class="info-value">${eDesig}</div>
    </div>
    <div class="info-section">
      <div class="info-label">Pay Period</div>
      <div class="info-value">${monthName} ${payslip.year}</div>
      <div class="info-label">Working Days</div>
      <div class="info-value">${payslip.days_worked} / ${payslip.total_days} (${payslip.leaves_taken} leaves)</div>
      <div class="info-label">Payment Date</div>
      <div class="info-value">${payslip.paid_date || "—"}</div>
    </div>
  </div>

  <div class="info-grid" style="border-bottom:none;">
    <div class="info-section" style="border-right:1px solid #e2e8f0;">
      <div class="info-label">Bank Name</div>
      <div class="info-value">${eBankName}</div>
    </div>
    <div class="info-section" style="display:flex;gap:24px;">
      <div><div class="info-label">Account No.</div><div class="info-value">${eBankAcc}</div></div>
      <div><div class="info-label">IFSC</div><div class="info-value">${eBankIfsc}</div></div>
      <div><div class="info-label">UAN</div><div class="info-value">${eUan}</div></div>
    </div>
  </div>

  <table class="earnings-table">
    <thead>
      <tr><th>Earnings</th><th class="amount">Amount (₹)</th></tr>
    </thead>
    <tbody>
      <tr><td>Basic Salary</td><td class="amount">${formatINR(payslip.basic_salary)}</td></tr>
      <tr><td>Allowances</td><td class="amount">${formatINR(payslip.allowances)}</td></tr>
      <tr class="summary-row"><td>Gross Salary</td><td class="amount">${formatINR(payslip.gross_salary)}</td></tr>
    </tbody>
  </table>

  <table class="earnings-table">
    <thead>
      <tr><th>Deductions</th><th class="amount">Amount (₹)</th></tr>
    </thead>
    <tbody>
      <tr><td>Deductions</td><td class="amount">${formatINR(payslip.deductions)}</td></tr>
    </tbody>
  </table>

  <table class="earnings-table">
    <tbody>
      <tr class="net-row"><td>Net Salary</td><td class="amount">${formatINR(payslip.net_salary)}</td></tr>
    </tbody>
  </table>

  <div class="amount-words"><strong>Amount in words:</strong> ${escapeHtml(amountWords)}</div>

  <div class="footer">
    <div class="footer-note">This is a computer-generated payslip.</div>
    <div class="stamp">
      ${signatureImg}
      <div class="stamp-line">Authorized Signatory</div>
    </div>
  </div>
</div>
</body></html>`;
}

export async function downloadPayslip(payslip: PayslipData, business: BusinessData) {
  const html = generatePayslipHTML(payslip, business);
  const monthName = MONTHS[payslip.month - 1];
  const fileName = `Payslip_${payslip.employee_name.replace(/\s+/g, '_')}_${monthName}_${payslip.year}.pdf`;

  // Use iframe to render full HTML with styles
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;z-index:-1;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) { iframe.remove(); return; }
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for iframe to render and images to load
  await new Promise(r => setTimeout(r, 300));
  const imgs = iframeDoc.getElementsByTagName('img');
  await Promise.all(Array.from(imgs).map(img => new Promise(r => {
    if (img.complete) r(true);
    else { img.onload = () => r(true); img.onerror = () => r(true); setTimeout(() => r(true), 2000); }
  })));

  const container = iframeDoc.body;

  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 10;
    if (imgHeight <= pageHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
    } else {
      // Multi-page support
      let remainingHeight = canvas.height;
      let sourceY = 0;
      const sliceHeight = Math.floor((canvas.width * (pageHeight - 20)) / imgWidth);

      while (remainingHeight > 0) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeight, remainingHeight);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceImgHeight = (sliceCanvas.height * imgWidth) / canvas.width;
          if (sourceY > 0) pdf.addPage();
          pdf.addImage(sliceData, 'PNG', 10, 10, imgWidth, sliceImgHeight);
        }
        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
      }
    }

    pdf.save(fileName);
  } catch (err) {
    console.error('PDF generation failed:', err);
    // Fallback: download as HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName.replace('.pdf', '.html'); a.click();
    URL.revokeObjectURL(url);
  } finally {
    iframe.remove();
  }
}

export async function generatePayslipPDFBlob(payslip: PayslipData, business: BusinessData): Promise<Blob> {
  const html = generatePayslipHTML(payslip, business);

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;z-index:-1;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) { iframe.remove(); throw new Error('Failed to create iframe'); }
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  await new Promise(r => setTimeout(r, 300));
  const imgs = iframeDoc.getElementsByTagName('img');
  await Promise.all(Array.from(imgs).map(img => new Promise(r => {
    if (img.complete) r(true);
    else { img.onload = () => r(true); img.onerror = () => r(true); setTimeout(() => r(true), 2000); }
  })));

  const container = iframeDoc.body;
  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    return pdf.output('blob');
  } finally {
    iframe.remove();
  }
}

const MONTHS_ZIP = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export async function downloadAllPayslipsAsZip(
  payslips: PayslipData[],
  business: BusinessData,
  month: number,
  year: number
) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const monthName = MONTHS_ZIP[month - 1];

  for (let i = 0; i < payslips.length; i++) {
    const p = payslips[i];
    try {
      const blob = await generatePayslipPDFBlob(p, business);
      const fileName = `Payslip_${p.employee_name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`;
      zip.file(fileName, blob);
    } catch (err) {
      console.error(`Failed to generate PDF for ${p.employee_name}:`, err);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Payslips_${monthName}_${year}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

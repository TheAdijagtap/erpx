import jsPDF from 'jspdf';
import { formatDateIN, formatINR } from './format';
import { numberToWords } from './numberToWords';
import { BusinessInfo, PurchaseOrder, Supplier } from '@/types/inventory';

interface ProformaInvoiceData {
  proformaNumber: string;
  date: Date;
  validUntil?: Date;
  buyerInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstNumber?: string;
  };
  items: Array<{
    item: { name: string };
    quantity: number;
    unitPrice: number;
    total: number;
    hsnCode?: string;
  }>;
  additionalCharges?: Array<{ name: string; amount: number }>;
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  paymentTerms?: string;
  notes?: string;
}

interface PurchaseOrderData {
  poNumber: string;
  date: Date;
  expectedDelivery?: Date;
  supplier: Supplier;
  items: Array<{
    item: { name: string; unit: string };
    quantity: number;
    unitPrice: number;
    total: number;
    hsnCode?: string;
  }>;
  additionalCharges?: Array<{ name: string; amount: number }>;
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: string;
  paymentTerms?: string;
  notes?: string;
}

export function generateProformaPDF(
  invoice: ProformaInvoiceData,
  businessInfo: BusinessInfo
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header - Business Info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(businessInfo.address, 14, y);
  y += 5;
  doc.text(`${businessInfo.email} | ${businessInfo.phone}`, 14, y);
  if (businessInfo.gstNumber) {
    y += 5;
    doc.text(`GST: ${businessInfo.gstNumber}`, 14, y);
  }

  // Title
  y += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION CUM PROFORMA', pageWidth / 2, y, { align: 'center' });

  // Invoice details
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation No: ${invoice.proformaNumber}`, 14, y);
  doc.text(`Date: ${formatDateIN(invoice.date)}`, pageWidth - 14, y, { align: 'right' });
  if (invoice.validUntil) {
    y += 5;
    doc.text(`Valid Until: ${formatDateIN(invoice.validUntil)}`, pageWidth - 14, y, { align: 'right' });
  }

  // Buyer Info
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.buyerInfo.name, 14, y);
  y += 5;
  doc.text(invoice.buyerInfo.address, 14, y);
  y += 5;
  doc.text(`${invoice.buyerInfo.email} | ${invoice.buyerInfo.phone}`, 14, y);
  if (invoice.buyerInfo.gstNumber) {
    y += 5;
    doc.text(`GST: ${invoice.buyerInfo.gstNumber}`, 14, y);
  }

  // Items Table Header
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
  doc.text('#', 16, y);
  doc.text('Item', 26, y);
  doc.text('HSN', 90, y);
  doc.text('Qty', 115, y);
  doc.text('Rate', 135, y);
  doc.text('Amount', pageWidth - 16, y, { align: 'right' });

  // Items
  y += 8;
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(index + 1), 16, y);
    doc.text(item.item.name.substring(0, 30), 26, y);
    doc.text(item.hsnCode || '-', 90, y);
    doc.text(String(item.quantity), 115, y);
    doc.text(formatINR(item.unitPrice), 135, y);
    doc.text(formatINR(item.total), pageWidth - 16, y, { align: 'right' });
    y += 6;
  });

  // Totals
  y += 5;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  
  doc.text('Subtotal:', 120, y);
  doc.text(formatINR(invoice.subtotal), pageWidth - 16, y, { align: 'right' });

  if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
    invoice.additionalCharges.forEach(charge => {
      y += 6;
      doc.text(`${charge.name}:`, 120, y);
      doc.text(formatINR(charge.amount), pageWidth - 16, y, { align: 'right' });
    });
  }

  if (invoice.sgst > 0 || invoice.cgst > 0) {
    y += 6;
    doc.text('SGST:', 120, y);
    doc.text(formatINR(invoice.sgst), pageWidth - 16, y, { align: 'right' });
    y += 6;
    doc.text('CGST:', 120, y);
    doc.text(formatINR(invoice.cgst), pageWidth - 16, y, { align: 'right' });
  }

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 120, y);
  doc.text(formatINR(invoice.total), pageWidth - 16, y, { align: 'right' });

  // Amount in words
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Amount in Words: ${numberToWords(invoice.total)}`, 14, y);

  // Terms
  if (invoice.paymentTerms || invoice.notes) {
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (invoice.paymentTerms) {
      doc.text(`Payment Terms: ${invoice.paymentTerms}`, 14, y);
      y += 5;
    }
    if (invoice.notes) {
      doc.text(`Notes: ${invoice.notes}`, 14, y);
    }
  }

  // Bank Details
  if (businessInfo.bankDetails) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bank Details:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Bank: ${businessInfo.bankDetails.bankName}`, 14, y);
    y += 5;
    doc.text(`A/C No: ${businessInfo.bankDetails.accountNumber}`, 14, y);
    y += 5;
    doc.text(`IFSC: ${businessInfo.bankDetails.ifscCode}`, 14, y);
  }

  return doc;
}

export function generatePurchaseOrderPDF(
  order: PurchaseOrderData,
  businessInfo: BusinessInfo
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header - Business Info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(businessInfo.address, 14, y);
  y += 5;
  doc.text(`${businessInfo.email} | ${businessInfo.phone}`, 14, y);
  if (businessInfo.gstNumber) {
    y += 5;
    doc.text(`GST: ${businessInfo.gstNumber}`, 14, y);
  }

  // Title
  y += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', pageWidth / 2, y, { align: 'center' });

  // PO details
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PO No: ${order.poNumber}`, 14, y);
  doc.text(`Date: ${formatDateIN(order.date)}`, pageWidth - 14, y, { align: 'right' });
  if (order.expectedDelivery) {
    y += 5;
    doc.text(`Expected Delivery: ${formatDateIN(order.expectedDelivery)}`, pageWidth - 14, y, { align: 'right' });
  }

  // Supplier Info
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(order.supplier.name, 14, y);
  y += 5;
  doc.text(order.supplier.address, 14, y);
  y += 5;
  doc.text(`${order.supplier.email} | ${order.supplier.phone}`, 14, y);
  if (order.supplier.gstNumber) {
    y += 5;
    doc.text(`GST: ${order.supplier.gstNumber}`, 14, y);
  }

  // Items Table Header
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
  doc.text('#', 16, y);
  doc.text('Item', 26, y);
  doc.text('HSN', 85, y);
  doc.text('Qty', 105, y);
  doc.text('Unit', 120, y);
  doc.text('Rate', 140, y);
  doc.text('Amount', pageWidth - 16, y, { align: 'right' });

  // Items
  y += 8;
  doc.setFont('helvetica', 'normal');
  order.items.forEach((item, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(index + 1), 16, y);
    doc.text(item.item.name.substring(0, 28), 26, y);
    doc.text(item.hsnCode || '-', 85, y);
    doc.text(String(item.quantity), 105, y);
    doc.text(item.item.unit || '-', 120, y);
    doc.text(formatINR(item.unitPrice), 140, y);
    doc.text(formatINR(item.total), pageWidth - 16, y, { align: 'right' });
    y += 6;
  });

  // Totals
  y += 5;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  
  doc.text('Subtotal:', 120, y);
  doc.text(formatINR(order.subtotal), pageWidth - 16, y, { align: 'right' });

  if (order.additionalCharges && order.additionalCharges.length > 0) {
    order.additionalCharges.forEach(charge => {
      y += 6;
      doc.text(`${charge.name}:`, 120, y);
      doc.text(formatINR(charge.amount), pageWidth - 16, y, { align: 'right' });
    });
  }

  if (order.sgst > 0 || order.cgst > 0) {
    y += 6;
    doc.text('SGST:', 120, y);
    doc.text(formatINR(order.sgst), pageWidth - 16, y, { align: 'right' });
    y += 6;
    doc.text('CGST:', 120, y);
    doc.text(formatINR(order.cgst), pageWidth - 16, y, { align: 'right' });
  }

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 120, y);
  doc.text(formatINR(order.total), pageWidth - 16, y, { align: 'right' });

  // Amount in words
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Amount in Words: ${numberToWords(order.total)}`, 14, y);

  // Terms
  if (order.paymentTerms || order.notes) {
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (order.paymentTerms) {
      doc.text(`Payment Terms: ${order.paymentTerms}`, 14, y);
      y += 5;
    }
    if (order.notes) {
      doc.text(`Notes: ${order.notes}`, 14, y);
    }
  }

  // Bank Details
  if (businessInfo.bankDetails) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bank Details:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Bank: ${businessInfo.bankDetails.bankName}`, 14, y);
    y += 5;
    doc.text(`A/C No: ${businessInfo.bankDetails.accountNumber}`, 14, y);
    y += 5;
    doc.text(`IFSC: ${businessInfo.bankDetails.ifscCode}`, 14, y);
  }

  return doc;
}

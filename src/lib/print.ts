export function printElementById(id: string, title = "Document") {
  const el = document.getElementById(id);
  if (!el) return;
  const content = el.innerHTML;
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.open();
  win.document.write(`<!doctype html><html><head><title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 12px; color: #0f172a; font-size: 12px; line-height: 1.3; }
      .doc { max-width: 780px; margin: 0 auto; }
      .header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .brand { font-size: 16px; font-weight: 700; }
      .muted { color: #64748b; font-size: 11px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; font-size: 11px; }
      th { background: #f8fafc; font-weight: 600; }
      .totals { margin-top: 8px; width: 100%; }
      .totals td { border: none; padding: 2px 6px; }
      .totals .label { color: #64748b; }
      .totals .value { text-align: right; font-weight: 600; }
      .footer { margin-top: 16px; font-size: 10px; color: #64748b; }
      .section { border: 1px solid #e2e8f0; margin: 4px 0; padding: 8px; border-radius: 4px; }
      .amount-words { font-style: italic; color: #64748b; margin-top: 3px; font-size: 10px; }
      .terms { margin-top: 8px; }
      .signature-section { margin-top: 12px; text-align: right; }
      .signature-image { max-width: 100px; max-height: 50px; }
      img { max-height: 36px; }
      @media print { 
        @page { margin: 8mm; size: A4; } 
        body { margin: 0; font-size: 11px; }
        .section { margin: 2px 0; padding: 6px; }
      }
    </style>
  </head><body><div class="doc">${content}</div></body></html>`);
  win.document.close();
  win.focus();
  win.print();
  setTimeout(() => win.close(), 250);
}

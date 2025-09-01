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
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 24px; color: #0f172a; }
      .doc { max-width: 900px; margin: 0 auto; }
      .header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
      .brand { font-size: 20px; font-weight: 700; }
      .muted { color: #64748b; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 12px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f8fafc; }
      .totals { margin-top: 12px; width: 100%; }
      .totals td { border: none; }
      .totals .label { color: #64748b; }
      .totals .value { text-align: right; font-weight: 600; }
      .footer { margin-top: 24px; font-size: 12px; color: #64748b; }
      img { max-height: 48px; }
      @media print { @page { margin: 12mm; } }
    </style>
  </head><body><div class="doc">${content}</div></body></html>`);
  win.document.close();
  win.focus();
  win.print();
  setTimeout(() => win.close(), 250);
}

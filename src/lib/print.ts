export function printElementById(id: string, title = "Document") {
  const el = document.getElementById(id);
  if (!el) return;
  const content = el.innerHTML;
  
  const styles = `<!doctype html><html><head><title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
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
      @media print {
        @page { margin: 10mm; size: A4; }
        body { margin: 0; font-size: 13px; }
        .doc { border: 2px solid #0f172a; padding: 12px; }
        .section { margin: 4px 0; padding: 8px; }
        h2 { font-size: 16px; }
      }
    </style>
  </head><body><div class="doc">${content}</div></body></html>`;
  
  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Use iframe approach for mobile - more reliable
    printWithIframe(styles);
  } else {
    // Use popup window for desktop
    printWithPopup(styles);
  }
}

function printWithIframe(htmlContent: string) {
  // Remove any existing print iframe
  const existingFrame = document.getElementById('print-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }
  
  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    // Fallback to new tab if iframe fails
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();
  
  // Wait for images to load
  const images = iframeDoc.getElementsByTagName('img');
  const imageLoadPromises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(true);
      } else {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 1000);
      }
    });
  });
  
  Promise.all(imageLoadPromises).then(() => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Clean up after printing
      setTimeout(() => iframe.remove(), 1000);
    }, 300);
  });
}

function printWithPopup(htmlContent: string) {
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) {
    // Fallback to iframe if popup blocked
    printWithIframe(htmlContent);
    return;
  }
  
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();

  const images = win.document.getElementsByTagName('img');
  const imageLoadPromises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(true);
      } else {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 1000);
      }
    });
  });

  Promise.all(imageLoadPromises).then(() => {
    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 250);
    }, 100);
  });
}

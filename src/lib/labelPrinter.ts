/**
 * Label Printer - Web USB API for direct printing to thermal label printers.
 * Supports ZPL (Zebra) and TSPL (TSC) command languages.
 * Label size: 50mm x 25mm
 */

// 203 DPI = 8 dots/mm
const DOTS_PER_MM = 8;
const LABEL_WIDTH_MM = 50;
const LABEL_HEIGHT_MM = 25;
const LABEL_WIDTH_DOTS = LABEL_WIDTH_MM * DOTS_PER_MM;  // 400
const LABEL_HEIGHT_DOTS = LABEL_HEIGHT_MM * DOTS_PER_MM; // 200

export type PrinterLanguage = 'ZPL' | 'TSPL';

interface PrinterState {
  device: any | null;
  language: PrinterLanguage;
  interfaceNumber: number;
  endpointNumber: number;
}

let printerState: PrinterState = {
  device: null,
  language: 'TSPL',
  interfaceNumber: 0,
  endpointNumber: 1,
};

export function isPrinterConnected(): boolean {
  return printerState.device !== null && printerState.device.opened;
}

export function getConnectedPrinterName(): string | null {
  return printerState.device?.productName || null;
}

export function getPrinterLanguage(): PrinterLanguage {
  return printerState.language;
}

export function setPrinterLanguage(lang: PrinterLanguage) {
  printerState.language = lang;
}

export async function connectPrinter(): Promise<{ success: boolean; name?: string; error?: string }> {
  if (!('usb' in navigator)) {
    return { success: false, error: 'Web USB is not supported in this browser. Please use Chrome or Edge.' };
  }

  try {
    const usb = (navigator as any).usb;
    // Request USB device - show picker for all printers
    const device = await usb.requestDevice({
      filters: [] // Show all USB devices
    });

    await device.open();

    // Find the right interface and endpoint
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    let interfaceNum = 0;
    let endpointNum = 1;

    // Find bulk OUT endpoint for printing
    const config = device.configuration;
    if (config) {
      for (const iface of config.interfaces) {
        for (const alt of iface.alternates) {
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out' && ep.type === 'bulk') {
              interfaceNum = iface.interfaceNumber;
              endpointNum = ep.endpointNumber;
              break;
            }
          }
        }
      }
    }

    await device.claimInterface(interfaceNum);

    printerState = {
      device,
      language: printerState.language,
      interfaceNumber: interfaceNum,
      endpointNumber: endpointNum,
    };

    // Auto-detect printer language from name
    const name = (device.productName || '').toLowerCase();
    if (name.includes('zebra') || name.includes('zpl')) {
      printerState.language = 'ZPL';
    } else if (name.includes('tsc') || name.includes('tspl')) {
      printerState.language = 'TSPL';
    }

    return { success: true, name: device.productName || 'Unknown Printer' };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, error: 'No printer selected.' };
    }
    return { success: false, error: err.message || 'Failed to connect printer.' };
  }
}

export async function disconnectPrinter(): Promise<void> {
  if (printerState.device && printerState.device.opened) {
    try {
      await printerState.device.releaseInterface(printerState.interfaceNumber);
      await printerState.device.close();
    } catch (e) {
      // Ignore errors on disconnect
    }
  }
  printerState.device = null;
}

export interface StickerData {
  tCode: string;
  itemName: string;
  grNumber: string;
  grDate: string;
  batchNumber: string;
  stickerNo: number;
  totalStickers: number;
}

function generateZPL(sticker: StickerData): string {
  // ZPL commands for 50x25mm label at 203 DPI
  const lines = [
    '^XA',                          // Start label
    `^PW${LABEL_WIDTH_DOTS}`,       // Print width
    `^LL${LABEL_HEIGHT_DOTS}`,      // Label length
    '^LH0,0',                       // Label home
    
    // QR Code on the left (position: 8,20, size auto ~12mm)
    `^FO8,20^BQN,2,3^FDMA,${sticker.tCode}^FS`,
    
    // T-Code (bold, right of QR)
    `^FO110,12^A0N,28,28^FD${sticker.tCode.substring(0, 20)}^FS`,
    
    // Item Name
    `^FO110,48^A0N,22,22^FD${sticker.itemName.substring(0, 22)}^FS`,
    
    // GR Number & Date
    `^FO110,78^A0N,18,18^FD${sticker.grNumber}  ${sticker.grDate}^FS`,
    
    // Batch & Sticker count
    `^FO110,102^A0N,18,18^FD${sticker.batchNumber}  ${sticker.stickerNo}/${sticker.totalStickers}^FS`,
    
    // Separator line
    `^FO108,6^GB0,190,1^FS`,
    
    '^XZ',                          // End label
  ];
  return lines.join('\n');
}

function generateTSPL(sticker: StickerData): string {
  // TSPL commands for 50x25mm label at 203 DPI
  const lines = [
    `SIZE ${LABEL_WIDTH_MM} mm, ${LABEL_HEIGHT_MM} mm`,
    'GAP 2 mm, 0 mm',
    'DIRECTION 1',
    'CLS',
    
    // QR Code on the left
    `QRCODE 8,20,M,3,A,0,"${sticker.tCode}"`,
    
    // T-Code text
    `TEXT 110,15,"3",0,1,1,"${sticker.tCode.substring(0, 20)}"`,
    
    // Item Name
    `TEXT 110,50,"2",0,1,1,"${sticker.itemName.substring(0, 22)}"`,
    
    // GR Number & Date
    `TEXT 110,80,"1",0,1,1,"${sticker.grNumber}  ${sticker.grDate}"`,
    
    // Batch & count
    `TEXT 110,105,"1",0,1,1,"${sticker.batchNumber}  ${sticker.stickerNo}/${sticker.totalStickers}"`,
    
    'PRINT 1,1',
  ];
  return lines.join('\n');
}

export function generatePrintCommands(sticker: StickerData): string {
  if (printerState.language === 'ZPL') {
    return generateZPL(sticker);
  }
  return generateTSPL(sticker);
}

async function sendToPrinter(data: string): Promise<void> {
  if (!printerState.device || !printerState.device.opened) {
    throw new Error('Printer not connected');
  }

  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  
  await printerState.device.transferOut(printerState.endpointNumber, encoded);
}

export async function printStickers(stickers: StickerData[]): Promise<{ success: boolean; error?: string }> {
  if (!isPrinterConnected()) {
    return { success: false, error: 'Printer not connected. Please connect your label printer first.' };
  }

  try {
    for (const sticker of stickers) {
      const commands = generatePrintCommands(sticker);
      await sendToPrinter(commands);
      // Small delay between labels
      if (stickers.length > 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to print.' };
  }
}

// Listen for disconnect events
if ('usb' in navigator) {
  (navigator as any).usb.addEventListener('disconnect', (event: any) => {
    if (printerState.device === event.device) {
      printerState.device = null;
    }
  });
}

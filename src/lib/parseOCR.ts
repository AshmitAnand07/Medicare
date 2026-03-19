export interface ParsedMedicineData {
  medicineName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return '';
  // Convert standard "MM/YYYY" or "MM-YYYY" to "YYYY-MM-01"
  const matchMMYYYY = dateStr.match(/(\d{2})[/.-](\d{4})/);
  if (matchMMYYYY) {
    return `${matchMMYYYY[2]}-${matchMMYYYY[1]}-01`;
  }
  
  // Convert "YY/MM" or "YYYY/MM"
  const matchYYYYMM = dateStr.match(/(\d{4})[/.-](\d{2})/);
  if (matchYYYYMM) {
    return `${matchYYYYMM[1]}-${matchYYYYMM[2]}-01`;
  }

  // Handle formats like "OCT 2025" or "OCT 25"
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const matchTextDate = dateStr.match(/([A-Za-z]{3})\w*\s*[/.-]?\s*(\d{2,4})/);
  if (matchTextDate) {
    const month = months[matchTextDate[1].toLowerCase()] || '01';
    let year = matchTextDate[2];
    if (year.length === 2) {
      year = '20' + year;
    }
    return `${year}-${month}-01`;
  }

  return '';
}

export function parseMedicineOCR(text: string): ParsedMedicineData {
  const result: ParsedMedicineData = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. MRP Regex
  const mrpRegex = /(?:MRP|₹|Rs\.?)\s*[:.-]?\s*(\d+(?:\.\d+)?)/i;
  // 2. Expiry Regex
  const expiryRegex = /(?:EXP|Expiry(?: Date)?)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;
  // 3. Mfg Regex
  const mfgRegex = /(?:MFD|Mfg(?: Date)?|Manufactured)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;

  let bestName = '';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Match MRP
    if (!result.mrp) {
      const match = line.match(mrpRegex);
      if (match) result.mrp = match[1];
    }
    // Match Expiry
    if (!result.expiryDate) {
      const match = line.match(expiryRegex);
      if (match) {
        const dateMatch = match[1].match(/(\d{2}[/.-]\d{2,4}|[A-Za-z]{3}\s*\d{2,4})/);
        const rawDate = dateMatch ? dateMatch[1] : match[1];
        result.expiryDate = formatDateForInput(rawDate);
      }
    }
    // Match Mfg
    if (!result.manufacturingDate) {
      const match = line.match(mfgRegex);
      if (match) {
        const dateMatch = match[1].match(/(\d{2}[/.-]\d{2,4}|[A-Za-z]{3}\s*\d{2,4})/);
        const rawDate = dateMatch ? dateMatch[1] : match[1];
        result.manufacturingDate = formatDateForInput(rawDate);
      }
    }

    // Match Medicine Name
    const isExclusion = /batch|b\.no|mfg|mfd|exp|expiry|date|mrp|₹|rs|tablets|capsules|syrup/i.test(lower);
    const hasNumbers = /\d/.test(line);

    // Find the longest readable line without numbers and exclusions
    if (!isExclusion && !hasNumbers && line.length > bestName.length && line.length > 3) {
      bestName = line;
    }
  }

  // Fallback: If no name found without numbers (allow some numbers e.g. Dolo 650)
  if (!bestName) {
    for (const line of lines) {
       const lower = line.toLowerCase();
       const isExclusion = /batch|b\.no|mfg|mfd|exp|expiry|date|mrp|₹|rs/i.test(lower);
       if (!isExclusion && line.length > bestName.length && line.length > 3) {
          bestName = line;
       }
    }
  }

  if (bestName) {
    result.medicineName = bestName;
  }

  return result;
}

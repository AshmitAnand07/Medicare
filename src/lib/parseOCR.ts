export interface ParsedMedicineData {
  medicineName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // Patterns like MM/YYYY, MM-YYYY, MM/YY, DD/MM/YYYY
  const datePattern = /(\d{1,2})[/.-](\d{1,2}(?:[/.-]\d{2,4})?|\d{4})/;
  const match = dateStr.match(datePattern);
  if (!match) return null;

  let month, year;
  const parts = match[0].split(/[/.-]/);
  
  if (parts.length === 3) {
    // DD/MM/YYYY
    month = parts[1];
    year = parts[2];
  } else {
    // MM/YYYY or MM-YYYY or MM/YY
    month = parts[0];
    year = parts[1];
  }

  if (month.length === 1) month = '0' + month;
  if (year.length === 2) year = '20' + year;
  
  return `${year}-${month}-01`;
}

export function parseMedicineOCR(text: string): ParsedMedicineData {
  const result: ParsedMedicineData = {
    medicineName: '',
    manufacturingDate: '',
    expiryDate: '',
    mrp: ''
  };

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const excludeKeywords = [
    'ltd', 'pvt', 'private', 'wellness', 'pharma', 'laboratories', 
    'road', 'street', 'school', 'temple', 'ahmedabad', 'india', 
    'visit', 'email', 'website', 'address', 'manufactured', 
    'marketed', 'distributed', 'licence', 'batch', 'who', 
    'gmp', 'certified', 'lic.', 'b.no', 'copyright', 'registered', 
    'trademark', 'keep out of reach'
  ];

  const shortFragments = ['ip', 'bp', 'usp', 'rx', '®'];

  // 1. MRP Detection
  const mrpRegex = /(?:MRP|₹|Rs\.?)\s*[:.-]?\s*(\d+(?:\.\d+)?)/i;
  // 2. Expiry Detection
  const expiryRegex = /(?:EXP|Expiry(?: Date)?)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;
  // 3. Mfg Detection
  const mfgRegex = /(?:MFD|Mfg(?: Date)?|Manufactured)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;

  let medicineNameCandidate = '';
  let highestScore = -1;

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // MRP
    if (!result.mrp) {
      const mrpMatch = line.match(mrpRegex);
      if (mrpMatch) {
        result.mrp = mrpMatch[1];
      }
    }

    // Expiry
    if (!result.expiryDate) {
      const expMatch = line.match(expiryRegex);
      if (expMatch) {
        const parsed = parseDate(expMatch[1]);
        if (parsed) result.expiryDate = parsed;
      }
    }

    // Mfg
    if (!result.manufacturingDate) {
      const mfgMatch = line.match(mfgRegex);
      if (mfgMatch) {
        const parsed = parseDate(mfgMatch[1]);
        if (parsed) result.manufacturingDate = parsed;
      }
    }

    // Medicine Name Logic
    // Conditions for candidate:
    // - Not an excluded line
    // - Not a short fragment
    // - At least 3 words
    // - Mostly alphabetic
    // - No numbers (usually names don't have digits, unless 500mg etc, but user said "no numbers")
    //   Wait, '500mg' is common, but user explicitly said "does not contain numbers or address keywords"
    const words = line.split(/\s+/).filter(w => w.length > 1);
    const isExcluded = excludeKeywords.some(kw => lowerLine.includes(kw));
    const isShortFragment = shortFragments.some(sf => lowerLine === sf || words.every(w => shortFragments.includes(w.toLowerCase())));
    const hasNumbers = /\d/.test(line);
    const mostlyAlphabetic = (line.match(/[a-zA-Z]/g) || []).length / line.length > 0.5;

    if (!isExcluded && !isShortFragment && words.length >= 2 && !hasNumbers && mostlyAlphabetic) {
      // Score based on position, length, and words
      let score = 0;
      if (index < 5) score += 50; // Top 5 lines
      else if (index < 10) score += 30;
      
      score += (words.length * 5);
      
      if (score > highestScore) {
        highestScore = score;
        medicineNameCandidate = line;
      }
    }
  });

  // If no candidate was found with at least 3 words (user's rule 4, bullet 1)
  // I'll relax to 2 words if it's very likely, but user's prompt says "contains at least 3 words"
  // Let's refine the candidate search focusing on 3 words first.
  if (!medicineNameCandidate || medicineNameCandidate.split(/\s+/).length < 3) {
      // Re-scan for 3+ words specifically
      let best3Word = '';
      let best3Score = -1;
      lines.forEach((line, index) => {
          const lowerLine = line.toLowerCase();
          const words = line.split(/\s+/).filter(w => w.length > 1);
          const isExcluded = excludeKeywords.some(kw => lowerLine.includes(kw));
          const isShortFragment = shortFragments.some(sf => lowerLine === sf);
          const hasNumbers = /\d/.test(line);
          const mostlyAlphabetic = (line.match(/[a-zA-Z]/g) || []).length / line.length > 0.5;

          if (!isExcluded && !isShortFragment && words.length >= 3 && !hasNumbers && mostlyAlphabetic) {
              let score = 100 - index;
              if (score > best3Score) {
                  best3Score = score;
                  best3Word = line;
              }
          }
      });
      if (best3Word) medicineNameCandidate = best3Word;
      else if (medicineNameCandidate.split(/\s+/).length < 3) {
          // If the previous candidate found (even with 2 words) doesn't meet the 3-word rule, 
          // and no 3rd word exists, we should probably follow the "leave empty" rule if it's doubtful.
          // BUT, some medicines are two words. User said "at least 3 words" and "otherwise leave empty".
          medicineNameCandidate = ''; 
      }
  }

  result.medicineName = medicineNameCandidate;

  return result;
}

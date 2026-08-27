/**
 * ID Card Data Extraction & Masking Utility
 * Supports pattern matching for Indian and International identity documents:
 * - Aadhaar Card (12 digits, format: XXXX XXXX XXXX)
 * - PAN Card (10 alphanumeric chars: ABCDE1234F)
 * - Passport (1 letter + 7-8 digits)
 * - Driving License (State code + numbers)
 * - Voter ID / EPIC (3 letters + 7 digits)
 */

export interface ExtractedIdData {
  fullName?: string;
  idType?: string;
  idNumber?: string;
  idNumberMasked?: string;
  dob?: string;
  address?: string;
  rawConfidence: number; // 0 to 1
}

/**
 * Safely masks ID numbers based on their type without exposing full sensitive numbers.
 * Aadhaar: XXXX XXXX 1234
 * PAN: AB•••••4F
 * Passport: X•••••34
 * Driving License: DL••••••1234
 * Default / Other: •••• 1234
 */
export function maskIdNumber(idType?: string | null, idNumber?: string | null): string {
  if (!idNumber) return '—';
  const clean = idNumber.replace(/\s+/g, '').trim();
  if (clean.length < 4) return '••••';

  const type = (idType || '').toLowerCase();

  if (type.includes('aadhaar') || clean.length === 12) {
    const last4 = clean.slice(-4);
    return `XXXX XXXX ${last4}`;
  }

  if (type.includes('pan') && clean.length === 10) {
    const prefix = clean.slice(0, 2);
    const suffix = clean.slice(-2);
    return `${prefix}••••••${suffix}`;
  }

  if (type.includes('passport')) {
    const prefix = clean.slice(0, 1);
    const suffix = clean.slice(-2);
    return `${prefix}•••••${suffix}`;
  }

  if (type.includes('driving') || type.includes('license') || type.includes('dl')) {
    const prefix = clean.slice(0, 2);
    const suffix = clean.slice(-4);
    return `${prefix}••••••${suffix}`;
  }

  if (clean.length > 4) {
    return `•••• ${clean.slice(-4)}`;
  }

  return '••••';
}

/**
 * Extracts identity information from plain text (e.g. from client OCR or parsed document content).
 */
export function extractIdDataFromText(text: string): ExtractedIdData {
  const result: ExtractedIdData = {
    rawConfidence: 0,
  };

  if (!text || !text.trim()) return result;

  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Aadhaar pattern: 12 digits (with optional spaces: \d{4} \d{4} \d{4})
  const aadhaarMatch = text.match(/\b([2-9]\d{3}\s?\d{4}\s?\d{4})\b/);
  if (aadhaarMatch) {
    const rawNum = aadhaarMatch[1].replace(/\s+/g, '');
    if (rawNum.length === 12) {
      result.idType = 'Aadhaar';
      result.idNumber = `${rawNum.slice(0, 4)} ${rawNum.slice(4, 8)} ${rawNum.slice(8, 12)}`;
      result.idNumberMasked = maskIdNumber('Aadhaar', rawNum);
      result.rawConfidence += 0.4;
    }
  }

  // 2. PAN Card pattern: 5 uppercase letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  if (!result.idType) {
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/i);
    if (panMatch) {
      const pan = panMatch[1].toUpperCase();
      result.idType = 'PAN Card';
      result.idNumber = pan;
      result.idNumberMasked = maskIdNumber('PAN Card', pan);
      result.rawConfidence += 0.4;
    }
  }

  // 3. Indian Passport pattern: 1 letter followed by 7 or 8 digits
  if (!result.idType) {
    const passportMatch = text.match(/\b([A-PR-WYZ][0-9]{7,8})\b/i);
    if (passportMatch) {
      const passport = passportMatch[1].toUpperCase();
      result.idType = 'Passport';
      result.idNumber = passport;
      result.idNumberMasked = maskIdNumber('Passport', passport);
      result.rawConfidence += 0.4;
    }
  }

  // 4. Driving License pattern (e.g., MH12 20180012345 or DL-0420110012345)
  if (!result.idType) {
    const dlMatch = text.match(/\b([A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{11,13})\b/i);
    if (dlMatch) {
      const dl = dlMatch[1].replace(/[-\s]/g, '').toUpperCase();
      result.idType = 'Driving License';
      result.idNumber = dl;
      result.idNumberMasked = maskIdNumber('Driving License', dl);
      result.rawConfidence += 0.4;
    }
  }

  // 5. Voter ID / EPIC pattern (3 uppercase letters followed by 7 digits, e.g. ABC1234567)
  if (!result.idType) {
    const voterMatch = text.match(/\b([A-Z]{3}[0-9]{7})\b/i);
    if (voterMatch) {
      const voter = voterMatch[1].toUpperCase();
      result.idType = 'Voter ID';
      result.idNumber = voter;
      result.idNumberMasked = maskIdNumber('Voter ID', voter);
      result.rawConfidence += 0.4;
    }
  }

  // Date of Birth pattern (DD/MM/YYYY or DD-MM-YYYY)
  const dobMatch = text.match(/\b(DOB|Date of Birth|Birth|D\.O\.B)[:\s]*([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)\d{2})\b/i) ||
                   text.match(/\b([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)\d{2})\b/);
  if (dobMatch) {
    result.dob = (dobMatch[2] || dobMatch[1]).replace(/[\-\.]/g, '/');
    result.rawConfidence += 0.2;
  }

  // Extract Name heuristics
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nameKeywords = ['name', 'holder name', 'full name', 'naam'];
    const lower = line.toLowerCase();
    
    for (const kw of nameKeywords) {
      if (lower.startsWith(kw) || lower.includes(`${kw}:`)) {
        const parts = line.split(/[:\-\=]/);
        if (parts[1]?.trim()) {
          const candidate = parts[1].trim().replace(/[^a-zA-Z\s]/g, '').trim();
          if (candidate.length >= 3 && candidate.length <= 40) {
            result.fullName = candidate;
            result.rawConfidence += 0.2;
            break;
          }
        }
      }
    }
    if (result.fullName) break;
  }

  // If no explicit "Name:" label found, check top lines for clean human name pattern
  if (!result.fullName && lines.length > 0) {
    for (const line of lines.slice(0, 4)) {
      if (
        !line.match(/government|republic|india|aadhaar|income|tax|department|driving|licence|election|commission/i) &&
        line.match(/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/)
      ) {
        result.fullName = line.trim();
        result.rawConfidence += 0.15;
        break;
      }
    }
  }

  // Address heuristics
  const addressMatch = text.match(/(?:Address|Add)[:\s]*([\s\S]{10,120}?)(?:\n\n|\bPIN\b|\bPhone\b|$)/i);
  if (addressMatch && addressMatch[1]) {
    const cleanAddr = addressMatch[1].replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    if (cleanAddr.length > 5) {
      result.address = cleanAddr;
      result.rawConfidence += 0.2;
    }
  }

  return result;
}

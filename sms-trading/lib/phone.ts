export function normalizePhone(input: string): string {
  let s = input.trim();
  // Remove spaces, dashes, parentheses
  s = s.replace(/[\s\-()]/g, '');
  // If starts with 00 convert to +
  if (s.startsWith('00')) s = '+' + s.slice(2);
  // If no + and ZA number starting with 0, convert to +27
  if (!s.startsWith('+')) {
    if (s.startsWith('0') && s.length >= 10) {
      s = '+27' + s.slice(1);
    } else if (/^\d{9,15}$/.test(s)) {
      s = '+' + s;
    }
  }
  return s;
}

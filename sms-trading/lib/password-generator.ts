/**
 * Enterprise-grade password generator with strength metrics
 * Supports multiple character sets, customizable length, and validation
 */

export interface PasswordOptions {
  length?: number;
  useUppercase?: boolean;
  useLowercase?: boolean;
  useNumbers?: boolean;
  useSymbols?: boolean;
  excludeAmbiguous?: boolean;
  excludeSymbols?: string[];
}

export interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  percentage: number;
  feedback: string[];
  suggestions: string[];
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  length: number;
  entropy: number;
}

export interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  timestamp: number;
}

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  useUppercase: true,
  useLowercase: true,
  useNumbers: true,
  useSymbols: true,
  excludeAmbiguous: true,
};

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Ambiguous characters that can be confused
const AMBIGUOUS_CHARS = 'ilL1O0oO';

/**
 * Generate a cryptographically secure password
 */
export function generatePassword(options: PasswordOptions = {}): GeneratedPassword {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  let characters = '';
  
  if (config.useLowercase) {
    characters += config.excludeAmbiguous 
      ? LOWERCASE.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('')
      : LOWERCASE;
  }
  
  if (config.useUppercase) {
    characters += config.excludeAmbiguous 
      ? UPPERCASE.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('')
      : UPPERCASE;
  }
  
  if (config.useNumbers) {
    characters += config.excludeAmbiguous 
      ? NUMBERS.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('')
      : NUMBERS;
  }
  
  if (config.useSymbols) {
    let symbolSet = SYMBOLS;
    if (config.excludeSymbols?.length) {
      symbolSet = SYMBOLS.split('').filter(c => !config.excludeSymbols!.includes(c)).join('');
    }
    characters += symbolSet;
  }
  
  if (!characters) {
    throw new Error('At least one character set must be selected');
  }
  
  // Generate password with crypto
  const password = generateSecurePassword(characters, config.length || 16);
  
  // Calculate strength
  const strength = calculatePasswordStrength(password);
  
  return {
    password,
    strength,
    timestamp: Date.now(),
  };
}

/**
 * Generate secure random password using crypto API
 */
function generateSecurePassword(characters: string, length: number): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += characters[array[i] % characters.length];
  }
  
  return password;
}

/**
 * Calculate password strength score
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const strength: PasswordStrength = {
    score: 0,
    level: 'weak',
    percentage: 0,
    feedback: [],
    suggestions: [],
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    length: password.length,
    entropy: 0,
  };
  
  // Length check
  if (strength.length < 8) {
    strength.feedback.push('Password is too short');
    strength.suggestions.push('Use at least 8 characters');
  } else if (strength.length < 12) {
    strength.feedback.push('Password length is moderate');
    strength.suggestions.push('Consider using 12+ characters for better security');
  } else if (strength.length >= 16) {
    strength.feedback.push('Excellent password length');
  }
  
  // Character variety
  let charsetSize = 0;
  if (strength.hasLowercase) charsetSize += 26;
  if (strength.hasUppercase) charsetSize += 26;
  if (strength.hasNumbers) charsetSize += 10;
  if (strength.hasSymbols) charsetSize += 32;
  
  // Calculate entropy (bits of entropy = log2(charsetSize ^ length))
  strength.entropy = Math.round(Math.log2(Math.pow(charsetSize, strength.length)));
  
  // Score calculation (0-100)
  let score = 0;
  
  // Length: up to 30 points
  score += Math.min(30, strength.length * 2);
  
  // Character variety: up to 40 points
  const varietyCount = [
    strength.hasLowercase,
    strength.hasUppercase,
    strength.hasNumbers,
    strength.hasSymbols,
  ].filter(Boolean).length;
  score += varietyCount * 10;
  
  // Entropy bonus: up to 30 points
  if (strength.entropy >= 64) {
    score += 30;
    strength.feedback.push('Excellent entropy');
  } else if (strength.entropy >= 50) {
    score += 20;
    strength.feedback.push('Good entropy');
  } else if (strength.entropy >= 40) {
    score += 10;
    strength.feedback.push('Fair entropy');
  }
  
  // Check for common patterns
  const commonPatterns = /^(123|456|789|000|111|abc|xyz|password|qwerty)/i;
  if (commonPatterns.test(password)) {
    score = Math.max(0, score - 20);
    strength.feedback.push('Contains common patterns');
    strength.suggestions.push('Avoid sequential numbers or keyboard patterns');
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 10);
    strength.feedback.push('Contains repeated characters');
  }
  
  // Normalize score
  strength.score = Math.min(100, score);
  strength.percentage = strength.score;
  
  // Determine level
  if (strength.score < 20) {
    strength.level = 'weak';
  } else if (strength.score < 40) {
    strength.level = 'fair';
  } else if (strength.score < 60) {
    strength.level = 'good';
  } else if (strength.score < 80) {
    strength.level = 'strong';
  } else {
    strength.level = 'very-strong';
  }
  
  // Add feedback based on level
  if (!strength.feedback.length) {
    strength.feedback.push(`Password strength: ${strength.level}`);
  }
  
  return strength;
}

/**
 * Validate password meets minimum requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordOptions = DEFAULT_OPTIONS
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < (requirements.length || 8)) {
    errors.push(`Password must be at least ${requirements.length} characters`);
  }
  
  if (requirements.useUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  
  if (requirements.useLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  
  if (requirements.useNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  
  if (requirements.useSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain special characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength color for UI
 */
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength.level) {
    case 'weak':
      return '#ef4444'; // Red
    case 'fair':
      return '#f97316'; // Orange
    case 'good':
      return '#eab308'; // Yellow
    case 'strong':
      return '#84cc16'; // Lime
    case 'very-strong':
      return '#22c55e'; // Green
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get password strength label for UI
 */
export function getStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength['level'], string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  };
  return labels[strength.level] || 'Unknown';
}

/**
 * Save generated password to localStorage with metadata
 */
export function saveGeneratedPassword(generated: GeneratedPassword): void {
  try {
    const existing = JSON.parse(localStorage.getItem('sms_trading_passwords') || '[]');
    
    // Keep only last 10 passwords
    const updated = [
      {
        ...generated,
        savedAt: new Date().toISOString(),
      },
      ...existing,
    ].slice(0, 10);
    
    localStorage.setItem('sms_trading_passwords', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save password:', error);
  }
}

/**
 * Retrieve saved passwords from localStorage
 */
export function getSavedPasswords(): GeneratedPassword[] {
  try {
    return JSON.parse(localStorage.getItem('sms_trading_passwords') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear saved passwords from localStorage
 */
export function clearSavedPasswords(): void {
  try {
    localStorage.removeItem('sms_trading_passwords');
  } catch (error) {
    console.error('Failed to clear passwords:', error);
  }
}

/**
 * Copy password to clipboard with notification
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch {
    return false;
  }
}

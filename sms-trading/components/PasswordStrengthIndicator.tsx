'use client';

import React from 'react';
import { Check, AlertCircle, Zap } from 'lucide-react';
import { PasswordStrength, getStrengthColor, getStrengthLabel } from '@/lib/password-generator';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength | null;
  showDetails?: boolean;
}

export default function PasswordStrengthIndicator({
  strength,
  showDetails = true,
}: PasswordStrengthIndicatorProps) {
  if (!strength) return null;

  const color = getStrengthColor(strength);
  const label = getStrengthLabel(strength);
  
  const requirements = [
    { met: strength.hasLowercase, label: 'Lowercase letters' },
    { met: strength.hasUppercase, label: 'Uppercase letters' },
    { met: strength.hasNumbers, label: 'Numbers' },
    { met: strength.hasSymbols, label: 'Special characters' },
    { met: strength.length >= 12, label: '12+ characters' },
  ];

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">Password Strength</label>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {strength.entropy} bits of entropy
        </p>
      </div>

      {/* Requirements checklist */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Requirements</h4>
          <div className="space-y-2">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: req.met ? color : '#f3f4f6',
                    borderColor: req.met ? color : '#e5e7eb',
                    borderWidth: '1px',
                  }}
                >
                  {req.met && (
                    <Check width={14} height={14} className="text-white" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    req.met ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback and suggestions */}
      {showDetails && (strength.feedback.length > 0 || strength.suggestions.length > 0) && (
        <div className="space-y-2">
          {strength.feedback.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">Feedback</p>
              <ul className="space-y-1">
                {strength.feedback.map((item, idx) => (
                  <li key={idx} className="text-xs text-blue-800 flex items-start gap-2">
                    <Zap width={12} height={12} className="mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strength.suggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-900 mb-1">Suggestions</p>
              <ul className="space-y-1">
                {strength.suggestions.map((item, idx) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle width={12} height={12} className="mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
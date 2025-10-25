'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SMSFormProps {
  onSuccess?: () => void;
  remaining: number;
}

export default function SMSForm({ onSuccess, remaining }: SMSFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      to: '',
      message: '',
    },
  });

  const messageLength = watch('message').length;

  const onSubmit = async (data: { to: string; message: string }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      setSuccess(true);
      reset();
      onSuccess?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-900">Send SMS</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
          SMS sent successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          placeholder="+27..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('to', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[\d\s-()]{10,}$/,
              message: 'Invalid phone number',
            },
          })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message ({messageLength}/160)
        </label>
        <textarea
          placeholder="Your message here..."
          maxLength={160}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          {...register('message', {
            required: 'Message is required',
            maxLength: {
              value: 160,
              message: 'Message too long',
            },
          })}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Balance: <span className="font-semibold">{remaining} SMS</span>
        </span>
        {remaining === 0 && (
          <span className="text-red-600 font-semibold">Out of SMS</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || remaining === 0}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? 'Sending...' : 'Send SMS'}
      </button>
    </form>
  );
}

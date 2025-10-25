'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import SMSForm from '@/components/SMSForm';
import { useRouter } from 'next/navigation';

interface BalanceData {
  used: number;
  allowance: number;
  remaining: number;
  plan: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchBalance();
  }, [isLoaded, isSignedIn, router]);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/check-balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your SMS campaigns</p>
        </div>

        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {balance.plan}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">SMS Used</p>
              <p className="text-2xl font-bold text-gray-900">{balance.used}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">SMS Remaining</p>
              <p className="text-2xl font-bold text-blue-600">
                {balance.remaining}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          {balance && (
            <SMSForm
              remaining={balance.remaining}
              onSuccess={fetchBalance}
            />
          )}
        </div>
      </div>
    </div>
  );
}

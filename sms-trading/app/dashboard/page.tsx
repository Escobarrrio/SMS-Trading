'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import SMSForm from '@/components/SMSForm';
import UsageAnalytics from '@/components/UsageAnalytics';
import AnimatedSection from '@/components/AnimatedSection';
import ClientNav from '@/components/ClientNav';

interface BalanceData {
  used: number;
  allowance: number;
  remaining: number;
  plan: string;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    fetchBalance();
  }, [isLoaded]);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/check-balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      } else {
        // Default demo data if API fails
        setBalance({
          used: 45,
          allowance: 1000,
          remaining: 955,
          plan: 'starter',
        });
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Set demo data if API is not ready
      setBalance({
        used: 45,
        allowance: 1000,
        remaining: 955,
        plan: 'starter',
      });
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

  const preview = !isSignedIn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection animation="fade-down" duration={800}>
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              SMS Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and monitor your SMS campaigns
            </p>
            {preview && (
              <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 text-sm">
                Preview mode: authentication disabled. Data shown is demo.
              </div>
            )}
          </div>
        </AnimatedSection>

        <ClientNav />
        {balance && (
          <>
            <AnimatedSection animation="fade-up" duration={800}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Overview</h2>
                <UsageAnalytics data={balance} />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimatedSection animation="fade-up" duration={800} delay={200} className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send New SMS</h2>
                  <SMSForm remaining={balance.remaining} onSuccess={fetchBalance} />
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fade-up" duration={800} delay={300}>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                  <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Current Plan</p>
                      <p className="text-3xl font-bold capitalize">{balance.plan}</p>
                    </div>
                    <div className="border-t border-blue-400 pt-4">
                      <p className="text-blue-100 text-sm mb-1">Monthly Limit</p>
                      <p className="text-3xl font-bold">{balance.allowance}</p>
                    </div>
                    <div className="border-t border-blue-400 pt-4">
                      <p className="text-blue-100 text-sm mb-1">Efficiency</p>
                      <p className="text-3xl font-bold">{((balance.remaining / balance.allowance) * 100).toFixed(0)}%</p>
                      <p className="text-blue-100 text-xs mt-2">Remaining capacity</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

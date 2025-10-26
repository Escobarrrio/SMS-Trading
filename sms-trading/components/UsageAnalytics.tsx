'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface UsageData {
  used: number;
  allowance: number;
  remaining: number;
  plan: string;
}

export default function UsageAnalytics({ data }: { data: UsageData }) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const usagePercentage = (data.used / data.allowance) * 100;
    const remainingPercentage = (data.remaining / data.allowance) * 100;

    setChartData({
      labels: ['Used', 'Remaining'],
      datasets: [
        {
          label: 'SMS Usage',
          data: [data.used, data.remaining],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
          ],
          borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    });
  }, [data]);

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / data.allowance) * 100).toFixed(1);
            return `${label}: ${value} SMS (${percentage}%)`;
          },
        },
      },
    }};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-2">Used</p>
          <p className="text-3xl font-bold text-blue-900">{data.used}</p>
          <p className="text-xs text-blue-600 mt-2">
            {((data.used / data.allowance) * 100).toFixed(1)}% of quota
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-2">Remaining</p>
          <p className="text-3xl font-bold text-green-900">{data.remaining}</p>
          <p className="text-xs text-green-600 mt-2">
            Available to send
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700 font-semibold mb-2">Total</p>
          <p className="text-3xl font-bold text-purple-900">{data.allowance}</p>
          <p className="text-xs text-purple-600 mt-2">
            Monthly limit
          </p>
        </div>
      </div>

      {chartData && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Distribution
          </h3>
          <div className="relative h-64">
            <Chart
              type="doughnut"
              data={chartData}
              options={doughnutOptions}
            />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Progress
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{
              width: `${(data.used / data.allowance) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">
            {((data.used / data.allowance) * 100).toFixed(1)}% used
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {data.remaining} remaining
          </p>
        </div>
      </div>
    </div>
  );
}

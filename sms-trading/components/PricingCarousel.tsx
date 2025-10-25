'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Swiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
});

const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), {
  ssr: false,
});

import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const PLANS = [
  {
    name: 'Starter',
    price: 'R1,500',
    sms: '1,000',
    features: [
      'SMS credit: 1,000 per month',
      'Basic reporting',
      'Email support',
      '14-day SMS history',
      'Standard delivery speed',
    ],
    highlight: false,
  },
  {
    name: 'Business',
    price: 'R4,500',
    sms: '5,000',
    features: [
      'SMS credit: 5,000 per month',
      'Advanced analytics',
      'Priority support',
      '90-day SMS history',
      'Fast delivery (priority queue)',
      'API access',
    ],
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'R9,500',
    sms: '10,000',
    features: [
      'SMS credit: 10,000 per month',
      'Real-time analytics & reports',
      '24/7 dedicated support',
      '1-year SMS history',
      'Ultra-fast delivery',
      'API access with webhooks',
      'Custom integrations',
    ],
    highlight: false,
  },
];

export default function PricingCarousel() {
  return (
    <div className="py-12">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="pricing-swiper"
      >
        {PLANS.map((plan, index) => (
          <SwiperSlide key={index} className="max-w-sm">
            <div
              className={`h-full rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
                plan.highlight
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="p-8">
                {plan.highlight && (
                  <div className="mb-4 inline-block bg-yellow-300 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.highlight ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <div
                    className={`text-4xl font-bold mb-1 ${
                      plan.highlight ? 'text-white' : 'text-blue-600'
                    }`}
                  >
                    {plan.price}
                  </div>
                  <p
                    className={`text-sm ${
                      plan.highlight ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    {plan.sms} SMS per month
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start text-sm ${
                        plan.highlight ? 'text-blue-50' : 'text-gray-700'
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          plan.highlight
                            ? 'text-yellow-300'
                            : 'text-green-500'
                        }`}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Choose Plan
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        :global(.swiper-slide) {
          width: auto;
          max-width: 350px;
        }

        :global(.swiper-pagination-bullet) {
          background: #3b82f6;
        }

        :global(.swiper-pagination-bullet-active) {
          background: #1e40af;
        }
      `}</style>
    </div>
  );
}

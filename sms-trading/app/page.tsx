import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import HeroTyped from '@/components/HeroTyped';
import AnimatedSection from '@/components/AnimatedSection';
import PricingCarousel from '@/components/PricingCarousel';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">SMS Trading</h1>
          <div className="flex gap-4 items-center">
            {userId ? (
              <>
                <Link href="/dashboard" className="text-white hover:text-blue-100">
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="text-white hover:text-blue-100">
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <AnimatedSection animation="fade-down" duration={800}>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Send SMS at Scale
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" duration={800} delay={200}>
            <div className="text-2xl md:text-3xl text-blue-100 mb-12">
              <HeroTyped
                strings={[
                  'Affordable SMS platform',
                  'Real-time tracking',
                  'Enterprise-grade reliability',
                  'Built for Africa',
                ]}
                typeSpeed={50}
                backSpeed={40}
              />
            </div>
          </AnimatedSection>

          {!userId && (
            <AnimatedSection animation="zoom-in" duration={800} delay={400}>
              <div className="flex gap-4 justify-center mb-12">
                <Link
                  href="/sign-up"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 border-2 border-white hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <AnimatedSection animation="fade-up" duration={800}>
          <h3 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose SMS Trading?
          </h3>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Affordable',
              description: 'Starting from R1,500/month with 1000 SMS',
              icon: '💰',
              delay: 100,
            },
            {
              title: 'Fast',
              description: 'SMS delivered in seconds with real-time tracking',
              icon: '⚡',
              delay: 200,
            },
            {
              title: 'Simple',
              description: 'No coding required, easy-to-use interface',
              icon: '✨',
              delay: 300,
            },
            {
              title: 'Reliable',
              description: 'Enterprise-grade infrastructure with 99.9% uptime',
              icon: '🔒',
              delay: 400,
            },
            {
              title: 'Analytics',
              description: 'Beautiful charts and detailed usage reports',
              icon: '📊',
              delay: 500,
            },
            {
              title: 'Support',
              description: 'Dedicated support team ready to help',
              icon: '🤝',
              delay: 600,
            },
          ].map((feature, idx) => (
            <AnimatedSection
              key={idx}
              animation="fade-up"
              duration={800}
              delay={feature.delay}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all duration-300">
<div className="mb-4"><span className="career-icon career-icon-xl career-icon-info career-icon-animate-glow"><img src="/career-icons/icons/analytics/performance-metrics.svg" alt="icon" width="48" height="48" /></span></div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Pricing Section with Carousel */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fade-up" duration={800}>
            <h3 className="text-4xl font-bold text-gray-900 text-center mb-12">
              Simple, Transparent Pricing
            </h3>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" duration={800} delay={200}>
            <PricingCarousel />
          </AnimatedSection>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-900 py-16">
        <AnimatedSection animation="fade-up" duration={800}>
          <div className="max-w-4xl mx-auto text-center px-4">
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of businesses sending SMS reliably across Africa
            </p>
            {!userId && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="https://github.com/Escobarrrio/SMS-Trading"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  View Source
                </Link>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

'use client';

import StacksWalletConnect from '@/components/StacksWalletConnect';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  Globe, 
  Timer,
  Leaf,
  CheckCircle,
  Wallet,
  HandHeart,
  Receipt,
  BarChart,
  Lock,
  Smartphone,
  Cloud,
  Heart,
  Sprout
} from 'lucide-react';

export default function Features() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const mainFeatures = [
    {
      icon: Users,
      title: "Create Your Circle",
      description: "Start circles of care with unlimited members. Every circle is a place where care grows naturally.",
      details: [
        "Unlimited circle members",
        "Personal circle names and purpose",
        "Gentle invitation system",
        "Real-time care tracking"
      ],
      color: "from-circlecare-500 to-circlecare-purple-500"
    },
    {
      icon: Shield,
      title: "Bitcoin L2 Security",
      description: "All transactions are secured by Clarity smart contracts on Stacks Bitcoin L2 with immutable records",
      details: [
        "Clarity smart contract security",
        "Immutable care records",
        "Transparent audit trail",
        "Bitcoin-backed security"
      ],
      color: "from-circlecare-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Instant Care Flow",
      description: "Complete the circle with one click and ultra-low fees thanks to Bitcoin L2 scaling",
      details: [
        "One-click care settlement",
        "Ultra-low transaction fees",
        "Fast Bitcoin L2 confirmations",
        "Real-time balance updates"
      ],
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Real-time Care Tracking",
      description: "See how care flows through your circle in real-time with automatic calculations and fair splits",
      details: [
        "Automatic care splitting",
        "Real-time balance tracking",
        "Detailed care history",
        "Smart flow calculations"
      ],
      color: "from-violet-500 to-circlecare-purple-500"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Works anywhere in the world with just a Web3 wallet - no traditional banking required",
      details: [
        "24/7 global availability",
        "No geographical restrictions",
        "Cross-border settlements",
        "Multiple wallet support"
      ],
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Timer,
      title: "Care Never Forgets",
      description: "Eliminate forgotten contributions with transparent blockchain records that never disappear",
      details: [
        "Permanent care records",
        "No more forgotten contributions",
        "Transparent care history",
        "Gentle reminders"
      ],
      color: "from-cyan-500 to-circlecare-500"
    }
  ];

  const technicalFeatures = [
    {
      icon: Wallet,
      title: "Stacks Wallet Support",
      description: "Connect with Leather, Xverse, Hiro Wallet, and other Stacks-compatible wallets"
    },
    {
      icon: HandHeart,
      title: "Smart Care Splitting",
      description: "Automatic calculation of exact amounts for each circle member"
    },
    {
      icon: Receipt,
      title: "Care Receipts",
      description: "Store care records on-chain for transparent verification"
    },
    {
      icon: BarChart,
      title: "Care Analytics",
      description: "Track care patterns and circle activity trends over time"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your financial data stays private while maintaining transparency"
    },
    {
      icon: Cloud,
      title: "Decentralized",
      description: "No central authority - your circles are controlled by Clarity smart contracts"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CircleCare</span>
            </div>
          </div>
          <StacksWalletConnect />
        </nav>

        {/* Header */}
        <div className={`text-center py-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6">
            Small Acts, Shared Purpose
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Discover what makes CircleCare the warmest way to support each other. Every feature designed with empathy and care.
          </p>
        </div>

        {/* Main Features */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Core Features</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-white/70">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Features */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Technical Capabilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose CircleCare */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-circlecare-purple-500/20 via-circlecare-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white text-center mb-8">Why Choose CircleCare?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Traditional Apps</h3>
                <div className="space-y-3">
                  {[
                    "Centralized control",
                    "Data privacy concerns",
                    "High transaction fees",
                    "Limited global access",
                    "Manual settlement process"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">CircleCare</h3>
                <div className="space-y-3">
                  {[
                    "Decentralized & trustless",
                    "Complete privacy control",
                    "Ultra-low Bitcoin L2 fees",
                    "Global accessibility",
                    "Instant blockchain settlement"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Circle?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join the community making care flow in circles with Bitcoin L2-powered transparency
          </p>
          <div className="bg-gradient-to-r from-circlecare-500 to-circlecare-purple-600 p-1 rounded-2xl inline-block">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-8 py-4">
              <StacksWalletConnect />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
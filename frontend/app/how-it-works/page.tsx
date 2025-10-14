'use client';

import StacksWalletConnect from '@/components/StacksWalletConnect';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Wallet,
  Users,
  HandHeart,
  Leaf,
  CheckCircle,
  Plus,
  UserPlus,
  Receipt,
  CreditCard,
  BarChart,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Heart,
  Sprout
} from 'lucide-react';

export default function HowItWorks() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const steps = [
    {
      step: "01",
      title: "How To Connect Your Wallet",
      description: "Connect your Web3 wallet to begin your journey of care and community support",
      icon: Wallet,
      color: "from-blue-500 to-indigo-500",
      details: [
        "Install Leather, Xverse, or Hiro Wallet",
        "Connect to the CircleCare app",
        "Switch to Stacks Testnet",
        "Your wallet is now ready!"
      ],
      tips: "Make sure you have some STX on Stacks Testnet for transaction fees"
    },
    {
      step: "02",
      title: "Create Your Circle",
      description: "Start a circle of care with a meaningful name and begin inviting those who matter",
      icon: Users,
      color: "from-circlecare-purple-500 to-pink-500",
      details: [
        "Click 'Create Circle' on dashboard",
        "Enter a circle name (e.g., 'Family Care Circle')",
        "Add your nickname for the circle",
        "Circle is created with Clarity smart contract"
      ],
      tips: "Choose descriptive names to easily identify your circles later"
    },
    {
      step: "03",
      title: "Invite to Circle",
      description: "Invite friends by adding their wallet addresses with custom nicknames",
      icon: UserPlus,
      color: "from-circlecare-500 to-circlecare-purple-500",
      details: [
        "Get friends' Stacks wallet addresses",
        "Click 'Invite to Circle' in your circle",
        "Enter wallet address and nickname",
        "Members can now share care"
      ],
      tips: "Ask friends to share their Stacks wallet addresses beforehand"
    },
    {
      step: "04",
      title: "Share Care",
      description: "Add shared care with descriptions, amounts, and select participants",
      icon: Receipt,
      color: "from-orange-500 to-red-500",
      details: [
        "Click 'Share Care' in circle",
        "Enter description and amount",
        "Select who should contribute",
        "Care is recorded on Stacks blockchain"
      ],
      tips: "Be descriptive with care descriptions for easier tracking"
    },
    {
      step: "05",
      title: "See Care Flow",
      description: "See real-time balances showing how care flows through your circle",
      icon: BarChart,
      color: "from-circlecare-500 to-cyan-500",
      details: [
        "View your balance on circle page",
        "Positive = care flowing to you",
        "Negative = time to flow care forward",
        "All calculations are automatic"
      ],
      tips: "Balances update instantly when new care is shared"
    },
    {
      step: "06",
      title: "Flow Care Forward",
      description: "Complete the circle with one click directly through the blockchain",
      icon: HandHeart,
      color: "from-violet-500 to-circlecare-purple-500",
      details: [
        "Click 'Flow Care Forward' when ready",
        "Confirm your contribution in wallet",
        "Your care is sent instantly via Stacks",
        "Care flows update automatically"
      ],
      tips: "Every contribution completes the circle and is recorded permanently"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "All transactions are secured by smart contracts with public audit trails"
    },
    {
      icon: Zap,
      title: "Instant Care Flow",
      description: "No waiting periods - care flows immediately on Bitcoin L2"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Works anywhere in the world, 24/7, with any Web3 wallet"
    },
    {
      icon: HandHeart,
      title: "Ultra-Low Fees",
      description: "Bitcoin L2 technology means extremely low transaction costs"
    }
  ];

  const faqs = [
    {
      question: "Do I need cryptocurrency to use CircleCare?",
      answer: "Yes, you need a small amount of STX on Stacks Testnet for transaction fees. The fees are extremely low thanks to Bitcoin L2 technology."
    },
    {
      question: "What happens if someone doesn't complete the circle?",
      answer: "All care contributions are recorded permanently on the blockchain. While we can't force payment, the transparent record creates accountability."
    },
    {
      question: "Can I use CircleCare without a Stacks wallet?",
      answer: "No, a Stacks wallet is required as it's your identity and payment method on Bitcoin L2. Leather and Xverse are popular options."
    },
    {
      question: "Is my financial data private?",
      answer: "Yes, only wallet addresses are public. Personal information and care details are only visible to circle members."
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
            How We Care
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Creating your circle of care is beautifully simple. Six gentle steps to start flowing care.
          </p>
        </div>

        {/* Step-by-step Guide */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Step-by-Step Guide</h2>
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <span className="text-white/90 text-sm font-bold">STEP {step.step}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-xl text-white/80 mb-6 leading-relaxed">{step.description}</p>
                    <div className="space-y-3 mb-6">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-3 justify-center lg:justify-start">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/70">{detail}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                      <p className="text-yellow-200 text-sm">
                        💡 <strong>Pro Tip:</strong> {step.tips}
                      </p>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 flex justify-center">
                    <div className={`relative w-80 h-80 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center`}>
                      <Icon className="h-32 w-32 text-white" />
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{step.step}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why Care Works Better</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-white/70 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-white/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <div className="bg-gradient-to-r from-circlecare-500/20 via-circlecare-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Start Your Circle</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              You&apos;re not alone in this. Connect your wallet and create your first circle of care in under 2 minutes.
            </p>
            <div className="bg-gradient-to-r from-circlecare-500 to-circlecare-purple-600 p-1 rounded-2xl inline-block">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl px-8 py-4">
                <StacksWalletConnect />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
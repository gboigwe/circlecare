'use client';

import StacksWalletConnect from '@/components/StacksWalletConnect';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Leaf,
  Target,
  Zap,
  Users,
  Shield,
  Globe,
  Code,
  Trophy,
  Heart,
  Rocket,
  Star,
  Github,
  ExternalLink,
  Award,
  Sprout,
  HandHeart
} from 'lucide-react';

export default function About() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { label: "Care Contracts", value: "2", icon: Code },
    { label: "Lines of Love", value: "5000+", icon: Github },
    { label: "Ways to Help", value: "15+", icon: Star },
    { label: "Trust Coverage", value: "95%", icon: Shield }
  ];

  const techStack = [
    {
      category: "Frontend",
      technologies: [
        "Next.js 15",
        "React 19",
        "TypeScript",
        "Tailwind CSS",
        "Stacks.js",
        "Stacks Connect"
      ]
    },
    {
      category: "Blockchain",
      technologies: [
        "Clarity Smart Contracts",
        "Stacks Bitcoin L2",
        "Bitcoin Security",
        "Decidable Contracts",
        "Testnet Ready"
      ]
    },
    {
      category: "Infrastructure",
      technologies: [
        "Vercel",
        "React Query",
        "Web3 Wallets",
        "Bitcoin L2 Scaling",
        "Stacks Explorer"
      ]
    }
  ];

  const teamValues = [
    {
      icon: Target,
      title: "Heart-Centered",
      description: "Making support seamless and transparent. Every interaction designed with empathy."
    },
    {
      icon: Shield,
      title: "Safe & Trustworthy", 
      description: "Your contributions are protected by smart contracts, your heart by our community."
    },
    {
      icon: Globe,
      title: "Connected Globally",
      description: "Distance doesn't matter when hearts connect. Support flows everywhere."
    },
    {
      icon: Heart,
      title: "Human First",
      description: "Every interaction designed with empathy. Technology that serves humanity."
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
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Trophy className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">Stacks Vibe Coding Hackathon 2025</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6">
            About CircleCare
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Where support feels human. Built with blockchain transparency and wrapped in empathy.
          </p>
        </div>

        {/* Project Story */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Our Heart</h2>
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  CircleCare grew from a simple realization: supporting each other shouldn&apos;t feel cold or complicated.
                  We saw people struggling with awkward money conversations, forgotten contributions, and the distance
                  that financial stress creates between loved ones.
                </p>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Built for the Stacks Vibe Coding Hackathon 2025, CircleCare wraps blockchain transparency in human warmth.
                  Every contribution, every act of care, every moment of support is recorded with the security of
                  Bitcoin L2 via Clarity smart contracts and the gentleness of community.
                </p>
                <p className="text-white/80 text-lg leading-relaxed">
                  Our mission is beautifully simple: make caring for each other feel as natural as a warm hug.
                  You&apos;re not alone in this. Care flows in circles, and every contribution matters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Growing Together</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {techStack.map((stack, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">{stack.category}</h3>
                <div className="space-y-3">
                  {stack.technologies.map((tech, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white/80">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">What We Believe</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {teamValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-white/80 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hackathon Info */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-circlecare-purple-500/20 via-circlecare-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10 text-center">
            <Award className="h-20 w-20 text-circlecare-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Stacks Vibe Coding Hackathon 2025</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              CircleCare was lovingly built for the Stacks Vibe Coding Hackathon 2025. More than competing for prizes,
              we&apos;re showcasing how Bitcoin L2 technology can make human connection warmer, not colder.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">₿</div>
                <div className="text-white/70">Bitcoin L2</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">Clarity</div>
                <div className="text-white/70">Smart Contracts</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">2025</div>
                <div className="text-white/70">Built in</div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Vision */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Rocket className="h-20 w-20 text-blue-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-white mb-8">The Future of Care</h2>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              We believe the future of finance is decentralized, transparent, and accessible to everyone.
              CircleCare is just the beginning. We&apos;re building towards a world where care flows as easily
              as love, where trust is built into every interaction, and where caring knows no boundaries.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">🌍</div>
                <div className="text-white font-semibold">Global</div>
                <div className="text-white/70 text-sm">No borders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">🔒</div>
                <div className="text-white font-semibold">Secure</div>
                <div className="text-white/70 text-sm">Blockchain protected</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">⚡</div>
                <div className="text-white font-semibold">Instant</div>
                <div className="text-white/70 text-sm">Real-time settlement</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join the Circle</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Experience the future of care sharing today. Connect your wallet and start your circle of care.
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
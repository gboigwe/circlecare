import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore CircleCare features: create unlimited circles, track contributions in real-time, enjoy Bitcoin L2 security with Clarity smart contracts, instant settlements, global accessibility, and transparent expense management.',
  keywords: ['circlecarecare features', 'expense management', 'smart contracts', 'real-time tracking', 'bitcoin l2', 'blockchain features'],
  openGraph: {
    title: 'CircleCare Features - Small Acts, Shared Purpose',
    description: 'Discover what makes CircleCare the warmest way to support each other. Features designed with empathy and care.',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

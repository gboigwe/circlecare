import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how to use CircleCare in 6 simple steps: connect your Stacks wallet, create your circle, invite members, share care, track balances in real-time, and complete the circle with one-click settlements on Bitcoin L2.',
  keywords: ['how circlecarecare works', 'user guide', 'stacks wallet', 'create circle', 'expense splitting tutorial', 'blockchain guide'],
  openGraph: {
    title: 'How CircleCare Works - Simple, Warm, Human',
    description: 'Creating your circle of care is beautifully simple. Six gentle steps to start flowing care.',
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

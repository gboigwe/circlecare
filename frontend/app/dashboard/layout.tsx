import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your circles of care. View all your groups, track contributions, see real-time balances, and manage shared expenses with your community on CircleCare.',
  keywords: ['dashboard', 'my circles', 'expense dashboard', 'group management', 'blockchain dashboard'],
  openGraph: {
    title: 'CircleCare Dashboard - Your Circles of Care',
    description: 'Manage your circles and track care flowing through your community.',
  },
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

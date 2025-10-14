import GroupDetailClient from './GroupDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetail({ params }: PageProps) {
  const { id } = await params;
  return <GroupDetailClient />;
}
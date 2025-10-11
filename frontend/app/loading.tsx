import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Heart } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-circlecare-500/20 to-circlecare-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 float-animation">
          <Heart className="h-10 w-10 text-circlecare-400 animate-pulse" />
        </div>
        <LoadingSpinner size="lg" />
        <p className="text-white text-lg font-medium mt-4">Loading CircleCare...</p>
        <p className="text-white/70 text-sm mt-2">Gathering your circles of care</p>
      </div>
    </div>
  );
}

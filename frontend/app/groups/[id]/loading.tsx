import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Users, Heart } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse"></div>
        </div>

        {/* Title Skeleton */}
        <div className="text-center mb-12">
          <div className="h-6 w-32 bg-white/10 rounded-full mx-auto mb-6 animate-pulse"></div>
          <div className="h-14 w-96 bg-white/10 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-64 bg-white/10 rounded-lg mx-auto animate-pulse"></div>
        </div>

        {/* Loading Animation */}
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-circlecare-500/20 to-circlecare-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 float-animation">
            <Heart className="h-10 w-10 text-circlecare-400 animate-pulse" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-white text-lg font-medium mt-4">Loading your circle...</p>
          <p className="text-white/70 text-sm mt-2">Gathering all the care and connections</p>
        </div>

        {/* Stats Skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 w-20 bg-white/10 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

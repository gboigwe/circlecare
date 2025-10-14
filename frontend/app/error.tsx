'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full bg-white/5 backdrop-blur-lg border-white/10">
        <CardContent className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Something went wrong!
          </h2>

          <p className="text-white/70 mb-2">
            {error.message || 'An unexpected error occurred'}
          </p>

          {error.digest && (
            <p className="text-white/50 text-sm mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              onClick={reset}
              className="flex-1 bg-gradient-to-r from-circlecare-500 to-circlecare-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          <p className="text-white/50 text-xs mt-6">
            If this problem persists, please contact support
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

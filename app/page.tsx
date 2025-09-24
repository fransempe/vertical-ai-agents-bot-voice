'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const meetId = useMemo(() => searchParams.get('meet_id') || '', [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loginWithToken() {
      setError(null);

      if (!token) {
        setError('Missing token in URL');
        return;
      }

      try {
        const res = await fetch(`/api/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || 'Authentication failed');
        }

        const redirectUrl = meetId ? `/meet/${meetId}?token=${token}` : '/interview';
        if (!cancelled) router.replace(redirectUrl);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unexpected error');
      }
    }

    loginWithToken();
    return () => {
      cancelled = true;
    };
  }, [token, meetId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-600">Iniciando sesión...</p>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" /></div>}>
      <AutoLogin />
    </Suspense>
  );
}

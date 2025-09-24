'use client';
import { ConvAI } from "@/components/ConvAI";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function InterviewContent() {
  const searchParams = useSearchParams();
  const meetId = searchParams.get('meet_id');
  const candidateId = searchParams.get('candidate_id');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    async function verifyMeet() {
      if (!meetId) {
        setIsAllowed(false);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/meets/${meetId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch meet');
        const data = await res.json();
        // Expecting data.status from backend: 'pending' | 'active' | 'completed'
        setIsAllowed(data?.status === 'pending' || data?.status === 'active');
      } catch {
        setIsAllowed(false);
      } finally {
        setIsLoading(false);
      }
    }
    verifyMeet();
  }, [meetId]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10 bg-[url('/images/bg-blue.png')] bg-cover bg-no-repeat bg-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10 bg-[url('/images/bg-blue.png')] bg-cover bg-no-repeat bg-center">
        <div className="relative rounded-3xl overflow-hidden border-0 shadow-2xl max-w-xl w-full bg-card">
          <div className="absolute inset-0 bg-[url('/images/frame-team-blue.png')] bg-center opacity-90" aria-hidden />
          <div className="absolute inset-0 bg-white/75 dark:bg-black/40" aria-hidden />
          <div className="relative p-8 sm:p-10 text-center">
            <h1 className="text-2xl font-semibold text-primary">Cannot Start Interview</h1>
            <p className="mt-3 text-muted-foreground">The meeting is not in a pending state. Please check the link or contact the recruiter.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10 bg-[url('/images/bg-blue.png')] bg-cover bg-no-repeat bg-center">
      <main className="w-full flex flex-col items-center">
        <ConvAI meetId={meetId} candidateId={candidateId} />
      </main>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}

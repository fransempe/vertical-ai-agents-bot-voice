'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Interview } from "@/types/interview";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const getStatusColor = (status: Interview['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: Interview['type']) => {
  switch (type) {
    case 'technical': return 'Technical Interview';
    case 'behavioral': return 'Behavioral Interview';
    case 'cultural-fit': return 'Cultural Fit Interview';
    case 'screening': return 'Initial Screening';
    default: return 'Interview';
  }
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

function MeetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/meets?token=${token}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting data');
        }
        
        const data = await response.json();
        
        // Convert scheduledTime string to Date object if needed
        if (data.scheduledTime && typeof data.scheduledTime === 'string') {
          data.scheduledTime = new Date(data.scheduledTime);
        }
        
        setInterview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl border-red-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-red-800">Access Denied</CardTitle>
              <CardDescription className="text-lg text-red-600">
                A valid authentication token is required to access this interview session.
              </CardDescription>
            </div>
            <div className="pt-4">
              <p className="text-sm text-red-500">
                Please contact your interviewer or administrator to obtain the proper access credentials.
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <LoadingSpinner />
            <p className="text-lg text-gray-600">Loading meeting information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-red-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-800">Error Loading Meeting</CardTitle>
            <CardDescription className="text-red-600">Please contact your interviewer.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">No Meeting Found</CardTitle>
            <CardDescription className="text-gray-600">
              No meeting data was found for the provided token.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative w-full h-[40vh] md:h-screen">
        <div className="absolute inset-0 bg-[url('/images/bg-interacciona.svg')] bg-no-repeat bg-cover bg-center" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 flex justify-center">
          <div className="backdrop-blur-[2px] text-white  px-4 py-3 max-w-xl text-center">
            <p className="text-lg sm:text-base md:text-xl font-medium">You&apos;re about to join an AI-powered interview session</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 h-full md:h-screen overflow-auto">
        <Card className="w-full max-w-2xl shadow-xl relative overflow-hidden bg-cover bg-center">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center overflow-hidden">
              <Image src="/images/acciona-logo-mini.png" alt="Acciona" width={36} height={36} className="w-12 h-10 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Interview Meeting</CardTitle>
          </div>
          <CardDescription className="text-lg">
            You&apos;re about to join an AI-powered interview session
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-lg text-gray-600">Interview ID: </label>
              <p className="font-mono text-lg">{interview.id}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-lg font-medium text-gray-600">Status: </label>
              <Badge className={getStatusColor(interview.status)}>
                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex">
              <label className="text-lg text-gray-600">Type: </label>
              <p className="text-lg ms-2">{getTypeLabel(interview.type)}</p>
            </div>
            
            <div className="flex">
              <label className="text-lg text-gray-600">Duration: </label>
              <p className="text-lg ms-2">8 minutes</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-600">Candidate Information</label>
            <div className="mt-2 space-y-1">
              <p className="text-xl font-semibold">{interview.candidate.name}</p>
              <p className="text-gray-600">{interview.candidate.position}</p>
              <p className="text-sm text-gray-500">{interview.candidate.email}</p>
              <p className="text-sm text-gray-500">{interview.candidate_id}</p>
            </div>
          </div>
                    
          <div className="pt-6">
            <Link href={`/interview?token=${token}&meet_id=${interview.id}&candidate_id=${interview.candidate_id}`} className="w-full">
              <Button className="w-full text-lg py-6 bg-[#292AD3] hover:bg-[#2325bf] text-white transition-all duration-200 transform ">
                Join Interview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function MeetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <MeetContent />
    </Suspense>
  );
}
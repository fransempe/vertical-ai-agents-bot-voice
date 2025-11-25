"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";
import { Interview } from "@/types/interview";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const getStatusColor = (status: Interview["status"]) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: Interview["type"]) => {
  switch (type) {
    case "technical":
      return "Entrevista Técnica";
    case "behavioral":
      return "Entrevista Conductual";
    case "cultural-fit":
      return "Entrevista de Ajuste Cultural";
    case "screening":
      return "Screening Inicial";
    default:
      return "Entrevista";
  }
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

function MeetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

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
          throw new Error("Failed to fetch meeting data");
        }

        const data = await response.json();

        // Convert scheduledTime string to Date object if needed
        if (data.scheduledTime && typeof data.scheduledTime === "string") {
          data.scheduledTime = new Date(data.scheduledTime);
        }

        setInterview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-red-800">
                Acceso Denegado
              </CardTitle>
              <CardDescription className="text-lg text-red-600">
                Se requiere un token de autenticación válido para acceder a esta
                sesión de entrevista.
              </CardDescription>
            </div>
            <div className="pt-4">
              <p className="text-sm text-red-500">
                Por favor, contacte a su entrevistador o administrador para obtener las
                credenciales de acceso adecuadas.
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
            <p className="text-lg text-gray-600">
              Cargando información de la reunión...
            </p>
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
            <CardTitle className="text-2xl font-bold text-red-800">
              Error al Cargar la Reunión
            </CardTitle>
            <CardDescription className="text-red-600">
              Por favor, contacte a su entrevistador.
            </CardDescription>
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
            <CardTitle className="text-2xl font-bold text-gray-800">
              No se Encontró la Reunión
            </CardTitle>
            <CardDescription className="text-gray-600">
              No se encontraron datos de reunión para el token proporcionado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative w-full h-[40vh] md:h-screen">
        <div
          className="absolute inset-0 bg-[url('/images/bg-interacciona.svg')] bg-no-repeat bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 flex justify-center">
          <div className="backdrop-blur-[2px] text-white  px-4 py-3 max-w-xl text-center">
            <p className="text-lg sm:text-base md:text-xl font-medium">
              Estás a punto de unirte a una sesión de entrevista impulsada por IA
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 h-full md:h-screen overflow-auto">
        <Card className="w-full max-w-2xl shadow-xl relative overflow-hidden bg-cover bg-center">
          <CardHeader className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-full rounded-lg flex items-center mb-4 justify-center overflow-hidden">
                <Image
                  src="/images/acciona-play.svg"
                  alt="Acciona Play"
                  width={220}
                  height={36}
                />
              </div>
            </div>
            <CardTitle className="text-xl !mt-4">
              Reunión de Entrevista
            </CardTitle>
            <CardDescription className="text-lg">
              Estás a punto de unirte a una sesión de entrevista impulsada por IA
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-lg text-gray-600">ID de Entrevista: </label>
                <p className="font-mono text-lg">{interview.id}</p>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-600">
                  Estado:{" "}
                </label>
                <Badge className={getStatusColor(interview.status)}>
                  {interview.status.charAt(0).toUpperCase() +
                    interview.status.slice(1)}
                </Badge>
              </div>

              <div className="flex">
                <label className="text-lg text-gray-600">Tipo: </label>
                <p className="text-lg ms-2">{getTypeLabel(interview.type)}</p>
              </div>

              <div className="flex">
                <label className="text-lg text-gray-600">Duración: </label>
                <p className="text-lg ms-2">8 minutos</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-600">
                Información del Candidato
              </label>
              <div className="mt-2 space-y-1">
                <p className="text-xl font-semibold">
                  {interview.candidate.name}
                </p>
                <p className="text-gray-600">{interview.candidate.position}</p>
                <p className="text-sm text-gray-500">
                  {interview.candidate.email}
                </p>
                <p className="text-sm text-gray-500">
                  {interview.candidate_id}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button
                className="w-full text-lg py-6 bg-[#292AD3] hover:bg-[#2325bf] text-white transition-all duration-200 transform "
                onClick={async () => {
                  try {
                    await fetch(`/api/meets/${interview.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "active" }),
                    });
                  } catch (e) {
                    console.error("Failed to set meet active before joining", e);
                  } finally {
                    router.push(
                      `/interview?token=${token}&meet_id=${interview.id}&candidate_id=${interview.candidate_id}`
                    );
                  }
                }}
              >
                Unirse a la Entrevista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MeetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="text-lg">Cargando...</div>
        </div>
      }
    >
      <MeetContent />
    </Suspense>
  );
}

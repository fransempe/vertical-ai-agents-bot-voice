"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { useConversation } from "@elevenlabs/react";
import { cn } from "@/lib/utils";

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

async function updateMeetStatus(meetId: string | null, status: "active" | "completed") {
  if (!meetId) {
    console.log("No meetId provided, skipping status update");
    return;
  }
  
  try {
    const response = await fetch(`/api/meets/${meetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    
    if (response.ok) {
      console.log(`Meet ${meetId} status updated to: ${status}`);
    } else {
      console.error(`Failed to update meet ${meetId} status:`, response.statusText);
    }
  } catch (error) {
    console.error("Error updating meet status:", error);
  }
}

interface ConvAIProps {
  meetId: string | null;
  candidateId: string | null;
}

export function ConvAI({ meetId, candidateId }: ConvAIProps) {
  const conversationHistoryRef = React.useRef<{source: "ai" | "user", message: string}[]>([]);
  const router = useRouter();

  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
      conversationHistoryRef.current = [];
    },
    onDisconnect: async () => {
      console.log("disconnected");
      console.log("Final conversation:", conversationHistoryRef.current);
      
      // Actualizar el estado del meet a "completed" cuando se desconecta
      await updateMeetStatus(meetId, "completed");
      
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL +"/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meet_id: meetId,
            candidate_id: candidateId,
            conversation_data: conversationHistoryRef.current
          }),
        });
        
        if (response.ok) {
          console.log("Conversation saved successfully");
        } else {
          console.error("Failed to save conversation:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving conversation:", error);
      }

      // Redirigir a la pantalla de closing después de guardar la conversación
      const query = new URLSearchParams();
      if (meetId) query.set("meet_id", meetId);
      if (candidateId) query.set("candidate_id", candidateId);
      router.push(`/interview/closing${query.toString() ? `?${query.toString()}` : ""}`);
    },
    onError: error => {
      console.log("Conversation error:", error);
      console.log("Error type:", typeof error);
      console.log("Error constructor:", error.constructor.name);
      alert("An error occurred during the conversation: " + JSON.stringify(error));
    },
    onMessage: message => {
      console.log(message);
      const conversationEntry = {
        source: message.source,
        message: message.message
      };
      conversationHistoryRef.current.push(conversationEntry);
      console.log("Current conversation:", conversationHistoryRef.current);
    },
  });

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    try {
      const signedUrl = await getSignedUrl();
      console.log("Signed URL:", signedUrl);
      const conversationId = await conversation.startSession({ signedUrl });
      console.log("Conversation ID:", conversationId);
    } catch (error) {
      console.error("Error starting conversation:", error);
      console.error("Error type:", typeof error);
      if (error && typeof error === 'object') {
        console.error("Error keys:", Object.keys(error));
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error message:", errorMessage);
      alert("Failed to start conversation: " + errorMessage);
    }
  }

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    const query = new URLSearchParams();
    if (meetId) query.set("meet_id", meetId);
    if (candidateId) query.set("candidate_id", candidateId);
    router.push(`/interview/closing${query.toString() ? `?${query.toString()}` : ""}`);
  }, [conversation, router, meetId, candidateId]);

  return (
    <div className={"flex justify-center items-center gap-x-4 w-full"}>
      <Card
        className={
          "relative rounded-3xl overflow-hidden border-0 shadow-2xl max-w-xl w-full bg-card"
        }
      >
        <div
          className="absolute inset-0 bg-[url('/images/frame-team-blue.png')] bg-no-repeat bg-fixed bg-center opacity-90"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-black/40" aria-hidden />
        <CardContent className="relative">
          <CardHeader>
            <div className="w-full flex items-center justify-center py-5">
              <Image src="/images/acciona-play.svg" alt="Acciona Play" width={220} height={36} />
            </div>
          </CardHeader>
          <div className={"flex flex-col gap-y-6 text-center items-center"}>
            <div
              className={cn(
                "orb my-12 mx-12",
                conversation.status === "connected" && conversation.isSpeaking
                  ? "orb-active animate-orb"
                  : conversation.status === "connected"
                  ? "animate-orb-slow orb-inactive"
                  : "orb-inactive"
              )}
            ></div>

            <div className="text-primary text-lg font-medium">
              {conversation.status === "connected" ? "Entrevista conectada" : "Entrevista desconectada"}
            </div>


            <Button
              variant={"default"}
              className={"rounded-full min-w-60 shadow-lg"}
              size={"xl"}
              disabled={
                conversation !== null && conversation.status === "connected"
              }
              onClick={startConversation}
            >
              Iniciar entrevista
            </Button>
            <Button
              variant={"outline"}
              className={"rounded-full min-w-60"}
              size={"lg"}
              disabled={conversation === null || conversation.status !== "connected"}
              onClick={stopConversation}
            >
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

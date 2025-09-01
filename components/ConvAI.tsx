"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ConvAIProps {
  meetId: string | null;
  candidateId: string | null;
}

export function ConvAI({ meetId, candidateId }: ConvAIProps) {
  const conversationHistoryRef = React.useRef<{source: "ai" | "user", message: string}[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
      conversationHistoryRef.current = [];
    },
    onDisconnect: async () => {
      console.log("disconnected");
      console.log("Final conversation:", conversationHistoryRef.current);
      
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
  }, [conversation]);

  return (
    <div className={"flex justify-center items-center gap-x-4"}>
      <Card className={"rounded-3xl"}>
        <CardContent>
          <CardHeader>
            <CardTitle className={"text-center"}>
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Agent is speaking`
                  : "Agent is listening"
                : "Disconnected"}
            </CardTitle>
          </CardHeader>
          <div className={"flex flex-col gap-y-4 text-center"}>
            <div
              className={cn(
                "orb my-16 mx-12",
                conversation.status === "connected" && conversation.isSpeaking
                  ? "orb-active animate-orb"
                  : conversation.status === "connected"
                  ? "animate-orb-slow orb-inactive"
                  : "orb-inactive"
              )}
            ></div>

            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              disabled={
                conversation !== null && conversation.status === "connected"
              }
              onClick={startConversation}
            >
              Start conversation
            </Button>
            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              disabled={conversation === null}
              onClick={stopConversation}
            >
              End conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

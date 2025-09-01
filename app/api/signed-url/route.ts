import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  console.log("Environment check - AGENT_ID exists:", !!process.env.AGENT_ID);
  console.log("Environment check - ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
  
  const agentId = process.env.AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!agentId) {
    console.error("AGENT_ID is not set in environment variables");
    return NextResponse.json(
      { error: "AGENT_ID is not configured" },
      { status: 500 }
    );
  }
  
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    console.log("Creating ElevenLabs client...");
    console.log("API Key length:", apiKey.length);
    
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });
    
    console.log("Requesting signed URL for agent:", agentId);
    const response = await client.conversationalAi.conversations.getSignedUrl({
      agentId: agentId,
    });
    
    if (!response.signedUrl) {
      console.error("No signed URL received from ElevenLabs API");
      return NextResponse.json(
        { error: "No signed URL received from ElevenLabs API" },
        { status: 500 }
      );
    }
    
    console.log("ElevenLabs API response received:", !!response.signedUrl);
    return NextResponse.json({ signedUrl: response.signedUrl });
  } catch (error) {
    console.error("ElevenLabs API Error:", error);
    console.error("Error type:", error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    let errorMessage = "Failed to get signed URL from ElevenLabs";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        errorMessage = "Invalid API key";
        statusCode = 401;
      } else if (error.message.includes("404") || error.message.includes("Not Found")) {
        errorMessage = "Agent not found";
        statusCode = 404;
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error connecting to ElevenLabs";
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : "Unknown error" },
      { status: statusCode }
    );
  }
}

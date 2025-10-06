import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Environment check - ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // Get meet_id from query params
  const meetId = request.nextUrl.searchParams.get('meet_id');
  
  if (!meetId) {
    console.error("meet_id is required");
    return NextResponse.json(
      { error: "meet_id is required" },
      { status: 400 }
    );
  }

  // Fetch agent_id dynamically from API
  let agentId: string;
  try {
    console.log("Fetching agent_id for meet_id:", meetId);
    const agentResponse = await fetch(`${apiUrl}/api/agents/by-meet/${meetId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!agentResponse.ok) {
      console.error("Failed to fetch agent data");
      return NextResponse.json(
        { error: "Failed to fetch agent data" },
        { status: 500 }
      );
    }

    const agentData = await agentResponse.json();
    agentId = agentData.agent_id || agentData.agentId;

    if (!agentId) {
      console.error("agent_id not found in API response");
      return NextResponse.json(
        { error: "agent_id not found in API response" },
        { status: 500 }
      );
    }

    console.log("Successfully fetched agent_id:", agentId);
  } catch (error) {
    console.error("Error fetching agent_id:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent_id dynamically" },
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

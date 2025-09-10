import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: meetId } = await params;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    if (!["active", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'active' or 'completed'" },
        { status: 400 }
      );
    }

    console.log(`Updating meet ${meetId} status to: ${status}`);

    // Aquí harías la llamada a tu backend/base de datos para actualizar el estado
    // Por ahora solo logueamos la operación
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/meets/${meetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      console.error("Failed to update meet status:", response.statusText);
      return NextResponse.json(
        { error: "Failed to update meet status" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Meet status updated successfully:", data);

    return NextResponse.json({ 
      success: true, 
      meetId, 
      status,
      message: `Meet ${meetId} status updated to ${status}` 
    });

  } catch (error) {
    console.error("Error updating meet status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
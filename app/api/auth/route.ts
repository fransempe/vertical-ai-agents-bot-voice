import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { email, password, meetId } = await request.json();
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Make request to external API
    const authResponse = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        meetId
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return NextResponse.json(
        { message: authData.message || 'Authentication failed' },
        { status: authResponse.status }
      );
    }

    // Authentication successful with external API
    // Create JWT using jose (Edge Runtime compatible)
    const token = await new SignJWT({ email, meetId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    console.log('Token created:', { tokenLength: token.length });

    // Create the response
    const response = NextResponse.json(
      { 
        message: 'Authentication successful',
        user: { email, meetId },
        ...authData
      },
      { status: 200 }
    );

    // Set HTTP-Only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    console.log('Cookie set in response');

    return response;

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Network error or external API unavailable' },
      { status: 500 }
    );
  }
}
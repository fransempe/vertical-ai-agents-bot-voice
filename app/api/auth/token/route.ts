import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

async function handleTokenLogin(tokenFromClient: string) {
  if (!API_URL) {
    return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  }

  try {
    const apiResponse = await fetch(`${API_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenFromClient }),
    });

    const authData = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: authData?.message || 'Token authentication failed' },
        { status: apiResponse.status }
      );
    }

    const meetId = authData?.user?.meetId || authData?.meetId;

    const signedJwt = await new SignJWT({ meetId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json(
      {
        message: 'Authentication successful',
        user: { meetId },
        ...authData,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'auth-token',
      value: signedJwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token auth error:', error);
    return NextResponse.json(
      { message: 'Network error or external API unavailable' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ message: 'Missing token' }, { status: 400 });
  }
  return handleTokenLogin(token);
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }
    return handleTokenLogin(token);
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}



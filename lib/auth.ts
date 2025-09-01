import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface AuthUser {
  email: string;
  meet_id?: string;
  iat?: number;
  exp?: number;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthUser;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthUser;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
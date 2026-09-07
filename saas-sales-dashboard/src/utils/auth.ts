import { auth } from '@/app/api/auth/[...nextauth]/route';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  companyId: string;
  role: 'admin' | 'analyst' | 'viewer';
  plan: 'free' | 'monthly' | 'yearly';
}

/**
 * Server-side: retrieve the current authenticated user from the NextAuth session.
 * Use this inside Server Components and API Route handlers.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;
    return session.user as SessionUser;
  } catch {
    return null;
  }
}

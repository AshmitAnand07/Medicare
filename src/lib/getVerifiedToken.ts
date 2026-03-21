import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from './auth';

/**
 * Extracts and verifies a JWT from either:
 * 1. The Authorization Bearer header (for cross-origin / localStorage-based auth)
 * 2. The 'token' cookie (for same-origin / httpOnly cookie auth)
 *
 * Returns the decoded payload or null if not authenticated.
 */
export async function getVerifiedToken(req: NextRequest): Promise<any | null> {
    // 1. Try Authorization header first (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token);
        if (payload) return payload;
    }

    // 2. Fall back to cookie
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (token) {
            const payload = await verifyJWT(token);
            if (payload) return payload;
        }
    } catch {
        // cookies() may throw in some Next.js contexts; ignore
    }

    return null;
}

import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Warning: Missing JWT_SECRET during build/runtime
        return new TextEncoder().encode('fallback_secret_for_build');
    }
    return new TextEncoder().encode(secret);
}

export async function signJWT(payload: any, expiresIn: string = '1d') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getJwtSecret());
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/collections(.*)', '/profile(.*)', '/ask-question(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

function readRoleFromSessionClaims(sessionClaims: unknown): string | undefined {
    if (!sessionClaims || typeof sessionClaims !== 'object') return undefined;
    const claims = sessionClaims as Record<string, unknown>;
    const pm = claims.publicMetadata ?? claims.public_metadata;
    if (pm && typeof pm === 'object' && 'role' in pm) {
        const r = (pm as { role?: unknown }).role;
        if (typeof r === 'string') return r;
    }
    const md = claims.metadata;
    if (md && typeof md === 'object' && 'role' in md) {
        const r = (md as { role?: unknown }).role;
        if (typeof r === 'string') return r;
    }
    return undefined;
}

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();

    if (isAdminRoute(req)) {
        await auth.protect();
        const { sessionClaims } = await auth();
        const role = readRoleFromSessionClaims(sessionClaims);
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};

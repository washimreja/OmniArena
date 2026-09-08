import { NextResponse } from 'next/server';

// Phase 7: Replace with Supabase SSR session check
// For now: all routes are accessible (no auth required in Phase 1)
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Cache HTML pages in CDN and browsers for 1 hour, with stale-while-revalidate
  // This improves TTFB significantly
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  )
  
  return response
}

export const config = {
  matcher: ['/', '/casas', '/experiencias', '/nosotros', '/about', '/houses', '/experiences'],
}

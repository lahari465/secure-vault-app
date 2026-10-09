import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Everything under /api needs a signed-in user. Each route also checks this
// itself (lib/api.ts), so a mistake here can never expose data.
const isProtectedRoute = createRouteMatcher(['/api/(.*)', '/dashboard(.*)', '/forum(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req) && !auth().userId) {
    return Response.json({ error: 'Please sign in' }, { status: 401 })
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

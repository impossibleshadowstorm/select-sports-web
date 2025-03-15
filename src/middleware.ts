// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import NextAuth from 'next-auth';
import authConfig from '@/lib/auth.config';
import { Role } from '@prisma/client';
import { authorizedGet } from './lib/api-client';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  if (!req.auth) {
    const url = req.url.replace(req.nextUrl.pathname, '/login');
    return Response.redirect(url);
  }
  // Extract the token from the session

  try {
    const token: string = req.auth.user!.id!;

    // Call the /me endpoint to get user details
    const response = await authorizedGet('/auth/me', token);

    if (response.status !== 200 || !response.data) {
      // If the /me request fails, redirect to the home page
      const url = req.url.replace(req.nextUrl.pathname, '/login');
      return Response.redirect(url);
    }

    // Check if the user's role is ADMIN
    if (response.data.role !== Role.ADMIN) {
      // If the user is not an admin, redirect to the home page
      const url = req.url.replace(req.nextUrl.pathname, '/login');
      return Response.redirect(url);
    }
  } catch (error) {
    const url = req.url.replace(req.nextUrl.pathname, '/login');
    return Response.redirect(url);
  }
});

export const config = { matcher: ['/dashboard/:path*'] };

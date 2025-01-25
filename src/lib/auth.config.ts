import { CredentialsSignin, NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password';
}

const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new InvalidLoginError();
        }

        try {
          const res = await fetch('http://localhost:3005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (!res.ok) {
            return null;
          }

          const response = await res.json();

          return { ...response.data, id: response.data.token };
        } catch (error) {
          // eslint-disable-line
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.token = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user role to the session
      if (token.token) {
        session.user.id = token.sub || '';
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
} satisfies NextAuthConfig;

export default authConfig;

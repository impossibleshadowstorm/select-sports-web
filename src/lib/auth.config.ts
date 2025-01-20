import { CredentialsSignin, NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';


class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password"
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
            body: JSON.stringify({ email, password }),
          });
      
          if (!res.ok) {
            throw new InvalidLoginError();
          }
      
          const user = await res.json();
      
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) { // eslint-disable-line
          throw new InvalidLoginError();
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
        token.role = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user role to the session
      if (token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export default authConfig;

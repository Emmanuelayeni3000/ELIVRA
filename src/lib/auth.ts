import { NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("No account found with this email address");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }
          
          if (!user.emailVerified) {
            throw new Error('Please verify your email address before signing in.');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          // Re-throw the error to be handled by NextAuth
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials' && user?.email) {
        try {
          await prisma.user.update({
            where: { id: user.id as string },
            data: { emailVerified: new Date() },
          });
        } catch (error) {
          console.error('Error updating email verification status:', error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const adapterUser = user as AdapterUser & { emailVerified?: Date | null };
        token.id = user.id;
        token.name = user.name || '';
        token.emailVerified = adapterUser.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name || '';
        session.user.emailVerified = token.emailVerified as Date | null; // Expose verification status in session
      }
      return session;
    },
  },
};
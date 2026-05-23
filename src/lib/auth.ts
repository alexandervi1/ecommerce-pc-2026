import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { queryOne, execute, table } from "./db";

const SESSION_MAX_AGE = 30 * 60; // 30 minutes in seconds

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otpToken: { label: "OTP Token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const otpToken = credentials?.otpToken as string | undefined;

        // --- Path A: OTP token exchange (after 2FA verification) ---
        if (email && otpToken) {
          const tokenRecord = await queryOne<{
            user_id: string;
            expires_at: string;
          }>(
            `SELECT user_id, expires_at FROM ${table("otp_tokens")} WHERE token = $1`,
            [otpToken]
          );

          if (!tokenRecord) return null;
          if (new Date(tokenRecord.expires_at) < new Date()) return null;

          // Consume the one-time token immediately
          await execute(
            `DELETE FROM ${table("otp_tokens")} WHERE token = $1`,
            [otpToken]
          );

          const user = await queryOne<{
            id: string;
            email: string;
            name: string;
            role: string;
            session_version: number;
          }>(
            `SELECT id, email, name, role, session_version FROM ${table("users")} WHERE id = $1`,
            [tokenRecord.user_id]
          );

          if (!user) return null;

          // Increment session_version to invalidate any previous sessions
          const newVersion = (user.session_version ?? 0) + 1;
          await execute(
            `UPDATE ${table("users")} SET session_version = $1 WHERE id = $2`,
            [newVersion, user.id]
          );

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            sessionVersion: newVersion,
          };
        }

        // --- Path B: Direct credential check (kept for edge cases / tests) ---
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await queryOne<{
          id: string;
          email: string;
          name: string;
          password: string;
          role: string;
          session_version: number;
        }>(
          `SELECT id, email, name, password, role, session_version FROM ${table("users")} WHERE email = $1`,
          [email]
        );

        if (!user || !user.password) return null;

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) return null;

        const newVersion = (user.session_version ?? 0) + 1;
        await execute(
          `UPDATE ${table("users")} SET session_version = $1 WHERE id = $2`,
          [newVersion, user.id]
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: newVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.sessionVersion = (user as { sessionVersion: number }).sessionVersion;
        token.issuedAt = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.sessionVersion = token.sessionVersion as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 5 * 60, // Refresh cookie every 5 minutes while active
  },
});

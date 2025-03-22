import NextAuth from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);
        console.log("DB User:", user);
        if (user.length === 0) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(
            credentials.password.toString(),
            user[0].password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].name,
          role: user[0].role, // Add role here
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user  }) {
      if (user) {
        token.id = user.id;
        // token.name = user.name;
        // @ts-ignore
        token.role = user.role as string;  // Store role in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // session.user.name = token.name as string;
        // @ts-ignore
        session.user.role = token.role as string; // Store role in session
      }
      return session;
    },
  },
});

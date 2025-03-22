import CredentialsProvider from "next-auth/providers/credentials"
import  connectToDatabase  from "@/lib/mongodb"
import User from "@/models/User"
import {IUser} from "@/models/User"
import { compare } from "bcryptjs"
import {db} from "@/database/drizzle";
import {users} from "@/database/schema";
import {eq} from "drizzle-orm";
// @ts-ignore
import NextAuth, {AuthOptions, NextAuthOptions} from "next-auth"
const authOptions: AuthOptions = {
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
    callbacks: {
        async jwt({ token, user  }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.id = token.id as string
                // @ts-ignore
                session.user.role = token.role as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

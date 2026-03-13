import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getClientByUsername } from "@/lib/clients";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/clients/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const client = getClientByUsername(credentials.username);
                if (!client) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    client.passwordHash
                );
                if (!passwordMatch) return null;

                return {
                    id: client.slug,
                    name: client.name,
                    email: client.slug, // repurpose email field to store slug
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.slug = user.id;
                token.clientName = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    // @ts-ignore
                    slug: token.slug,
                    name: token.clientName as string,
                };
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

//@ts-nocheck
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
const handler = NextAuth({
  adapter: MongoDBAdapter(client),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
      }
      return session;
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const response = await axios.post(
            "http://localhost:8000/v1/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          const user = response.data;

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          }

          return null;
        } catch (error: any) {
          throw new Error(error.response?.data?.error || "Invalid credentials");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

import axios from "axios";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  adapter: MongoDBAdapter(client),
  callbacks: {
    async jwt({ token, user }) {
      console.log("Hello  --->");
      console.log(user);
      if (user) {
        token._id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session: ", session, token);
      if (session.user) {
        session.user._id = token._id as string;
      }
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth2 client for verifying One Tap ID tokens
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handler = NextAuth({
  adapter: MongoDBAdapter(client),
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - Token:", token);
      console.log("JWT Callback - User:", user);

      if (user) {
        const userExists = await client
          .db("Cluster0")
          .collection("users")
          .findOne({ email: user.email });

        console.log("User Exists:", userExists);

        if (!userExists) {
          token.isNewUser = true;
          console.log("New User - Setting isNewUser flag to true");
        } else {
          token.isNewUser = false;
          console.log("Existing User - Setting isNewUser flag to false");
        }

        token._id = user.id;
      } else if (token.isNewUser === undefined) {
        token.isNewUser = false;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", token);
      session.user._id = token._id;
      session.user.isNewUser = token.isNewUser;

      console.log("Session Callback - Session User:", session.user);
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "googleonetap",
      name: "google-one-tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials, req) {
        const token = credentials?.credential;
        if (!token) {
          throw new Error("No credential provided");
        }

        const ticket = await googleAuthClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error("Cannot extract payload from signin token");
        }

        const {
          email,
          sub,
          given_name,
          family_name,
          email_verified,
          picture: image,
        } = payload;

        if (!email || !email_verified) {
          throw new Error("Email not verified or not available");
        }

        return {
          id: sub,
          name: `${given_name} ${family_name}`,
          email,
          image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});

export { handler as GET, handler as POST };

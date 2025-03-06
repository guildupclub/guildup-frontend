import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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

        // Set isNewUser flag based on database check
        if (!userExists) {
          token.isNewUser = true;
          console.log("New User - Setting isNewUser flag to true");
        } else {
          token.isNewUser = false;
          console.log("Existing User - Setting isNewUser flag to false");
        }

        token._id = user.id;
      } else if (token.isNewUser === undefined) {
        token.isNewUser = false; // Fallback for undefined user
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
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
});

export { handler as GET, handler as POST };

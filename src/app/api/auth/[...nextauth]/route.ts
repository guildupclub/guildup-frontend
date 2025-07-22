import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ObjectId } from "mongodb";

// COMMENTED OUT - Google One Tap imports (uncomment when needed)
// import CredentialsProvider from "next-auth/providers/credentials";
// import { OAuth2Client } from "google-auth-library";
// const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handler = NextAuth({
  adapter: MongoDBAdapter(client),
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google One Tap, ensure we have a proper MongoDB ObjectId (COMMENTED OUT)
      // if (
      //   account?.provider === "googleonetap" ||
      //   account?.provider === "google"
      // ) {
      
      // For Google OAuth, ensure we have a proper MongoDB ObjectId
      if (account?.provider === "google") {
        try {
          const existingUser = await client
            .db(process.env.MONGO_DB_NAME )
            .collection("users")
            .findOne({ email: user.email });
          if (existingUser) {
            // User exists, use their existing ObjectId
            user.id = existingUser._id.toString();
          } else {
            // New user, create with new ObjectId
            const newObjectId = new ObjectId();
            user.id = newObjectId.toString();
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      console.log("JWT Callback - Token:", token);
      console.log("JWT Callback - User:", user);

      if (user) {
        try {
          const db = client.db(process.env.MONGO_DB_NAME );
          const usersCollection = db.collection("users");

          const userExists = await usersCollection.findOne({
            email: user.email,
          });
          console.log("User Exists:", userExists);

          if (!userExists) {
            token.isNewUser = true;
            console.log("New User - Setting isNewUser flag to true");
            // Ensure we have a valid ObjectId for new users
            if (!ObjectId.isValid(user.id)) {
              const newObjectId = new ObjectId();
              token._id = newObjectId.toString();
            } else {
              token._id = user.id;
            }
          } else {
            token.isNewUser = false;
            token._id = userExists._id.toString();
            console.log("Existing User - Setting isNewUser flag to false");
          }

          console.log("Setting user ID in token:", token._id);
        } catch (error) {
          console.error("Error in JWT callback:", error);
          token.isNewUser = false;
          // Fallback: generate new ObjectId if there's an error
          token._id = new ObjectId().toString();
        }
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

    // GOOGLE ONE TAP SIGN-IN - COMMENTED OUT
    // CredentialsProvider({
    //   id: "googleonetap",
    //   name: "google-one-tap",
    //   credentials: {
    //     credential: { type: "text" },
    //   },

    //   async authorize(credentials, req) {
    //     const token = credentials?.credential;
    //     if (!token) {
    //       throw new Error("No credential provided");
    //     }

    //     try {
    //       const ticket = await googleAuthClient.verifyIdToken({
    //         idToken: token,
    //         audience: process.env.GOOGLE_CLIENT_ID,
    //       });

    //       const payload = ticket.getPayload();

    //       if (!payload) {
    //         throw new Error("Cannot extract payload from signin token");
    //       }

    //       const {
    //         email,
    //         sub,
    //         given_name,
    //         family_name,
    //         email_verified,
    //         picture: image,
    //       } = payload;

    //       if (!email || !email_verified) {
    //         throw new Error("Email not verified or not available");
    //       }

    //       const db = client.db(process.env.MONGO_DB_NAME );
    //       const usersCollection = db.collection("users");

    //       // Check if user already exists
    //       const existingUser = await usersCollection.findOne({ email });

    //       if (existingUser) {
    //         return {
    //           id: existingUser._id.toString(),
    //           googleId: sub,
    //           name: existingUser.name,
    //           email: existingUser.email,
    //           image: existingUser.image,
    //         };
    //       } else {
    //         const newUser = {
    //           _id: new ObjectId(),
    //           googleId: sub,
    //           name: `${given_name} ${family_name}`,
    //           email,
    //           image,
    //           emailVerified: new Date(), // optional but often useful
    //         };

    //         await usersCollection.insertOne(newUser);

    //         return {
    //           id: newUser._id.toString(),
    //           googleId: sub,
    //           name: newUser.name,
    //           email: newUser.email,
    //           image: newUser.image,
    //         };
    //       }
    //     } catch (error) {
    //       console.error("Error in Google One Tap authorization:", error);
    //       throw error;
    //     }
    //   },
    // }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})
export { handler as GET, handler as POST };
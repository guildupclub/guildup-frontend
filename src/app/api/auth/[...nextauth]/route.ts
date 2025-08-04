import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import { ObjectId } from "mongodb";

// Initialize Google OAuth2 client for verifying One Tap ID tokens
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handler = NextAuth({
  adapter: MongoDBAdapter(client),
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google One Tap, ensure we have a proper MongoDB ObjectId
      if (
        account?.provider === "googleonetap" ||
        account?.provider === "google"
      ) {
        try {
          // const db = client.db("test");
          // const usersCollection = db.collection("users");

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

          // Handle both email and phone-based users
          let userExists;
          if (user.email) {
            userExists = await usersCollection.findOne({ email: user.email });
          } else if (user.phone) {
            userExists = await usersCollection.findOne({ phone: user.phone });
          }
          
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
            // Add phone to token if available
            if (userExists.phone) {
              token.phone = userExists.phone;
            }
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
      
      // Add phone to session if available
      if (token.phone) {
        session.user.phone = token.phone;
      }
      
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

        try {
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

          const db = client.db(process.env.MONGO_DB_NAME );
          const usersCollection = db.collection("users");

          // Check if user already exists
          const existingUser = await usersCollection.findOne({ email });

          if (existingUser) {
            return {
              id: existingUser._id.toString(),
              googleId: sub,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            };
          } else {
            const newUser = {
              _id: new ObjectId(),
              googleId: sub,
              name: `${given_name} ${family_name}`,
              email,
              image,
              emailVerified: new Date(), // optional but often useful
            };

            await usersCollection.insertOne(newUser);

            return {
              id: newUser._id.toString(),
              googleId: sub,
              name: newUser.name,
              email: newUser.email,
              image: newUser.image,
            };
          }
        } catch (error) {
          console.error("Error in Google One Tap authorization:", error);
          throw error;
        }
      },
    }),

    CredentialsProvider({
      id: "credentials",
      name: "phone-credentials",
      credentials: {
        phone: { type: "text" },
      },

      async authorize(credentials, req) {
        const phone = credentials?.phone;
        if (!phone) {
          throw new Error("Phone number is required");
        }

        try {
          console.log("Phone credentials authorization - looking for phone:", phone);
          const db = client.db(process.env.MONGO_DB_NAME);
          const usersCollection = db.collection("users");

          // Find user by phone number
          const existingUser = await usersCollection.findOne({ phone });
          console.log("User found by phone:", existingUser ? "Yes" : "No");

          if (existingUser) {
            console.log("Returning user data for phone-based login:", {
              id: existingUser._id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone
            });
            
            return {
              id: existingUser._id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              image: existingUser.image,
            };
          } else {
            // User doesn't exist yet - this can happen if OTP verification is still in progress
            // or if there's a timing issue between user creation and this lookup
            console.warn("User not found for phone:", phone, "- this might be a timing issue");
            
            // Instead of throwing an error, return null to indicate user not found
            // This allows the booking flow to continue without NextAuth session
            return null;
          }
        } catch (error) {
          console.error("Error in phone credentials authorization:", error);
          throw error;
        }
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
})
export { handler as GET, handler as POST };
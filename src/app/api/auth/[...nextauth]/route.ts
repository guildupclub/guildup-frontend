import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { store } from '@/redux/store';
import { setUser } from '@/redux/userSlice';


const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("@here",credentials)
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
          const user = response.data.data.user;

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              session: response.data.data.session
            };
          }

          return null;
        } catch (error: any) {
          console.log("@error",error)
          throw new Error(error.response?.data?.error || "Invalid credentials");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks:{
    async signIn({ user, account, profile }) {
      console.log("@siginIN",user,account,profile)
      if (account?.provider === "google") {
        try {
          console.log("@authDetails",user.name,user.email,user.image)
          const response = await axios.post("http://localhost:8000/v1/auth/google", {
           user:{ name: user.name,
            email: user.email,
            image: user.image}
          });
          console.log("@response",response.data)
          if (response.status !== 200) {
            throw new Error('Google authentication failed');
          }
          account.access_token= response.data.data.session
          return true;
        } catch (error) {
          console.error("Google auth error:", error);
          return false;
        }
      }
      // Called when the user signs in; you can send data to the backend here if needed
      return true;
    },
    async jwt(jwt) {
      console.log("@jwt",jwt)
      // Add custom properties to the token on login
      if (jwt.user) {
        jwt.token.id = jwt.user.id;
        jwt.token.session = (jwt.user as any).session; // Example custom field
      }
      return jwt.token;
    },
    async session({session,token}) {
      // console.log("@sessionFunc",sessionData)

      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

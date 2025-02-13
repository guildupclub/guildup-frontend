import { DefaultSession } from "next-auth/core/types";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
    } & DefaultSession["user"]; // Extend the default user type
  }
}

import { DefaultSession } from "next-auth/core/types";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      phone?: string;
      isNewUser?: boolean;
    } & DefaultSession["user"]; // Extend the default user type
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    phone?: string;
    isNewUser?: boolean;
  }
}

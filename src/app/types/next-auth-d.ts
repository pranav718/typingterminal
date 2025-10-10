import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "guest" | "user";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "guest" | "user";
    isGuest?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "guest" | "user";
    id: string;
  }
}
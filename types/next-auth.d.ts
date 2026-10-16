import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/app/generated/prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    workspaceId: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      workspaceId: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    workspaceId?: string;
    role?: UserRole;
  }
}
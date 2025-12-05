import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireRole(role) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== role) {
    throw new Error("No autorizado");
  }
  return session;
}
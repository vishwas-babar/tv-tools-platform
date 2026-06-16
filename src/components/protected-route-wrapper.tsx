import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export async function ProtectedRouteWrapper({
  children,
  requireAdmin = false,
}: ProtectedRouteWrapperProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (requireAdmin && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

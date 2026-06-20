import { auth } from "@/lib/auth";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const session = await auth();

  return (
    <NavbarClient
      isLoggedIn={!!session?.user}
      isAdmin={session?.user?.role === "ADMIN"}
      userName={session?.user?.name}
    />
  );
}

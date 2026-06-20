import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      tradingViewId: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-2 text-foreground-secondary">
          Manage your account information and TradingView details.
        </p>
      </div>

      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          tradingViewId: user.tradingViewId,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toLocaleDateString(undefined, {
            dateStyle: "medium",
          }),
        }}
      />
    </div>
  );
}

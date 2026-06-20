"use client";

import { logoutUser } from "@/actions/auth";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({
  className = "rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground",
}: LogoutButtonProps) {
  return (
    <form action={logoutUser}>
      <button type="submit" className={className}>
        Logout
      </button>
    </form>
  );
}

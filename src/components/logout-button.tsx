"use client";

import { logoutUser } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutUser}>
      <button
        type="submit"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Logout
      </button>
    </form>
  );
}

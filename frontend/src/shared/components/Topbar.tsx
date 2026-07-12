"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/shared/store/auth.store";
import { authApi } from "@/shared/services/auth";
import { initials } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignore — local logout still proceeds */
      }
    }
    logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline bg-surface px-6">
      <h1 className="text-headline-md font-semibold text-on-surface">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-body-sm font-medium text-on-surface">{user?.email ?? "—"}</div>
          <div className="text-label-md text-on-surface-variant">
            {user?.is_superadmin ? "Super Admin" : "User"}
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-body-sm font-semibold text-primary">
          {user ? initials(user.email) : "?"}
        </div>
        <button
          onClick={handleLogout}
          className="rounded p-2 text-on-surface-variant hover:bg-surface-container"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

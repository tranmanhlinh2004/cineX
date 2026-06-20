"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import {
  canUsePermissionRule,
  permissionDeniedMessage,
  type PermissionRule,
} from "@/lib/admin-permissions";
import { showToast } from "@/lib/toast";
import { useAuthUser } from "@/lib/use-auth-user";

type PermissionControlBase = {
  permissionRule?: PermissionRule;
  children: ReactNode;
};

function usePermissionBlocked(permissionRule?: PermissionRule) {
  const authUser = useAuthUser();
  const permissionsLoaded = Array.isArray(authUser?.permissions);

  return permissionsLoaded && !canUsePermissionRule(authUser, permissionRule);
}

function showPermissionToast() {
  showToast(permissionDeniedMessage, "error");
}

export function PermissionButton({
  permissionRule,
  disabled,
  className,
  onClick,
  children,
  ...props
}: PermissionControlBase & ComponentPropsWithoutRef<"button">) {
  const blocked = usePermissionBlocked(permissionRule);

  return (
    <button
      {...props}
      disabled={disabled}
      aria-disabled={blocked || disabled}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          showPermissionToast();
          return;
        }

        onClick?.(event);
      }}
      className={`${className ?? ""} ${
        blocked
          ? "cursor-not-allowed opacity-45 hover:bg-transparent"
          : ""
      }`}
    >
      {children}
    </button>
  );
}

export function PermissionLink({
  permissionRule,
  className,
  onClick,
  children,
  ...props
}: PermissionControlBase & ComponentPropsWithoutRef<typeof Link>) {
  const blocked = usePermissionBlocked(permissionRule);

  return (
    <Link
      {...props}
      aria-disabled={blocked}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (blocked) {
          event.preventDefault();
          showPermissionToast();
          return;
        }

        onClick?.(event);
      }}
      className={`${className ?? ""} ${
        blocked
          ? "cursor-not-allowed opacity-45 hover:bg-transparent"
          : ""
      }`}
    >
      {children}
    </Link>
  );
}

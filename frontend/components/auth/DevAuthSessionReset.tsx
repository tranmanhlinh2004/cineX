"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { consumeAuthDevSessionReset } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

export default function DevAuthSessionReset() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const didResetAuth = consumeAuthDevSessionReset();

    if (!didResetAuth || isLoginPath(pathname)) {
      return;
    }

    router.replace(createLoadingPath("/login"));
  }, [pathname, router]);

  return null;
}

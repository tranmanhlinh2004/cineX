"use client";

import { useEffect, useState } from "react";
import { AUTH_STORAGE_EVENT, getAuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [authUser, setAuthUser] = useState(() => getAuthUser());

  useEffect(() => {
    const syncAuthUser = () => setAuthUser(getAuthUser());

    window.addEventListener("storage", syncAuthUser);
    window.addEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
    window.addEventListener("focus", syncAuthUser);

    return () => {
      window.removeEventListener("storage", syncAuthUser);
      window.removeEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
      window.removeEventListener("focus", syncAuthUser);
    };
  }, []);

  return authUser;
}

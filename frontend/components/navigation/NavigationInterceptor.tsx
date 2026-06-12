"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLoadingPath, LOADING_ROUTE } from "@/lib/navigation";

function getInternalDestination(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a[href]");

  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }

  if (anchor.dataset.pageLoader === "false") {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) {
    return null;
  }

  const nextUrl = new URL(anchor.href, window.location.href);

  if (nextUrl.origin !== window.location.origin || nextUrl.pathname === LOADING_ROUTE) {
    return null;
  }

  const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const nextRoute = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

  if (currentRoute === nextRoute) {
    return null;
  }

  return nextRoute;
}

export default function NavigationInterceptor() {
  const router = useRouter();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (window.location.pathname === LOADING_ROUTE) {
        return;
      }

      const destination = getInternalDestination(event);

      if (!destination) {
        return;
      }

      event.preventDefault();
      router.push(createLoadingPath(destination));
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [router]);

  return null;
}

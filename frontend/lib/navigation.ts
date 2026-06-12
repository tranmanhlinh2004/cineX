export const LOADING_ROUTE = "/loading";
export const LOADING_DURATION_MS = 1500;

const fallbackDestination = "/";

export function sanitizeInternalPath(
  target: string | null | undefined,
  fallback = fallbackDestination,
) {
  if (!target) {
    return fallback;
  }

  try {
    const origin = typeof window === "undefined" ? "https://cinex.local" : window.location.origin;
    const url = new URL(target, `${origin}/`);

    if (url.origin !== origin || url.pathname === LOADING_ROUTE) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function createLoadingPath(target: string | null | undefined) {
  const destination = sanitizeInternalPath(target);

  return `${LOADING_ROUTE}?to=${encodeURIComponent(destination)}`;
}

const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;

function getIframeSource(value: string) {
  const match = value.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);

  return match?.[2]?.trim() ?? value;
}

function getCandidateUrl(value: string) {
  const sourceValue = getIframeSource(value);

  if (sourceValue.startsWith("//")) {
    return `https:${sourceValue}`;
  }

  if (/^(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(sourceValue)) {
    return `https://${sourceValue}`;
  }

  return sourceValue;
}

function normalizeVideoId(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [videoId] = value.split(/[?&#/]/);

  return youtubeVideoIdPattern.test(videoId) ? videoId : null;
}

function getStartSeconds(searchParams: URLSearchParams) {
  const rawStart = searchParams.get("start") ?? searchParams.get("t");

  if (!rawStart) {
    return null;
  }

  if (/^\d+$/.test(rawStart)) {
    return rawStart;
  }

  const match = rawStart.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);

  if (!match) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? String(totalSeconds) : null;
}

function buildEmbedUrl(videoId: string, sourceUrl?: URL) {
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  const start = sourceUrl ? getStartSeconds(sourceUrl.searchParams) : null;

  if (start) {
    embedUrl.searchParams.set("start", start);
  }

  return embedUrl.toString();
}

function getYouTubeVideoIdFromUrl(parsedUrl: URL): string | null {
  const host = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    return normalizeVideoId(parsedUrl.pathname.split("/").filter(Boolean)[0]);
  }

  if (host !== "youtube.com" && !host.endsWith(".youtube.com")) {
    return null;
  }

  const watchId = normalizeVideoId(parsedUrl.searchParams.get("v"));

  if (watchId) {
    return watchId;
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  const videoPathTypes = new Set(["embed", "shorts", "live", "v", "e"]);
  const pathType = pathParts[0];

  if (pathType && videoPathTypes.has(pathType)) {
    return normalizeVideoId(pathParts[1]);
  }

  if (parsedUrl.pathname === "/attribution_link") {
    const nestedUrl = parsedUrl.searchParams.get("u");

    if (nestedUrl) {
      return getYouTubeVideoIdFromUrl(new URL(nestedUrl, "https://www.youtube.com"));
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string | null | undefined) {
  const value = url?.trim();

  if (!value) {
    return null;
  }

  const candidateUrl = getCandidateUrl(value);
  const directVideoId = normalizeVideoId(candidateUrl);

  if (directVideoId) {
    return buildEmbedUrl(directVideoId);
  }

  try {
    const parsedUrl = new URL(candidateUrl);
    const videoId = getYouTubeVideoIdFromUrl(parsedUrl);

    return videoId ? buildEmbedUrl(videoId, parsedUrl) : null;
  } catch {
    return null;
  }
}

export function normalizeYouTubeTrailerUrl(url: string) {
  const value = url.trim();

  if (!value) {
    return "";
  }

  const candidateUrl = getCandidateUrl(value);
  const directVideoId = normalizeVideoId(candidateUrl);

  if (directVideoId) {
    return `https://www.youtube.com/watch?v=${directVideoId}`;
  }

  return getYouTubeEmbedUrl(candidateUrl) ? candidateUrl : value;
}

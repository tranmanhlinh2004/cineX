"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LOADING_DURATION_MS, sanitizeInternalPath } from "@/lib/navigation";

export default function LoadingRedirectTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dotCount, setDotCount] = useState(3);

  const destination = sanitizeInternalPath(searchParams.get("to"));

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace(destination);
    }, LOADING_DURATION_MS);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [destination, router]);

  useEffect(() => {
    const dotTimer = window.setInterval(() => {
      setDotCount((current) => (current === 0 ? 3 : current - 1));
    }, 380);

    return () => {
      window.clearInterval(dotTimer);
    };
  }, []);

  return (
    <main className="cinex-loading-page flex min-h-screen items-center justify-center overflow-hidden px-6 text-white">
      <section className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <h1 className="select-none text-[clamp(4.6rem,12vw,5.25rem)] font-black leading-none tracking-normal">
          Cine<span className="text-[#ff1717]">X</span>
        </h1>

        <div className="mt-5 h-1 w-full max-w-[328px] overflow-hidden rounded-full bg-white/78">
          <div className="cinex-loading-progress h-full rounded-full bg-[#ff1717]" />
        </div>

        <p className="mt-4 text-base font-black">
          Loading
          <span className="relative inline-block w-[1.2em] text-left">
            <span className="absolute left-0">{Array.from({ length: dotCount }, () => ".").join("")}</span>
            <span className="invisible">...</span>
          </span>
        </p>
      </section>
    </main>
  );
}

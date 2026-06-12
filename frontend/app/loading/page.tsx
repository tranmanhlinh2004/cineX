import { Suspense } from "react";
import LoadingRedirectTemplate from "@/components/navigation/LoadingRedirectTemplate";

function LoadingFallback() {
  return (
    <main className="cinex-loading-page flex min-h-screen items-center justify-center overflow-hidden px-6 text-white">
      <section className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <h1 className="select-none text-[clamp(4.6rem,12vw,5.25rem)] font-black leading-none tracking-normal">
          Cine<span className="text-[#ff1717]">X</span>
        </h1>

        <div className="mt-5 h-1 w-full max-w-[328px] overflow-hidden rounded-full bg-white/78">
          <div className="cinex-loading-progress h-full rounded-full bg-[#ff1717]" />
        </div>

        <p className="mt-4 text-base font-black">Loading...</p>
      </section>
    </main>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoadingRedirectTemplate />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, Lock, Mail } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { login as loginRequest } from "@/lib/auth-api";
import { getAuthToken, getAuthUser, getRedirectPathForRole, saveAuthUser } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";
import { showToast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberAccount, setRememberAccount] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const user = token ? getAuthUser() : null;

    if (user) {
      router.replace(createLoadingPath(getRedirectPathForRole(user.role)));
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedIdentifier = identifier.trim();
    setIsSubmitting(true);

    try {
      const authResponse = await loginRequest({
        identifier: trimmedIdentifier,
        password,
      });

      saveAuthUser(authResponse.user, authResponse.token);

      if (!rememberAccount) {
        window.localStorage.removeItem("cinex_remember_account");
      } else {
        window.localStorage.setItem("cinex_remember_account", "true");
      }

      setPassword("");
      showToast("Đăng nhập thành công.", "success");
      router.push(
        createLoadingPath(authResponse.redirectTo ?? getRedirectPathForRole(authResponse.user.role)),
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#171717] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,#5b1517_0%,#241819_45%,#161616_100%)]">
        <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="relative w-full max-w-[430px] overflow-hidden rounded-[32px] border border-red-300/20 bg-[#351718]/70 px-5 py-10 shadow-2xl backdrop-blur-sm sm:max-w-[620px] sm:rounded-[46px] sm:px-10 sm:py-14 lg:max-w-[850px] lg:rounded-[70px] lg:px-8 lg:py-20">
            <div className="absolute bottom-[-80px] right-[-80px] h-[260px] w-[260px] rounded-full bg-red-700/40 blur-[70px] sm:h-[320px] sm:w-[320px] lg:h-[360px] lg:w-[360px]" />
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-white/5 via-transparent to-red-900/20" />

            <div className="relative mx-auto w-full max-w-[380px]">
              <h1 className="mb-8 text-center text-3xl font-black text-gray-300 sm:mb-10 sm:text-4xl lg:text-5xl">
                Đăng nhập
              </h1>

              <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-xs font-bold text-white sm:text-sm">
                    <span className="text-red-500">*</span>Email/Số điện thoại
                  </label>

                  <div className="flex h-11 items-center gap-3 rounded-xl bg-[#260d10] px-4 sm:h-12">
                    <Mail size={17} className="shrink-0 text-gray-500" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="Email/Số điện thoại"
                      required
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-white sm:text-sm">
                    <span className="text-red-500">*</span>Mật khẩu
                  </label>

                  <div className="flex h-11 items-center gap-3 rounded-xl bg-[#260d10] px-4 sm:h-12">
                    <Lock size={17} className="shrink-0 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mật khẩu"
                      required
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                    />
                    <EyeOff size={17} className="shrink-0 text-gray-500" />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-xs text-gray-400 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={rememberAccount}
                    onChange={(event) => setRememberAccount(event.target.checked)}
                    className="h-4 w-4 rounded border-none accent-red-600 sm:h-5 sm:w-5"
                  />
                  Ghi nhớ tài khoản
                </label>

                <p className="text-xs font-semibold text-gray-400 sm:text-sm">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-red-500 hover:underline">
                    Đăng ký
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mx-auto block h-11 w-full rounded-full bg-[#8e2020] text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-[260px]"
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

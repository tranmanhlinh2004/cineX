"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { register as registerRequest } from "@/lib/auth-api";
import { getRedirectPathForRole, saveAuthUser } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";
import { showToast } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const authResponse = await registerRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      saveAuthUser(authResponse.user, authResponse.token);
      showToast("Đăng ký thành công.", "success");
      router.push(
        createLoadingPath(authResponse.redirectTo ?? getRedirectPathForRole(authResponse.user.role)),
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#111111_0%,#251010_32%,#5a171a_58%,#171111_100%)] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,#5b1517_0%,#241819_45%,#111111_100%)]">
        <section className="px-4 py-14 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl rounded-[42px] border border-red-900/60 bg-[radial-gradient(circle_at_right,#8f1d1e_0%,#481819_42%,#231313_100%)] px-6 py-12 shadow-2xl sm:px-10 lg:px-20 lg:py-20">
            <h1 className="mb-10 text-4xl font-extrabold text-gray-300 sm:text-5xl">
              Tạo tài khoản
            </h1>

            <form
              className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <InputField
                label="Họ tên đầy đủ"
                placeholder="Nhập họ tên đầy đủ"
                icon={<User size={15} />}
                value={fullName}
                onChange={setFullName}
              />

              <InputField
                label="Email"
                placeholder="Nhập email"
                type="email"
                icon={<Mail size={15} />}
                value={email}
                onChange={setEmail}
              />

              <InputField
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                type="tel"
                icon={<Phone size={15} />}
                value={phone}
                onChange={setPhone}
                required={false}
              />

              <InputField
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                type="password"
                icon={<Lock size={15} />}
                value={password}
                onChange={setPassword}
                hasEye
              />

              <InputField
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                type="password"
                icon={<Lock size={15} />}
                value={confirmPassword}
                onChange={setConfirmPassword}
                hasEye
              />

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-xs rounded-xl bg-[#8f2424] py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                <p className="text-sm text-gray-400">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-red-500 hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon: React.ReactNode;
  hasEye?: boolean;
  required?: boolean;
};

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  hasEye = false,
  required = true,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white">
        {required && <span className="text-red-500">*</span>} {label}
      </label>

      <div className="flex items-center rounded-xl bg-[#300b12] px-3 py-3 shadow-inner">
        <span className="mr-2 text-gray-500">{icon}</span>

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
        />

        {hasEye && (
          <button type="button" className="ml-2 text-gray-500">
            <EyeOff size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { changePassword, getProfile, updateProfile } from "@/lib/auth-api";
import { getAuthToken, getAuthUser, saveAuthUser, type AuthUser } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";

const avatarMaxBytes = 10 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type ActivePanel = "profile" | "password";
type StatusMessage = {
  type: "success" | "error";
  text: string;
};

export default function AccountPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>("profile");
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [profileMessage, setProfileMessage] = useState<StatusMessage | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<StatusMessage | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const displayName = authUser?.fullName || authUser?.username || authUser?.email || "Tài khoản";

  const fillProfileForm = useCallback((user: AuthUser) => {
    setFullName(user.fullName ?? user.username ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setAvatarFileName("");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncAccount = () => {
      const localUser = getAuthUser();
      const token = getAuthToken();

      if (!localUser || !token) {
        setAuthReady(true);
        setIsLoadingProfile(false);
        router.replace(createLoadingPath("/login"));
        return;
      }

      setAuthUser(localUser);
      fillProfileForm(localUser);
      setAuthReady(true);

      getProfile()
        .then(({ user }) => {
          if (!isMounted) {
            return;
          }

          setAuthUser(user);
          fillProfileForm(user);
          saveAuthUser(user, token);
        })
        .catch((error) => {
          if (!isMounted) {
            return;
          }

          setProfileMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Không thể tải thông tin tài khoản.",
          });
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingProfile(false);
          }
        });
    };

    syncAccount();

    return () => {
      isMounted = false;
    };
  }, [fillProfileForm, router]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!allowedAvatarTypes.has(file.type)) {
      setProfileMessage({
        type: "error",
        text: "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WEBP.",
      });
      return;
    }

    if (file.size > avatarMaxBytes) {
      setProfileMessage({
        type: "error",
        text: "Dung lượng ảnh đại diện tối đa 10 MB.",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setProfileMessage({
          type: "error",
          text: "Không thể đọc ảnh đã chọn.",
        });
        return;
      }

      setAvatarUrl(reader.result);
      setAvatarFileName(file.name);
      setProfileMessage(null);
    };

    reader.onerror = () => {
      setProfileMessage({
        type: "error",
        text: "Không thể đọc ảnh đã chọn.",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName || !trimmedEmail) {
      setProfileMessage({
        type: "error",
        text: "Vui lòng nhập họ tên và email.",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const { user } = await updateProfile({
        fullName: trimmedFullName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        avatarUrl: avatarUrl || null,
      });
      const token = getAuthToken();

      setAuthUser(user);
      fillProfileForm(user);

      if (token) {
        saveAuthUser(user, token);
      }

      setProfileMessage({
        type: "success",
        text: "Hồ sơ đã được cập nhật.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật hồ sơ.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Mật khẩu mới cần tối thiểu 6 ký tự.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { message } = await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        type: "success",
        text: message,
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể đổi mật khẩu.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-10 text-white">
        <div className="mx-auto h-[520px] max-w-[1120px] animate-pulse rounded-lg border border-white/10 bg-[#151719]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0f12] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg border border-white/10 bg-[#151719] p-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <AvatarPreview
              avatarUrl={avatarUrl}
              displayName={displayName}
              className="h-14 w-14"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{displayName}</p>
              <p className="mt-1 truncate text-xs text-white/48">{authUser?.email}</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            <AccountNavButton
              active={activePanel === "profile"}
              icon={<User size={18} />}
              label="Hồ sơ"
              onClick={() => setActivePanel("profile")}
            />
            <AccountNavButton
              active={activePanel === "password"}
              icon={<Lock size={18} />}
              label="Đổi mật khẩu"
              onClick={() => setActivePanel("password")}
            />
          </nav>

          <Link
            href="/"
            className="mt-4 flex items-center justify-between rounded-md border border-white/10 px-3 py-3 text-sm font-semibold text-white/70 transition hover:border-red-500/70 hover:text-white"
          >
            <span>Quay lại trang chủ</span>
            <ChevronRight size={16} />
          </Link>
        </aside>

        <section className="rounded-lg border border-white/10 bg-[#151719] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">
                  {activePanel === "profile" ? "Hồ Sơ Của Tôi" : "Đổi Mật Khẩu"}
                </h1>
                <p className="mt-1 text-sm text-white/52">
                  {activePanel === "profile"
                    ? "Quản lý thông tin hồ sơ để bảo mật tài khoản"
                    : "Cập nhật mật khẩu đăng nhập CineX"}
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
                <ShieldCheck size={15} />
                <span>Tài khoản CineX</span>
              </div>
            </div>
          </div>

          {activePanel === "profile" ? (
            <form
              className="grid gap-7 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_260px]"
              onSubmit={handleSaveProfile}
            >
              <div className="space-y-5">
                {isLoadingProfile ? (
                  <div className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/58">
                    Đang tải hồ sơ...
                  </div>
                ) : null}

                <FormField label="Tên đăng nhập">
                  <div className="flex min-h-11 items-center rounded-md border border-white/10 bg-black/20 px-3 text-sm font-semibold text-white/55">
                    {authUser?.email ?? "Chưa cập nhật"}
                  </div>
                </FormField>

                <FormField label="Tên">
                  <div className="flex h-11 items-center rounded-md border border-white/10 bg-[#101214] px-3 transition focus-within:border-red-500/70">
                    <User size={17} className="mr-2 shrink-0 text-white/35" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                </FormField>

                <FormField label="Email">
                  <div className="flex h-11 items-center rounded-md border border-white/10 bg-[#101214] px-3 transition focus-within:border-red-500/70">
                    <Mail size={17} className="mr-2 shrink-0 text-white/35" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
                      placeholder="email@example.com"
                    />
                  </div>
                </FormField>

                <FormField label="Số điện thoại">
                  <div className="flex h-11 items-center rounded-md border border-white/10 bg-[#101214] px-3 transition focus-within:border-red-500/70">
                    <Phone size={17} className="mr-2 shrink-0 text-white/35" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
                      placeholder="Chưa cập nhật"
                    />
                  </div>
                </FormField>

                {profileMessage ? <StatusNotice message={profileMessage} /> : null}

                <div className="pt-1 sm:pl-[148px]">
                  <button
                    type="submit"
                    disabled={isSavingProfile || isLoadingProfile}
                    className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    <Save size={17} />
                    {isSavingProfile ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-7 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <div className="flex flex-col items-center text-center">
                  <AvatarPreview
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    className="h-32 w-32"
                  />

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-white/14 px-4 text-sm font-bold text-white transition hover:border-red-500/70 hover:text-red-100"
                  >
                    <Upload size={16} />
                    Chọn Ảnh
                  </button>

                  {avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setAvatarFileName("");
                        setProfileMessage(null);
                      }}
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-bold text-white/52 transition hover:bg-white/8 hover:text-white"
                    >
                      <X size={14} />
                      Xóa ảnh
                    </button>
                  ) : null}

                  <div className="mt-5 space-y-1 text-sm text-white/45">
                    <p>Dung lượng file tối đa 10 MB</p>
                    <p>Định dạng: JPEG, PNG, WEBP</p>
                  </div>

                  {avatarFileName ? (
                    <p className="mt-4 max-w-full truncate rounded-md bg-white/6 px-3 py-2 text-xs font-semibold text-white/62">
                      {avatarFileName}
                    </p>
                  ) : null}
                </div>
              </div>
            </form>
          ) : (
            <form className="max-w-[720px] px-5 py-6 sm:px-7" onSubmit={handleChangePassword}>
              <div className="space-y-5">
                <FormField label="Mật khẩu hiện tại">
                  <PasswordInput
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </FormField>

                <FormField label="Mật khẩu mới">
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Nhập mật khẩu mới"
                  />
                </FormField>

                <FormField label="Xác nhận mật khẩu">
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </FormField>

                {passwordMessage ? <StatusNotice message={passwordMessage} /> : null}

                <div className="pt-1 sm:pl-[148px]">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    <Lock size={17} />
                    {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}

function AvatarPreview({
  avatarUrl,
  displayName,
  className,
}: {
  avatarUrl: string;
  displayName: string;
  className: string;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white text-gray-400 ${className}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        <User size={44} fill="currentColor" strokeWidth={0} />
      )}
      <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-red-600 text-white">
        <Camera size={15} />
      </span>
    </div>
  );
}

function AccountNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-bold transition ${
        active
          ? "bg-red-600 text-white"
          : "text-white/68 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className={active ? "text-white" : "text-red-400"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[132px_1fr] sm:items-center">
      <label className="text-sm font-semibold text-white/54 sm:text-right">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex h-11 items-center rounded-md border border-white/10 bg-[#101214] px-3 transition focus-within:border-red-500/70">
      <Lock size={17} className="mr-2 shrink-0 text-white/35" />
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
        placeholder={placeholder}
      />
    </div>
  );
}

function StatusNotice({ message }: { message: StatusMessage }) {
  const isSuccess = message.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-semibold ${
        isSuccess
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
          : "border-red-400/30 bg-red-500/10 text-red-100"
      }`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{message.text}</span>
    </div>
  );
}

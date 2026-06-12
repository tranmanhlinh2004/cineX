import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#242020] px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1350px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="text-4xl font-black italic tracking-tight sm:text-5xl lg:text-6xl"
          >
            Cine<span className="text-red-600">X</span>
          </Link>

          <p className="mt-5 text-base font-bold text-gray-200 sm:mt-7 sm:text-xl">
            Trải nghiệm <span className="text-red-500">điện ảnh</span> đỉnh cao
          </p>

          <p className="mt-3 max-w-[360px] text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
            Hệ thống đặt vé xem phim hiện đại, nhanh chóng & tiện lợi
          </p>

          <div className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-5">
            <SocialIcon>
              <FaFacebookF size={20} />
            </SocialIcon>

            <SocialIcon>
              <FaInstagram size={22} />
            </SocialIcon>

            <SocialIcon>
              <FaYoutube size={24} />
            </SocialIcon>

            <SocialIcon>
              <Headphones size={22} />
            </SocialIcon>
          </div>
        </div>

        <FooterColumn
          title="PHIM VÀ RẠP"
          items={[
            { label: "Giới thiệu CineX", href: "/about" },
            { label: "Phim đang chiếu", href: "/now-showing" },
            { label: "Phim sắp chiếu", href: "/coming-soon" },
            { label: "Lịch chiếu & rạp bán", href: "/showtimes" },
            { label: "Phim hot", href: "/movies/hot" },
            { label: "Khuyến mãi", href: "/promotions" },
            { label: "Thể loại", href: "/genres" },
          ]}
        />

        <FooterColumn
          title="HỖ TRỢ"
          items={[
            { label: "Hướng dẫn đặt vé", href: "/support/booking-guide" },
            { label: "Chính sách đổi vé", href: "/support/ticket-policy" },
            { label: "Điều khoản sử dụng", href: "/terms" },
            { label: "Chính sách bảo mật", href: "/privacy" },
            { label: "Câu hỏi thường gặp", href: "/faq" },
            { label: "Liên hệ hỗ trợ", href: "/contact" },
          ]}
        />

        <div className="space-y-8">
          <div>
            <h3 className="border-l-4 border-red-600 pl-4 text-sm font-black uppercase sm:text-base">
              THÔNG TIN LIÊN HỆ
            </h3>

            <div className="mt-5 space-y-4">
              <ContactItem icon={<MapPin size={18} />} label="Địa chỉ">
                182 Lê Duẩn, Phường Trường Vinh, Nghệ An
              </ContactItem>

              <ContactItem icon={<Phone size={18} />} label="Hotline">
                0868066018
              </ContactItem>

              <ContactItem icon={<Mail size={18} />} label="Email">
                tranmanhlinh204gmail.com
              </ContactItem>

              <ContactItem icon={<Clock size={18} />} label="Giờ làm việc">
                08:00 - 00:00 hằng ngày
              </ContactItem>
            </div>
          </div>

          <div>
            <h3 className="border-l-4 border-red-600 pl-4 text-sm font-black uppercase sm:text-base">
              Đăng ký nhận ưu đãi
            </h3>

            <p className="mt-5 text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
              Nhận vé xem phim & mã giảm giá mới nhất!
            </p>

            <div className="mt-5 flex h-11 max-w-full items-center overflow-hidden rounded-xl bg-[#343030] sm:h-12 lg:max-w-[360px]">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="h-full flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-gray-500 sm:px-5"
              />
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-md bg-red-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-red-700 sm:w-auto"
            >
              Nhận ưu đãi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
};

function FooterColumn({ title, items }: FooterColumnProps) {
  return (
    <div>
      <h3 className="border-l-4 border-red-600 pl-4 text-sm font-black uppercase sm:text-base">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-red-500 sm:text-base"
            >
              <ChevronRight size={16} className="shrink-0 text-red-500" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex gap-3 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-red-500">
        {icon}
      </span>

      <p>
        <span className="block text-xs font-bold uppercase text-gray-500 sm:text-sm">
          {label}
        </span>
        {children}
      </p>
    </div>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="#"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 sm:h-12 sm:w-12"
    >
      {children}
    </Link>
  );
}

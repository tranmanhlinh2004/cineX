import { CalendarClock, CheckCircle2, Film, Ticket } from "lucide-react";
import AdminModulePage from "@/components/admin/AdminModulePage";

const genreRows = [
  {
    id: "hanh-dong",
    name: "Hành động",
    slug: "hanh-dong",
    movieCount: "18",
    displayArea: "Trang chủ, danh mục phim",
    status: "Đang hoạt động",
  },
  {
    id: "hoat-hinh",
    name: "Hoạt hình",
    slug: "hoat-hinh",
    movieCount: "12",
    displayArea: "Phim gia đình",
    status: "Đang hoạt động",
  },
  {
    id: "kinh-di",
    name: "Kinh dị",
    slug: "kinh-di",
    movieCount: "9",
    displayArea: "Danh mục phim",
    status: "Đang hoạt động",
  },
  {
    id: "tam-ly-gia-dinh",
    name: "Tâm lý gia đình",
    slug: "tam-ly-gia-dinh",
    movieCount: "7",
    displayArea: "Trang thể loại",
    status: "Chờ rà soát",
  },
];

export default function AdminMovieGenresPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.3"
      title="Quản lý thể loại phim"
      description="Tạo, chỉnh sửa và theo dõi các thể loại phim dùng cho danh mục phim, bộ lọc và trang hiển thị công khai."
      primaryAction="Thêm thể loại"
      searchPlaceholder="Tìm thể loại theo tên, slug, khu vực hiển thị..."
      stats={[
        {
          label: "Tổng thể loại",
          value: "16",
          helper: "Đang có trong hệ thống",
          icon: Film,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Đang hiển thị",
          value: "13",
          helper: "Có trên website",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Phim đã gán",
          value: "68",
          helper: "Có ít nhất một thể loại",
          icon: Ticket,
          tone: "bg-amber-50 text-amber-700",
        },
        {
          label: "Cần rà soát",
          value: "3",
          helper: "Tên hoặc slug cần kiểm tra",
          icon: CalendarClock,
          tone: "bg-blue-50 text-blue-700",
        },
      ]}
      filters={[
        {
          label: "Tất cả trạng thái",
          options: ["Đang hoạt động", "Chờ rà soát", "Tạm ẩn"],
        },
        {
          label: "Khu vực hiển thị",
          options: ["Trang chủ", "Danh mục phim", "Trang thể loại"],
        },
      ]}
      tableTitle="Danh sách thể loại phim"
      tableDescription="Các thể loại đang được dùng để phân nhóm phim và hỗ trợ bộ lọc trên website."
      columns={[
        { key: "name", label: "Thể loại" },
        { key: "slug", label: "Slug" },
        { key: "movieCount", label: "Số phim" },
        { key: "displayArea", label: "Khu vực hiển thị" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={genreRows}
      sideTitle="Nhóm hiển thị"
      sideItems={[]}
      checklistTitle="Kiểm tra thể loại"
      checklist={[]}
    />
  );
}

import AdminModulePage from "@/components/admin/AdminModulePage";
import { CheckCircle2, CircleDollarSign, CreditCard, Ticket } from "lucide-react";

export default function AdminBookingsPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.7"
      title="Quản lý đặt vé và thanh toán"
      description="Khung quản lý đơn đặt vé, trạng thái thanh toán, kênh thanh toán và đối soát giao dịch."
      primaryAction="Tạo đơn đặt vé"
      searchPlaceholder="Tìm mã đơn, khách hàng, số điện thoại..."
      stats={[
        {
          label: "Đơn đặt vé",
          value: "1.248",
          helper: "Trong tháng hiện tại",
          icon: Ticket,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Đã thanh toán",
          value: "1.196",
          helper: "95,8% đơn hoàn tất",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Doanh thu",
          value: "184,2 tr",
          helper: "Theo giao dịch thành công",
          icon: CircleDollarSign,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Chờ đối soát",
          value: "24",
          helper: "Từ ví điện tử và thẻ",
          icon: CreditCard,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả kênh thanh toán", options: ["Ví điện tử", "Thẻ ngân hàng", "Quầy vé", "Chuyển khoản"] },
        { label: "Tất cả trạng thái", options: ["Đã thanh toán", "Chờ thanh toán", "Chờ đối soát", "Đã hủy"] },
      ]}
      tableTitle="Danh sách đơn đặt vé"
      tableDescription="Khung danh sách đơn đặt vé và thanh toán trước khi tích hợp dữ liệu thật."
      columns={[
        { key: "code", label: "Mã đơn" },
        { key: "customer", label: "Khách hàng" },
        { key: "movie", label: "Phim" },
        { key: "channel", label: "Kênh thanh toán" },
        { key: "amount", label: "Giá trị" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          code: "CX240613-1024",
          customer: "Nguyễn Hoàng Minh",
          movie: "Dune: Part Two",
          channel: "Ví điện tử",
          amount: "420.000đ",
          status: "Đã thanh toán",
        },
        {
          code: "CX240613-1021",
          customer: "Trần Bảo Ngọc",
          movie: "Inside Out 2",
          channel: "Thẻ ngân hàng",
          amount: "310.000đ",
          status: "Đã thanh toán",
        },
        {
          code: "CX240613-1018",
          customer: "Lê Đức Anh",
          movie: "Deadpool & Wolverine",
          channel: "Quầy vé",
          amount: "180.000đ",
          status: "Chờ đối soát",
        },
        {
          code: "CX240613-1012",
          customer: "Phạm Thu Hà",
          movie: "A Quiet Place: Day One",
          channel: "Ví điện tử",
          amount: "260.000đ",
          status: "Đã hủy",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Theo dõi đơn đặt vé theo khách hàng, phim và suất chiếu.",
        "Quản lý trạng thái thanh toán và hoàn tiền.",
        "Đối soát giao dịch theo kênh thanh toán.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Nối API đơn đặt vé",
        "Thêm màn chi tiết thanh toán",
        "Thêm thao tác hoàn tiền",
        "Thêm bộ lọc theo ngày giao dịch",
      ]}
    />
  );
}

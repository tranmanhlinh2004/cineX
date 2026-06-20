import { prisma } from "./client";

const permissions = [
  { name: "site.access", description: "Truy cập website người dùng" },
  { name: "admin.access", description: "Truy cập website quản trị" },
  { name: "account.manage", description: "Quản lý thông tin tài khoản cá nhân" },
  { name: "movie.view", description: "Xem danh sách phim" },
  { name: "movie.create", description: "Thêm phim" },
  { name: "movie.update", description: "Cập nhật phim" },
  { name: "movie.delete", description: "Xóa phim" },
  { name: "genre.view", description: "Xem thể loại phim" },
  { name: "genre.create", description: "Thêm thể loại phim" },
  { name: "genre.manage", description: "Quản lý thể loại phim" },
  { name: "cinema.view", description: "Xem danh sách rạp" },
  { name: "cinema.create", description: "Thêm rạp" },
  { name: "cinema.update", description: "Cập nhật rạp" },
  { name: "room.manage", description: "Quản lý phòng chiếu và ghế" },
  { name: "showtime.view", description: "Xem lịch chiếu" },
  { name: "showtime.manage", description: "Quản lý lịch chiếu" },
  { name: "showtime.schedule.create", description: "Thêm lịch chiếu phim" },
  { name: "showtime.session.create", description: "Thêm suất chiếu phim" },
  { name: "booking.view", description: "Xem đơn đặt vé" },
  { name: "booking.manage", description: "Quản lý đặt vé" },
  { name: "booking.create", description: "Tạo đơn hàng" },
  { name: "booking.cancel", description: "Hủy đơn hàng" },
  { name: "booking.pay", description: "Thanh toán đơn hàng" },
  { name: "booking.refund", description: "Hoàn tiền đơn hàng" },
  { name: "booking.refund.request", description: "Gửi yêu cầu hoàn tiền của khách hàng" },
  { name: "refund.manage", description: "Xử lý yêu cầu hoàn tiền" },
  { name: "payment.view", description: "Xem lịch sử giao dịch thanh toán" },
  { name: "invoice.export", description: "Xuất hóa đơn" },
  { name: "promotion.manage", description: "Quản lý khuyến mãi" },
  { name: "banner.manage", description: "Quản lý banner" },
  { name: "news.manage", description: "Quản lý tin tức" },
  { name: "review.create", description: "Gửi bình luận và đánh giá phim" },
  { name: "review.manage", description: "Quản lý đánh giá" },
  { name: "review.reply", description: "Trả lời bình luận và đánh giá của khách hàng" },
  { name: "support.message.view", description: "Xem tin nhắn liên hệ của khách hàng" },
  { name: "support.message.reply", description: "Trả lời tin nhắn liên hệ của khách hàng" },
  { name: "notification.view", description: "Xem thông báo tài khoản" },
  { name: "user.view", description: "Xem người dùng" },
  { name: "user.manage", description: "Quản lý người dùng" },
  { name: "role.manage", description: "Quản lý vai trò và quyền" },
  { name: "report.view", description: "Xem báo cáo thống kê" },
  { name: "report.revenue.view", description: "Thống kê doanh thu" },
  { name: "report.revenue.export", description: "Xuất báo cáo doanh thu" },
  { name: "audit.view", description: "Xem nhật ký hệ thống" },
];

export async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log(`Seed permissions thanh cong (${permissions.length} quyen)`);
}

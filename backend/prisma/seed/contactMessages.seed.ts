import { prisma } from "./client";

const ContactMessageStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  REPLIED: "REPLIED",
  NEED_FOLLOW_UP: "NEED_FOLLOW_UP",
} as const;

type ContactMessageRecord = {
  id: number;
};

type ContactMessageDelegate = {
  upsert: <T>(args: unknown) => Promise<T>;
};

type ContactMessageReplyDelegate = {
  count: (args: unknown) => Promise<number>;
  create: <T>(args: unknown) => Promise<T>;
};

function getContactMessageDelegate(client: unknown = prisma) {
  return (client as { contactMessage: ContactMessageDelegate }).contactMessage;
}

function getContactMessageReplyDelegate(client: unknown = prisma) {
  return (client as { contactMessageReply: ContactMessageReplyDelegate })
    .contactMessageReply;
}

const contactMessagePlans = [
  {
    code: "MSG-20260620-001",
    email: "minhanh@example.com",
    customerName: "Nguyễn Hoàng Minh",
    phone: "0906770123",
    subject: "Không nhận được vé điện tử",
    content:
      "Tôi đã thanh toán đơn vé nhưng email xác nhận chưa hiện trong hộp thư. Nhờ CineX kiểm tra và gửi lại vé giúp tôi.",
    channel: "Website",
    status: ContactMessageStatus.PENDING,
    createdAt: new Date("2026-06-20T09:24:00+07:00"),
  },
  {
    code: "MSG-20260620-002",
    email: "hoangnam@example.com",
    customerName: "Trần Bảo Ngọc",
    phone: "0906990123",
    subject: "Đổi suất chiếu sau khi thanh toán",
    content:
      "Gia đình tôi muốn đổi sang suất chiếu tối hơn. Đơn hàng đã thanh toán, mong nhân viên tư vấn cách xử lý.",
    channel: "Zalo",
    status: ContactMessageStatus.PENDING,
    createdAt: new Date("2026-06-20T08:58:00+07:00"),
  },
  {
    code: "MSG-20260619-003",
    email: "giabao@example.com",
    customerName: "Lê Đức Anh",
    phone: "0912003344",
    subject: "Hỏi chính sách hoàn tiền",
    content:
      "Nếu tôi hủy vé trước giờ chiếu 90 phút thì có được hoàn tiền không? Nhờ CineX phản hồi giúp.",
    channel: "Email",
    status: ContactMessageStatus.REPLIED,
    adminReply:
      "CineX đã nhận thông tin và sẽ hỗ trợ bạn theo chính sách hoàn tiền hiện hành. Bạn vui lòng theo dõi email hoặc lịch sử đặt vé.",
    repliedAt: new Date("2026-06-19T22:05:00+07:00"),
    createdAt: new Date("2026-06-19T21:12:00+07:00"),
  },
  {
    code: "MSG-20260619-004",
    email: "thuha@example.com",
    customerName: "Phạm Thu Hà",
    phone: "0908990125",
    subject: "Thanh toán thành công nhưng đơn bị hủy",
    content:
      "Tài khoản ngân hàng đã trừ tiền nhưng lịch sử đặt vé báo đơn đã hủy. Vui lòng kiểm tra giao dịch và hỗ trợ hoàn tiền nếu cần.",
    channel: "Hotline",
    status: ContactMessageStatus.PENDING,
    createdAt: new Date("2026-06-19T18:35:00+07:00"),
  },
] as const;

export async function seedContactMessages() {
  let seededMessages = 0;

  for (const plan of contactMessagePlans) {
    const user = await prisma.user.findUnique({
      where: { email: plan.email },
    });

    const contactMessage = await getContactMessageDelegate().upsert<ContactMessageRecord>({
      where: {
        code: plan.code,
      },
      update: {
        userId: user?.id ?? null,
        customerName: plan.customerName,
        email: plan.email,
        phone: plan.phone,
        subject: plan.subject,
        content: plan.content,
        channel: plan.channel,
        status: plan.status,
        repliedAt: "repliedAt" in plan ? plan.repliedAt : null,
        createdAt: plan.createdAt,
      },
      create: {
        code: plan.code,
        userId: user?.id ?? null,
        customerName: plan.customerName,
        email: plan.email,
        phone: plan.phone,
        subject: plan.subject,
        content: plan.content,
        channel: plan.channel,
        status: plan.status,
        repliedAt: "repliedAt" in plan ? plan.repliedAt : null,
        createdAt: plan.createdAt,
      },
    });

    if ("adminReply" in plan) {
      const existingReplyCount = await getContactMessageReplyDelegate().count({
        where: {
          contactMessageId: contactMessage.id,
        },
      });

      if (existingReplyCount === 0) {
        await getContactMessageReplyDelegate().create<ContactMessageRecord>({
          data: {
            contactMessageId: contactMessage.id,
            content: plan.adminReply,
            createdAt: plan.repliedAt,
          },
        });
      }
    }

    seededMessages += 1;
  }

  console.log(`Seed contact messages thanh cong (${seededMessages} tin nhan)`);
}

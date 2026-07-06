import { prisma } from "@/app/lib/prisma";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "info",
      link: input.link,
    },
  });
}

export async function createNotificationForRole(
  role: string,
  input: Omit<CreateNotificationInput, "userId">
) {
  const users = await prisma.user.findMany({
    where: { role, status: "active" },
    select: { id: true },
  });

  return Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title: input.title,
          message: input.message,
          type: input.type || "info",
          link: input.link,
        },
      })
    )
  );
}

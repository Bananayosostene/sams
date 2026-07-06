import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { errorResponse, successResponse } from "@/app/lib/api-response";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return successResponse({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await req.json();

  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } else if (body.id) {
    await prisma.notification.update({
      where: { id: body.id },
      data: { read: true },
    });
  }

  return successResponse({ success: true });
}

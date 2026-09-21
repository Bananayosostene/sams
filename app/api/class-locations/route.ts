import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return errorResponse("courseId is required");

    const locations = await prisma.classLocation.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(locations);
  } catch {
    return errorResponse("Failed to fetch class locations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { courseId, latitude, longitude, label } = await req.json();
    if (!courseId || typeof latitude !== "number" || typeof longitude !== "number") {
      return errorResponse("courseId, latitude, and longitude are required");
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse("Course not found", 404);

    if (user.role !== "admin" && !course.lecturerIds.includes(user.id)) {
      return forbiddenResponse("You are not assigned to this course");
    }

    const location = await prisma.classLocation.create({
      data: {
        courseId,
        latitude,
        longitude,
        label: label || undefined,
      },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { latitude, longitude },
    });

    return successResponse(location, "Class location saved successfully", 201);
  } catch {
    return errorResponse("Failed to save class location", 500);
  }
}
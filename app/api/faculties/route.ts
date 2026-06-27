import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        _count: { select: { courses: true, students: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(faculties);
  } catch {
    return errorResponse("Failed to fetch faculties", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();

    const { name, code } = await req.json();
    if (!name || !code) return errorResponse("Name and code are required");

    const existing = await prisma.faculty.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return errorResponse("Faculty code already exists", 409);

    const faculty = await prisma.faculty.create({
      data: { name, code: code.toUpperCase() },
    });
    return successResponse(faculty, "Faculty created successfully", 201);
  } catch {
    return errorResponse("Failed to create faculty", 500);
  }
}

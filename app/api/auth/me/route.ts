import { getAuthUser } from "@/app/lib/auth";
import { successResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      registrationNumber: user.registrationNumber,
      facultyId: user.facultyId,
      assignedCourses: user.assignedCourses,
    });
  } catch {
    return unauthorizedResponse();
  }
}

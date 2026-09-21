import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/app/lib/api-response";
import { createNotification } from "@/app/lib/notification";
import { distanceMeters, CLASS_RADIUS_METERS } from "@/app/lib/geo";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "student") return forbiddenResponse();

    const { token, status, latitude, longitude } = await req.json();
    if (!token) return errorResponse("Session token is required");
    if (!status || !["present", "absent"].includes(status)) {
      return errorResponse("Status must be 'present' or 'absent'");
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return errorResponse("Your location is required to submit attendance");
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: { course: true },
    });
    if (!session) return notFoundResponse("Attendance session not found");
    if (session.status !== "active") return errorResponse("This attendance session is closed");

    if (user.facultyId !== session.course.facultyId && !user.assignedCourses.includes(session.course.id)) {
      return forbiddenResponse("You are not enrolled in this course");
    }

    const activeSemester = await prisma.semester.findFirst({ where: { status: "Active" } });
    if (!activeSemester) return errorResponse("No active semester found");

    const existing = await prisma.attendance.findFirst({
      where: { studentId: user.id, courseId: session.courseId, date: session.date, semesterId: activeSemester.id },
    });
    if (existing) {
      return errorResponse(`You have already submitted your attendance on ${session.date} (marked as "${existing.status}")`);
    }

    const classLat = session.course.latitude;
    const classLng = session.course.longitude;

    let finalStatus: string;
    let verified = false;
    let distance: number | null = null;

    if (classLat == null || classLng == null) {
      finalStatus = "absent";
    } else {
      distance = distanceMeters(latitude, longitude, classLat, classLng);
      verified = distance <= CLASS_RADIUS_METERS;
      finalStatus = status === "present" && verified ? "present" : "absent";
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: user.id,
        courseId: session.courseId,
        date: session.date,
        status: finalStatus,
        source: "student",
        latitude,
        longitude,
        recordedById: session.lecturerId,
        semesterId: activeSemester.id,
      },
    });

    createNotification({
      userId: user.id,
      title: "Attendance Recorded",
      message:
        finalStatus === "present"
          ? `You were marked as "present" for ${session.course.name} on ${session.date}. Your location was verified.`
          : `You were marked as "absent" for ${session.course.name} on ${session.date}${verified === false && distance != null ? " because you were outside the class location" : ""}.`,
      type: finalStatus === "present" ? "success" : "warning",
      link: "/student/attendance",
    }).catch(() => {});

    return successResponse(
      {
        attendanceId: attendance.id,
        status: finalStatus,
        verified,
        distance,
        radiusMeters: CLASS_RADIUS_METERS,
        message:
          finalStatus === "present"
            ? "You are inside the class location. Attendance marked as present."
            : distance != null
              ? "You were outside the class location, so your attendance was recorded as absent."
              : "No verified class location is set for this session, so your attendance was recorded as absent.",
      },
      "Attendance submitted successfully",
      201
    );
  } catch {
    return errorResponse("Failed to submit attendance", 500);
  }
}
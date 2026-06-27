import Header from "../../components/Header";
import Link from "next/link";
import { getAuthUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default async function LecturerCoursesPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "lecturer") {
    return <div className="flex flex-col h-full"><Header title="My Courses" /><main className="flex-1 p-8"><p>Unauthorized</p></main></div>;
  }

  const courses = await prisma.course.findMany({
    where: { lecturerIds: { has: user.id } },
    include: {
      faculty: { select: { code: true } },
      semester: { select: { name: true, academicYear: true } },
    },
  });

  const courseIds = courses.map((c) => c.id);
  const attendanceRecords = await prisma.attendance.findMany({
    where: { courseId: { in: courseIds } },
  });

  const totalStudents = await prisma.user.count({
    where: { facultyId: user.facultyId || undefined, role: "student" },
  });

  const courseData = courses.map((c) => {
    const ca = attendanceRecords.filter((a) => a.courseId === c.id);
    const present = ca.filter((a) => a.status === "present").length;
    const avg = ca.length > 0 ? Math.round((present / ca.length) * 100) : 0;
    return { id: c.id, code: c.code, name: c.name, credits: c.credits, students: totalStudents, attendance: avg, semester: c.semester };
  });

  if (courseData.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="My Courses" subtitle="Courses assigned to you this semester" />
        <main className="flex-1 p-8">
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No courses assigned yet</p>
            <p className="text-gray-400 text-sm mt-2">Contact your admin to get courses assigned.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="My Courses" subtitle="Courses assigned to you this semester" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseData.map((c) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">{c.code}</span>
                  <h3 className="text-base font-bold text-blue-900 mt-2">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.semester ? `${c.semester.name} ${c.semester.academicYear}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">{c.attendance}%</p>
                  <p className="text-xs text-gray-500">attendance rate</p>
                </div>
              </div>
              <div className="h-2 bg-blue-50 rounded-full mb-4">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.attendance}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="text-lg font-bold text-blue-800">{c.students}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Credits</p>
                  <p className="text-lg font-bold text-blue-800">{c.credits}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/lecturer/attendance" className="btn-primary flex-1 text-center text-xs">Record Attendance</Link>
                <Link href="/lecturer/students" className="btn-secondary flex-1 text-center text-xs">View Students</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

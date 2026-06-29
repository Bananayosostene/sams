import Header from "../components/Header";
import Link from "next/link";
import { getAuthUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { BookOpen, GraduationCap, ClipboardList, BarChart2, CheckCircle } from "../components/icons";

export default async function LecturerDashboard() {
  const user = await getAuthUser();

  if (!user || user.role !== "lecturer") {
    return <div className="flex flex-col h-full"><Header title="Lecturer Dashboard" /><main className="flex-1 p-8"><p>Unauthorized</p></main></div>;
  }

  const courses = await prisma.course.findMany({
    where: { lecturerIds: { has: user.id } },
    include: {
      faculty: { select: { code: true } },
      semester: { select: { name: true, academicYear: true } },
    },
  });

  const courseIds = courses.map((c) => c.id);

  const totalStudents = await prisma.user.count({
    where: { facultyId: user.facultyId || undefined, role: "student" },
  });

  const sessionsThisMonth = await prisma.attendance.count({
    where: { recordedById: user.id },
  });

  const attendanceRecords = await prisma.attendance.findMany({
    where: { courseId: { in: courseIds } },
  });

  const courseData = courses.map((c) => {
    const ca = attendanceRecords.filter((a) => a.courseId === c.id);
    const present = ca.filter((a) => a.status === "present").length;
    const avg = ca.length > 0 ? Math.round((present / ca.length) * 100) : 0;
    return { code: c.code, name: c.name, students: totalStudents, attendance: avg, semester: c.semester };
  });

  const avgAttendance = courseData.length > 0
    ? Math.round(courseData.reduce((a, c) => a + c.attendance, 0) / courseData.length)
    : 0;

  const stats = [
    { label: "My Courses", value: String(courses.length), icon: <BookOpen className="w-6 h-6 text-white" />, color: "bg-blue-600" },
    { label: "Total Students", value: String(totalStudents), icon: <GraduationCap className="w-6 h-6 text-white" />, color: "bg-indigo-600" },
    { label: "Sessions This Month", value: String(sessionsThisMonth), icon: <ClipboardList className="w-6 h-6 text-white" />, color: "bg-blue-500" },
    { label: "Avg. Attendance", value: `${avgAttendance}%`, icon: <BarChart2 className="w-6 h-6 text-white" />, color: "bg-blue-700" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Lecturer Dashboard" subtitle="Manage your courses and attendance records" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-black text-blue-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-blue-900">My Courses</h2>
              <Link href="/lecturer/attendance" className="btn-primary text-xs">Record Attendance</Link>
            </div>
            <div className="space-y-4">
              {courseData.map((c) => (
                <div key={c.code} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">{c.code}</span>
                        <span className="text-xs text-blue-500">{c.students} students</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-blue-700">{c.attendance}%</p>
                      <p className="text-xs text-gray-500">avg attendance</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.attendance}%` }}></div>
                  </div>
                </div>
              ))}
              {courseData.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No courses assigned yet</p>}
            </div>
          </div>
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/lecturer/attendance" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                <CheckCircle className="w-5 h-5" /> Record Attendance
              </Link>
              <Link href="/lecturer/students" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                <GraduationCap className="w-5 h-5" /> View Students
              </Link>
              <Link href="/lecturer/history" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                <ClipboardList className="w-5 h-5" /> Attendance History
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import Header from "../components/Header";
import Link from "next/link";
import { getAuthUser } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { BarChart2, BookOpen, CheckCircle, XCircle, ClipboardList, MessageSquare, AlertTriangle } from "../components/icons";

export default async function StudentDashboard() {
  const user = await getAuthUser();

  if (!user || user.role !== "student") {
    return <div className="flex flex-col h-full"><Header title="Student Dashboard" /><main className="flex-1 p-8"><p>Unauthorized</p></main></div>;
  }

  const courses = await prisma.course.findMany({
    where: { facultyId: user.facultyId || undefined },
    select: { id: true, name: true, code: true },
  });

  const courseIds = courses.map((c) => c.id);

  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: user.id, courseId: { in: courseIds } },
    select: { courseId: true, status: true },
  });

  const courseAttendance = courses.map((c) => {
    const records = attendanceRecords.filter((a) => a.courseId === c.id);
    const total = records.length;
    const attended = records.filter((r) => r.status !== "absent").length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { code: c.code, name: c.name, attended, total, percentage };
  });

  const totalAttended = courseAttendance.reduce((a, c) => a + c.attended, 0);
  const totalClasses = courseAttendance.reduce((a, c) => a + c.total, 0);
  const missed = totalClasses - totalAttended;
  const overallPercentage = courseAttendance.length > 0
    ? Math.round(courseAttendance.reduce((a, c) => a + c.percentage, 0) / courseAttendance.length)
    : 0;

  const stats = [
    { label: "Overall Attendance", value: `${overallPercentage}%`, icon: <BarChart2 className="w-6 h-6 text-white" />, color: "bg-blue-600" },
    { label: "Courses Enrolled", value: String(courses.length), icon: <BookOpen className="w-6 h-6 text-white" />, color: "bg-indigo-600" },
    { label: "Classes Attended", value: String(totalAttended), icon: <CheckCircle className="w-6 h-6 text-white" />, color: "bg-blue-500" },
    { label: "Classes Missed", value: String(missed), icon: <XCircle className="w-6 h-6 text-white" />, color: "bg-blue-700" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Student Dashboard" subtitle="Your attendance overview" />
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
              <h2 className="text-base font-bold text-blue-900">Attendance by Course</h2>
              <Link href="/student/attendance" className="text-xs text-blue-600 hover:underline font-medium">View Details →</Link>
            </div>
            <div className="space-y-4">
              {courseAttendance.map((c) => (
                <div key={c.code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{c.code}</span>
                      <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{c.attended}/{c.total}</span>
                      <span className={`text-sm font-bold ${c.percentage >= 85 ? "text-green-600" : c.percentage >= 70 ? "text-yellow-600" : "text-red-600"}`}>{c.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.percentage >= 85 ? "bg-green-500" : c.percentage >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${c.percentage}%` }}></div>
                  </div>
                </div>
              ))}
              {courseAttendance.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No attendance data yet</p>}
            </div>
          </div>
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-base font-bold text-blue-900 mb-3">Status Alerts</h2>
              {courseAttendance.filter((c) => c.percentage < 85).map((c) => (
                <div key={c.code} className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${c.percentage < 75 ? "bg-red-50 border border-red-100" : "bg-yellow-50 border border-yellow-100"}`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${c.percentage < 75 ? "text-red-500" : "text-yellow-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.code} – Low Attendance</p>
                    <p className="text-xs text-gray-500">{c.percentage}% – minimum 75% required</p>
                  </div>
                </div>
              ))}
              {courseAttendance.every((c) => c.percentage >= 85) && courseAttendance.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-medium">All courses are in good standing!</p>
                </div>
              )}
            </div>
            <div className="card">
              <h2 className="text-base font-bold text-blue-900 mb-3">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/student/attendance" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                  <ClipboardList className="w-5 h-5" /> View Full Attendance
                </Link>
                <Link href="/student/feedback" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                  <MessageSquare className="w-5 h-5" /> Submit Feedback
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

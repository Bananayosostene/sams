import Header from "../../components/Header";
import { getAuthUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface AttendanceData {
  course: string;
  name: string;
  percentage: number;
  attended: number;
  total: number;
  records: { date: string; status: string }[];
}

async function getAttendance(): Promise<AttendanceData[]> {
  const user = await getAuthUser();
  if (!user || user.role !== "student") return [];

  const courses = await prisma.course.findMany({
    where: { facultyId: user.facultyId || undefined },
    select: { id: true, name: true, code: true },
  });

  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);

  const records = await prisma.attendance.findMany({
    where: { studentId: user.id, courseId: { in: courseIds } },
    select: { date: true, status: true, courseId: true },
    orderBy: { date: "desc" },
  });

  return courses.map((c) => {
    const courseRecords = records.filter((r) => r.courseId === c.id);
    const total = courseRecords.length;
    const attended = courseRecords.filter((r) => r.status !== "absent").length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    return {
      course: c.code,
      name: c.name,
      percentage,
      attended,
      total,
      records: courseRecords.map((r) => ({ date: r.date, status: r.status })),
    };
  });
}

export default async function StudentAttendancePage() {
  const attendanceData = await getAttendance();

  return (
    <div className="flex flex-col h-full">
      <Header title="My Attendance" subtitle="Detailed attendance records across all courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6">
          {attendanceData.map((c) => (
            <div key={c.course} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">{c.course}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.percentage >= 85 ? "bg-green-100 text-green-700" : c.percentage >= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {c.percentage >= 85 ? "Good Standing" : c.percentage >= 75 ? "Warning" : "At Risk"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-blue-900">{c.name}</h3>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${c.percentage >= 85 ? "text-green-600" : c.percentage >= 75 ? "text-yellow-600" : "text-red-600"}`}>{c.percentage}%</p>
                  <p className="text-xs text-gray-500">{c.attended} of {c.total} classes</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mb-5">
                <div className={`h-full rounded-full ${c.percentage >= 85 ? "bg-green-500" : c.percentage >= 75 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${c.percentage}%` }}></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-4 py-2.5 text-left rounded-l-lg">Date</th>
                      <th className="px-4 py-2.5 text-left rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {c.records.map((r, i) => (
                      <tr key={i} className="hover:bg-blue-50/40">
                        <td className="px-4 py-2.5 text-sm text-gray-700">{r.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={r.status === "present" ? "badge-present" : r.status === "late" ? "badge-late" : "badge-absent"}>
                            {r.status === "present" ? "✓ Present" : r.status === "late" ? "⏰ Late" : "✗ Absent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {c.records.length === 0 && <tr><td colSpan={2} className="text-center py-4 text-sm text-gray-400">No records found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {attendanceData.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-sm text-gray-400">No attendance data available yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

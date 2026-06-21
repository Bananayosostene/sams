import Header from "../components/Header";
import Link from "next/link";

const myCourses = [
  { code: "CS301", name: "Data Structures & Algorithms", students: 45, nextClass: "Today, 10:00 AM", attendance: 88 },
  { code: "CS201", name: "Database Management Systems", students: 38, nextClass: "Tomorrow, 2:00 PM", attendance: 92 },
];

const recentSessions = [
  { course: "CS301", date: "Jan 15, 2025", present: 42, absent: 3, total: 45 },
  { course: "CS201", date: "Jan 14, 2025", present: 35, absent: 3, total: 38 },
  { course: "CS301", date: "Jan 13, 2025", present: 40, absent: 5, total: 45 },
];

export default function LecturerDashboard() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Lecturer Dashboard" subtitle="Manage your courses and attendance records" />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: "My Courses", value: "2", icon: "📚", color: "bg-blue-600" },
            { label: "Total Students", value: "83", icon: "🎓", color: "bg-indigo-600" },
            { label: "Sessions This Month", value: "14", icon: "📋", color: "bg-blue-500" },
            { label: "Avg. Attendance", value: "90%", icon: "📊", color: "bg-blue-700" },
          ].map(s => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-black text-blue-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-blue-900">My Courses</h2>
              <Link href="/lecturer/attendance" className="btn-primary text-xs">Record Attendance</Link>
            </div>
            <div className="space-y-4">
              {myCourses.map(c => (
                <div key={c.code} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">{c.code}</span>
                        <span className="text-xs text-blue-500">{c.students} students</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Next class: {c.nextClass}</p>
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
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{s.course}</span>
                    <span className="text-xs text-gray-400">{s.date}</span>
                  </div>
                  <div className="flex gap-3 text-xs mt-2">
                    <span className="badge-present">✓ {s.present} Present</span>
                    <span className="badge-absent">✗ {s.absent} Absent</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/lecturer/history" className="btn-secondary w-full text-center mt-4 block text-sm">View All History</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

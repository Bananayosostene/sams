import Header from "../components/Header";
import Link from "next/link";

const courses = [
  { code: "CS301", name: "Data Structures & Algorithms", attended: 19, total: 20, percentage: 95 },
  { code: "CS201", name: "Database Management Systems", attended: 15, total: 18, percentage: 83 },
  { code: "CS401", name: "Software Engineering", attended: 12, total: 16, percentage: 75 },
  { code: "CS101", name: "Introduction to Programming", attended: 14, total: 14, percentage: 100 },
];

const overallAttendance = Math.round(courses.reduce((a, c) => a + c.percentage, 0) / courses.length);

export default function StudentDashboard() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Student Dashboard" subtitle="STU2024001 · Faculty of Science & Technology" />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Overall stat */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Overall Attendance", value: `${overallAttendance}%`, icon: "📊", color: "bg-blue-600" },
            { label: "Courses Enrolled", value: courses.length.toString(), icon: "📚", color: "bg-indigo-600" },
            { label: "Classes Attended", value: courses.reduce((a, c) => a + c.attended, 0).toString(), icon: "✅", color: "bg-blue-500" },
            { label: "Classes Missed", value: courses.reduce((a, c) => a + (c.total - c.attended), 0).toString(), icon: "❌", color: "bg-blue-700" },
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
          {/* Course breakdown */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-blue-900">Attendance by Course</h2>
              <Link href="/student/attendance" className="text-xs text-blue-600 hover:underline font-medium">View Details →</Link>
            </div>
            <div className="space-y-4">
              {courses.map(c => (
                <div key={c.code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{c.code}</span>
                      <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{c.attended}/{c.total}</span>
                      <span className={`text-sm font-bold ${c.percentage >= 85 ? "text-green-600" : c.percentage >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.percentage >= 85 ? "bg-green-500" : c.percentage >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${c.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Actions */}
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-base font-bold text-blue-900 mb-3">Status Alerts</h2>
              {courses.filter(c => c.percentage < 85).map(c => (
                <div key={c.code} className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${c.percentage < 75 ? "bg-red-50 border border-red-100" : "bg-yellow-50 border border-yellow-100"}`}>
                  <span className="text-lg flex-shrink-0">{c.percentage < 75 ? "🚨" : "⚠️"}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.code} – Low Attendance</p>
                    <p className="text-xs text-gray-500">{c.percentage}% – minimum 75% required</p>
                  </div>
                </div>
              ))}
              {courses.every(c => c.percentage >= 85) && (
                <p className="text-xs text-green-600 font-medium">✅ All courses are in good standing!</p>
              )}
            </div>

            <div className="card">
              <h2 className="text-base font-bold text-blue-900 mb-3">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/student/attendance" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                  📋 View Full Attendance
                </Link>
                <Link href="/student/feedback" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-800">
                  💬 Submit Feedback
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import Header from "../../components/Header";

const attendanceData = [
  {
    course: "CS301",
    name: "Data Structures & Algorithms",
    percentage: 95,
    attended: 19,
    total: 20,
    records: [
      { date: "Jan 15, 2025", status: "present" },
      { date: "Jan 13, 2025", status: "present" },
      { date: "Jan 8, 2025", status: "late" },
      { date: "Jan 6, 2025", status: "absent" },
      { date: "Jan 1, 2025", status: "present" },
    ],
  },
  {
    course: "CS201",
    name: "Database Management Systems",
    percentage: 83,
    attended: 15,
    total: 18,
    records: [
      { date: "Jan 14, 2025", status: "present" },
      { date: "Jan 10, 2025", status: "absent" },
      { date: "Jan 7, 2025", status: "present" },
      { date: "Jan 3, 2025", status: "late" },
    ],
  },
];

export default function StudentAttendancePage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="My Attendance" subtitle="Detailed attendance records across all courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6">
          {attendanceData.map(c => (
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
                  <p className={`text-3xl font-black ${c.percentage >= 85 ? "text-green-600" : c.percentage >= 75 ? "text-yellow-600" : "text-red-600"}`}>
                    {c.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">{c.attended} of {c.total} classes</p>
                </div>
              </div>

              <div className="h-2 bg-gray-100 rounded-full mb-5">
                <div
                  className={`h-full rounded-full ${c.percentage >= 85 ? "bg-green-500" : c.percentage >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${c.percentage}%` }}
                ></div>
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
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

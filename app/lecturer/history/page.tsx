import Header from "../../components/Header";

const history = [
  { id: 1, course: "CS301", date: "Jan 15, 2025", day: "Wednesday", present: 42, late: 1, absent: 2, total: 45 },
  { id: 2, course: "CS201", date: "Jan 14, 2025", day: "Tuesday", present: 35, late: 2, absent: 1, total: 38 },
  { id: 3, course: "CS301", date: "Jan 13, 2025", day: "Monday", present: 40, late: 2, absent: 3, total: 45 },
  { id: 4, course: "CS201", date: "Jan 10, 2025", day: "Friday", present: 36, late: 1, absent: 1, total: 38 },
  { id: 5, course: "CS301", date: "Jan 8, 2025", day: "Wednesday", present: 38, late: 3, absent: 4, total: 45 },
  { id: 6, course: "CS201", date: "Jan 7, 2025", day: "Tuesday", present: 33, late: 2, absent: 3, total: 38 },
];

export default function AttendanceHistoryPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Attendance History" subtitle="Past attendance records for your courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <div className="flex gap-2">
              <button className="btn-primary text-xs">All Courses</button>
              <button className="btn-secondary text-xs">CS301</button>
              <button className="btn-secondary text-xs">CS201</button>
            </div>
            <button className="btn-secondary text-xs">📥 Export CSV</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Date</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Present</th>
                  <th className="px-4 py-3 text-left">Late</th>
                  <th className="px-4 py-3 text-left">Absent</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map(h => {
                  const rate = Math.round(((h.present + h.late) / h.total) * 100);
                  return (
                    <tr key={h.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{h.date}</p>
                        <p className="text-xs text-gray-400">{h.day}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{h.course}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-green-600 font-semibold">{h.present}</td>
                      <td className="px-4 py-3.5 text-sm text-yellow-600 font-semibold">{h.late}</td>
                      <td className="px-4 py-3.5 text-sm text-red-600 font-semibold">{h.absent}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{h.total}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${rate >= 85 ? "bg-green-500" : rate >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rate}%` }}></div>
                          </div>
                          <span className={`text-xs font-bold ${rate >= 85 ? "text-green-600" : rate >= 70 ? "text-yellow-600" : "text-red-600"}`}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

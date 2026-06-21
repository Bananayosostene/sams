import Header from "../../components/Header";

const students = [
  { id: 1, regNo: "STU2024001", name: "Alice Johnson", course: "CS301", attendance: 95, lastSeen: "Jan 15" },
  { id: 2, regNo: "STU2024003", name: "Carol Smith", course: "CS301", attendance: 82, lastSeen: "Jan 14" },
  { id: 3, regNo: "STU2024006", name: "Frank Wilson", course: "CS301", attendance: 70, lastSeen: "Jan 10" },
  { id: 4, regNo: "STU2024008", name: "Grace Lee", course: "CS201", attendance: 98, lastSeen: "Jan 15" },
  { id: 5, regNo: "STU2024009", name: "Henry Davis", course: "CS201", attendance: 65, lastSeen: "Jan 8" },
  { id: 6, regNo: "STU2024010", name: "Iris Brown", course: "CS201", attendance: 88, lastSeen: "Jan 14" },
];

export default function LecturerStudentsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Students" subtitle="Students enrolled in your courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <div className="flex gap-2">
              <button className="btn-primary text-xs">All Courses</button>
              <button className="btn-secondary text-xs">CS301</button>
              <button className="btn-secondary text-xs">CS201</button>
            </div>
            <input className="input max-w-xs text-sm" placeholder="🔍  Search students..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Student</th>
                  <th className="px-4 py-3 text-left">Reg. No</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Attendance</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{s.regNo}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{s.course}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.attendance >= 85 ? "bg-green-500" : s.attendance >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${s.attendance}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${s.attendance >= 85 ? "text-green-600" : s.attendance >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                          {s.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{s.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

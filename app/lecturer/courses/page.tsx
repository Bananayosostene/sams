import Header from "../../components/Header";
import Link from "next/link";

const courses = [
  { code: "CS301", name: "Data Structures & Algorithms", students: 45, credits: 4, semester: "Semester 1 2024/2025", schedule: "Mon/Wed 10:00 AM", room: "Lab 3A", attendance: 88 },
  { code: "CS201", name: "Database Management Systems", students: 38, credits: 3, semester: "Semester 1 2024/2025", schedule: "Tue/Thu 2:00 PM", room: "Room 204", attendance: 92 },
];

export default function LecturerCoursesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="My Courses" subtitle="Courses assigned to you this semester" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(c => (
            <div key={c.code} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">{c.code}</span>
                  <h3 className="text-base font-bold text-blue-900 mt-2">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.semester}</p>
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
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Schedule</p>
                  <p className="text-xs font-semibold text-blue-800">{c.schedule}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Room</p>
                  <p className="text-xs font-semibold text-blue-800">{c.room}</p>
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

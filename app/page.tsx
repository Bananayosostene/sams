import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-800 font-black text-3xl mx-auto mb-6 shadow-2xl">
            S
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">SAMS</h1>
          <p className="text-blue-200 text-xl font-medium">Student Attendance Management System</p>
          <p className="text-blue-300 text-sm mt-2 max-w-md mx-auto">
            A centralized platform for tracking, managing, and reporting student attendance across all courses and faculties.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin" className="group bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-300 text-center">
            <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-700 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 transition-colors">
              
            </div>
            <h2 className="text-white group-hover:text-blue-900 text-xl font-bold mb-2 transition-colors">Admin</h2>
            <p className="text-blue-200 group-hover:text-gray-500 text-sm transition-colors">
              Manage faculties, se mesters, courses, lecturers and students
            </p>
            <div className="mt-6 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors">
              Enter Dashboard →
            </div>
          </Link>

          <Link href="/lecturer" className="group bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-300 text-center">
            <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-700 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 transition-colors">

            </div>
            <h2 className="text-white group-hover:text-blue-900 text-xl font-bold mb-2 transition-colors">Lecturer</h2>
            <p className="text-blue-200 group-hover:text-gray-500 text-sm transition-colors">
              Record attendance, view students and manage course sessions
            </p>
            <div className="mt-6 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors">
              Enter Dashboard →
            </div>
          </Link>

          <Link href="/student" className="group bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-300 text-center">
            <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-700 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 transition-colors">
            </div>
            <h2 className="text-white group-hover:text-blue-900 text-xl font-bold mb-2 transition-colors">Student</h2>
            <p className="text-blue-200 group-hover:text-gray-500 text-sm transition-colors">
              View attendance records, percentages and submit feedback
            </p>
            <div className="mt-6 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors">
              Enter Dashboard →
            </div>
          </Link>
        </div>

        <p className="text-center text-blue-400 text-xs mt-10">© 2025 SAMS · Student Attendance Management System</p>
      </div>
    </main>
  );
}


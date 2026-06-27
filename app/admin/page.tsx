import Header from "../components/Header";
import Link from "next/link";
import { getAuthUser } from "../lib/auth";
import { prisma } from "../lib/prisma";

export default async function AdminDashboard() {
  const user = await getAuthUser();

  if (!user || user.role !== "admin") {
    return <div className="flex flex-col h-full"><Header title="Admin Dashboard" /><main className="flex-1 p-8"><p>Unauthorized</p></main></div>;
  }

  const [faculties, courses, lecturers, students, recentActivity] = await Promise.all([
    prisma.faculty.count(),
    prisma.course.count(),
    prisma.user.count({ where: { role: "lecturer" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.findMany({
      where: { role: { in: ["student", "lecturer"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true, role: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Total Faculties", value: String(faculties), icon: "🏛", color: "bg-blue-600", change: `${faculties} registered` },
    { label: "Active Courses", value: String(courses), icon: "📚", color: "bg-blue-500", change: `${courses} active` },
    { label: "Lecturers", value: String(lecturers), icon: "👨‍🏫", color: "bg-indigo-600", change: "All active" },
    { label: "Students", value: String(students), icon: "🎓", color: "bg-blue-700", change: `${students} enrolled` },
  ];

  const quickLinks = [
    { label: "Manage Faculties", href: "/admin/faculties", icon: "🏛", desc: "Create and edit faculties" },
    { label: "Manage Semesters", href: "/admin/semesters", icon: "📅", desc: "Set academic periods" },
    { label: "Manage Courses", href: "/admin/courses", icon: "📚", desc: "Add and assign courses" },
    { label: "Manage Lecturers", href: "/admin/lecturers", icon: "👨‍🏫", desc: "Assign courses to lecturers" },
    { label: "Manage Students", href: "/admin/students", icon: "🎓", desc: "Enroll and view students" },
  ];

  const activityItems = recentActivity.length > 0
    ? recentActivity.map((a) => ({
        action: `New ${a.role} registered`,
        detail: a.name,
        time: new Date(a.createdAt).toLocaleDateString(),
      }))
    : [{ action: "Getting started", detail: "Seed your database to see activity", time: "—" }];

  return (
    <div className="flex flex-col h-full">
      <Header title="Admin Dashboard" subtitle="Overview of the academic management system" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-black text-blue-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-600">{s.label}</p>
                <p className="text-xs text-blue-500 mt-0.5">{s.change}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="text-base font-bold text-blue-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors group">
                  <span className="text-2xl">{link.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 group-hover:text-blue-900">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activityItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                    <p className="text-xs text-blue-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

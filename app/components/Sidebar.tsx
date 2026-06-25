"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  role: "admin" | "lecturer" | "student";
  userName: string;
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: "⊞" },
    { label: "Faculties", href: "/admin/faculties", icon: "🏛" },
    { label: "Semesters", href: "/admin/semesters", icon: "📅" },
    { label: "Courses", href: "/admin/courses", icon: "📚" },
    { label: "Lecturers", href: "/admin/lecturers", icon: "👨‍🏫" },
    { label: "Students", href: "/admin/students", icon: "🎓" },
  ],
  lecturer: [
    { label: "Dashboard", href: "/lecturer", icon: "⊞" },
    { label: "My Courses", href: "/lecturer/courses", icon: "📚" },
    { label: "Students", href: "/lecturer/students", icon: "🎓" },
    { label: "Record Attendance", href: "/lecturer/attendance", icon: "✅" },
    { label: "Attendance History", href: "/lecturer/history", icon: "📋" },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: "⊞" },
    { label: "My Attendance", href: "/student/attendance", icon: "📋" },
    { label: "Feedback", href: "/student/feedback", icon: "💬" },
  ],
};

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems[role];

  const roleColors: Record<string, string> = {
    admin: "Admin",
    lecturer: "Lecturer",
    student: "Student",
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-64 h-screen bg-blue-900 flex flex-col shadow-xl sticky top-0">
      <div className="px-6 py-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">S</div>
          <div>
            <p className="text-white font-bold text-base leading-tight">SAMS</p>
            <p className="text-blue-300 text-xs">Attendance System</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">{userName.charAt(0)}</div>
          <div>
            <p className="text-white text-sm font-medium truncate w-32">{userName}</p>
            <span className="text-xs bg-blue-700 text-blue-200 px-2 py-0.5 rounded-full">{roleColors[role]}</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-blue-800">
        <button onClick={handleLogout} className="sidebar-link w-full text-left">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

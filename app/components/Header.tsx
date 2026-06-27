"use client";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const isSubPage = segments.length > 1;
  const dashboardPath = "/" + segments[0];

  return (
    <header className="bg-white border-b border-blue-100 px-8 py-4 sticky top-0 z-10 shadow-sm">
      {isSubPage && (
        <button
          onClick={() => router.push(dashboardPath)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors mb-2"
        >
          ← Back to Dashboard
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}

import Sidebar from "../components/Sidebar";
import { getAuthUser } from "../lib/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role="student" userName={user?.name || "Student"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

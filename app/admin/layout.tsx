import Sidebar from "../components/Sidebar";
import { getAuthUser } from "../lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" userName={user?.name || "Admin User"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

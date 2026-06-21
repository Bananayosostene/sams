import Sidebar from "../components/Sidebar";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="lecturer" userName="Dr. Richard Adams" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

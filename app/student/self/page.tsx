"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

export default function StudentSelfRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/attendance/session/current", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to find session");
        if (json.data?.token) {
          router.replace(`/student/self/${json.data.token}`);
        } else {
          setError("No attendance session found for today. Ask your lecturer to generate a link.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    })();
  }, [router]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Mark Attendance" />
      <main className="flex-1 p-8">
        <div className="card text-center py-12 max-w-lg mx-auto">
          {error ? (
            <>
              <p className="text-gray-400 text-lg mb-2">Mark Attendance</p>
              <p className="text-sm text-red-500">{error}</p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Looking for today&apos;s attendance session...</p>
          )}
        </div>
      </main>
    </div>
  );
}

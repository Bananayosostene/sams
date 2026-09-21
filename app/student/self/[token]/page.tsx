"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

interface SessionInfo {
  course: { id: string; code: string; name: string; facultyId: string };
  date: string;
  sessionStatus: string;
  token: string;
  enrolled: boolean;
  expiresAt: string | null;
  submission: { status: string; source: string; date: string } | null;
  resolved: {
    currentToken: string | null;
    noSessionToday: boolean;
    openedTokenExpired: boolean;
  };
}

interface SubmitResult {
  status: string;
  verified: boolean;
  message: string;
}

export default function StudentSelfAttendancePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [data, setData] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"present" | "absent">("present");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/attendance/session/${token}`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load attendance session");
        const d = json.data;
        // Only redirect if the opened token is stale and there's a different current token
        if (d?.resolved?.currentToken && d.resolved.currentToken !== token) {
          router.replace(`/student/self/${d.resolved.currentToken}`);
          return;
        }
        // If no active session exists today, show the no-session message via error
        if (d?.resolved?.noSessionToday && d?.sessionStatus !== "active") {
          setError("No attendance session found for today. Ask your lecturer to generate a link.");
          setLoading(false);
          return;
        }
        setData(d);
        if (d?.submission) {
          setResult({ status: d.submission.status, verified: d.submission.source === "student", message: `You already submitted your attendance on ${d.date}.` });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser, so you can only mark yourself as absent.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocationError("");
        },
        () => {
          setLocationError("Unable to access your location. Location is required to mark yourself as present.");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (!position && selectedStatus === "present") return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/attendance/self", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          status: selectedStatus,
          latitude: position?.latitude,
          longitude: position?.longitude,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to submit attendance");
      setResult(json.data);
      setData((prev) => (prev ? { ...prev, submission: { status: json.data.status, source: "student", date: prev.date } } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="Self Attendance" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  if (error && !data) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Attendance" />
        <main className="flex-1 p-8">
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg mb-2">Self Attendance</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  const submission = data.submission;

  return (
    <div className="flex flex-col h-full">
      <Header title="Self Attendance" subtitle="Mark yourself present or absent" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">{data.course.code}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${data.sessionStatus === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {data.sessionStatus === "active" ? "Open" : "Closed"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-blue-900">{data.course.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Class date: <span className="font-medium text-gray-700">{data.date}</span></p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mt-4 text-sm font-medium">{error}</div>
          )}

          {submission ? (
            <div className="mt-6">
              <div className={`rounded-2xl p-6 text-center ${submission.status === "present" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-2xl font-black ${submission.status === "present" ? "text-green-600" : "text-red-600"}`}>
                  {submission.status === "present" ? "Present" : "Absent"}
                </p>
                <p className="text-sm text-gray-600 mt-1">{result?.message || `You submitted your attendance on ${data.date}.`}</p>
              </div>
              <a href="/student/attendance" className="btn-primary w-full mt-4 text-center justify-center inline-flex">View My Attendance</a>
            </div>
          ) : data.sessionStatus !== "active" ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-5 mt-6 text-center text-sm text-gray-500">
              This attendance session has been closed and no longer accepts submissions.
            </div>
          ) : !data.enrolled ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-5 mt-6 text-sm font-medium text-center">
              You are not enrolled in this course, so you cannot submit attendance.
            </div>
          ) : (
            <div className="mt-6">
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-800 mb-5">
                {position ? (
                  <>Location detected. Your submission will be verified against the recorded class location (within the allowed radius mark = present, outside = absent).</>
                ) : (
                  locationError || "Detecting your location..."
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => { setSelectedStatus("present"); setError(""); }}
                  disabled={!position}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    selectedStatus === "present"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-green-300"
                  } ${!position ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="block text-2xl mb-1">✓</span>
                  Present
                </button>
                <button
                  onClick={() => { setSelectedStatus("absent"); setError(""); }}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    selectedStatus === "absent"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-red-300"
                  }`}
                >
                  <span className="block text-2xl mb-1">✗</span>
                  Absent
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mb-4">
                Only Present and Absent are available for self-marking. &quot;Late&quot; can only be recorded by the lecturer. If you are outside the class location when submitting, you will be recorded as Absent.
              </p>

              <button
                onClick={handleSubmit}
                disabled={submitting || (selectedStatus === "present" && !position)}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit My Attendance"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";

interface Course {
  id: string;
  code: string;
  name: string;
}

interface StudentInfo {
  id: string;
  name: string;
  registrationNumber: string | null;
  email: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  studentId: string;
  student: StudentInfo;
  courseId: string;
  course: { id: string; name: string; code: string };
}

interface Session {
  date: string;
  day: string;
  records: AttendanceRecord[];
}

type Status = "present" | "absent" | "late";

export default function AttendanceHistoryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editedRecords, setEditedRecords] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get<{ id: string }>("/api/auth/me");
        const userId = meRes.data?.id;
        const cRes = await api.get<Course[]>(`/api/courses${userId ? `?lecturerId=${userId}` : ""}`);
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      } catch {
        const cRes = await api.get<Course[]>("/api/courses");
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<AttendanceRecord[]>(`/api/attendance?courseId=${selectedCourse}`);
        const records = res.data || [];

        const grouped: Record<string, AttendanceRecord[]> = {};
        for (const r of records) {
          if (!grouped[r.date]) grouped[r.date] = [];
          grouped[r.date].push(r);
        }

        const sessionsList = Object.entries(grouped)
          .map(([date, recs]) => ({
            date,
            day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
            records: recs,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setSessions(sessionsList);
        setEditedRecords({});
        setSelectedDate(sessionsList.length > 0 ? sessionsList[0].date : "");
      } catch {
        setSessions([]);
      }
      setLoading(false);
    })();
  }, [selectedCourse]);

  const handleStatusChange = (recordId: string, status: Status) => {
    setEditedRecords((prev) => ({ ...prev, [recordId]: status }));
  };

  const getDisplayStatus = (record: AttendanceRecord): Status => {
    return editedRecords[record.id] || record.status;
  };

  const hasEdits = (session: Session): boolean => {
    return session.records.some((r) => editedRecords[r.id] !== undefined);
  };

  const handleSaveSession = async (session: Session) => {
    const changedRecords = session.records
      .filter((r) => editedRecords[r.id] !== undefined)
      .map((r) => ({ studentId: r.studentId, status: editedRecords[r.id] }));

    if (changedRecords.length === 0) return;

    const key = session.date;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await api.post("/api/attendance", {
        courseId: selectedCourse,
        date: session.date,
        records: changedRecords,
      });

      setSessions((prev) =>
        prev.map((s) => {
          if (s.date !== session.date) return s;
          return {
            ...s,
            records: s.records.map((r) => ({
              ...r,
              status: editedRecords[r.id] || r.status,
            })),
          };
        })
      );

      setEditedRecords((prev) => {
        const next = { ...prev };
        session.records.forEach((r) => delete next[r.id]);
        return next;
      });

      setSavedMessage(`Attendance for ${session.date} saved successfully!`);
      setTimeout(() => setSavedMessage(null), 3000);
    } catch {
      setSavedMessage("Failed to save changes");
      setTimeout(() => setSavedMessage(null), 3000);
    }
    setSaving((prev) => ({ ...prev, [key]: false }));
  };

  const filteredDates = selectedDate
    ? sessions.filter((s) => s.date === selectedDate)
    : sessions;

  const allDates = sessions.map((s) => s.date);

  return (
    <div className="flex flex-col h-full">
      <Header title="Attendance History" subtitle="View and edit past attendance records" />
      <main className="flex-1 p-8 overflow-y-auto">
        {savedMessage && (
          <div className={`rounded-xl px-5 py-3 mb-6 flex items-center gap-2 text-sm font-medium ${
            savedMessage.includes("Failed") ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {savedMessage.includes("Failed") ? "❌" : "✅"} {savedMessage}
          </div>
        )}

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Select Course</label>
              <select className="input" value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); }}>
                {courses.length === 0 && <option value="">No courses assigned</option>}
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Filter by Date</label>
              <select className="input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                {allDates.length === 0 && <option value="">No records</option>}
                {allDates.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">Loading...</div>
        ) : filteredDates.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No attendance records found</p>
            <p className="text-gray-400 text-sm mt-2">Start by recording attendance for your courses.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDates.map((session) => {
              const present = session.records.filter((r) => getDisplayStatus(r) === "present").length;
              const late = session.records.filter((r) => getDisplayStatus(r) === "late").length;
              const absent = session.records.filter((r) => getDisplayStatus(r) === "absent").length;
              const total = session.records.length;
              const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
              const dirty = hasEdits(session);

              return (
                <div key={session.date} className={`card ${dirty ? "ring-2 ring-blue-400" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-blue-900">{session.date}</h3>
                        <span className="text-xs text-gray-400">{session.day}</span>
                        {dirty && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Unsaved changes</span>}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-green-600 font-medium">{present} Present</span>
                        <span className="text-xs text-yellow-600 font-medium">{late} Late</span>
                        <span className="text-xs text-red-600 font-medium">{absent} Absent</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 85 ? "bg-green-500" : rate >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className={`text-xs font-bold ${rate >= 85 ? "text-green-600" : rate >= 70 ? "text-yellow-600" : "text-red-600"}`}>{rate}%</span>
                      </div>
                      <button
                        onClick={() => handleSaveSession(session)}
                        disabled={!dirty || saving[session.date]}
                        className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-all ${
                          dirty ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        } disabled:opacity-50`}
                      >
                        {saving[session.date] ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="table-head">
                          <th className="px-3 py-2 text-left rounded-l-lg text-xs">Student</th>
                          <th className="px-3 py-2 text-left text-xs">Reg. No</th>
                          <th className="px-3 py-2 text-right rounded-r-lg text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {session.records.map((record) => {
                          const displayStatus = getDisplayStatus(record);
                          const isEdited = editedRecords[record.id] !== undefined;
                          return (
                            <tr key={record.id} className={`hover:bg-blue-50/40 transition-colors ${isEdited ? "bg-blue-50/60" : ""}`}>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {record.student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                  </div>
                                  <span className="text-sm font-medium text-gray-800">{record.student.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{record.student.registrationNumber || "—"}</td>
                              <td className="px-3 py-2.5 text-right">
                                <div className="flex gap-1.5 justify-end">
                                  {(["present", "late", "absent"] as Status[]).map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => handleStatusChange(record.id, st)}
                                      className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                                        displayStatus === st
                                          ? st === "present" ? "bg-green-500 text-white" : st === "late" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                                          : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-blue-300"
                                      }`}
                                    >{st}</button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

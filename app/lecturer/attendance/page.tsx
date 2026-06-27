"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";

interface Faculty {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  registrationNumber: string | null;
  name: string;
  faculty: Faculty | null;
}

interface Course {
  id: string;
  code: string;
  name: string;
  faculty: Faculty;
}

type Status = "present" | "absent" | "late";

export default function RecordAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadStudents = (courseId: string, coursesList: Course[]) => {
    const course = coursesList.find((c) => c.id === courseId);
    const facultyId = course?.faculty?.id;
    if (courseId && facultyId) {
      api.get<Student[]>(`/api/students?facultyId=${facultyId}`).then((sRes) => {
        const list = sRes.data || [];
        setStudents(list);
        const all: Record<string, Status> = {};
        list.forEach((s) => (all[s.id] = "absent"));
        setAttendance(all);
      });
    } else {
      setStudents([]);
      setAttendance({});
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSaved(false);
    loadStudents(courseId, courses);
  };

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
          loadStudents(coursesData[0].id, coursesData);
        }
      } catch {
        const cRes = await api.get<Course[]>("/api/courses");
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
          loadStudents(coursesData[0].id, coursesData);
        }
      }
      setLoading(false);
    })();
  }, []);

  const setAll = (status: Status) => {
    const all: Record<string, Status> = {};
    students.forEach((s) => (all[s.id] = status));
    setAttendance(all);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId, status,
    }));
    await api.post("/api/attendance", {
      courseId: selectedCourse,
      date,
      records,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const counts = students.reduce(
    (acc, s) => {
      const st = attendance[s.id] || "absent";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) return <div className="flex flex-col h-full"><Header title="Record Attendance" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Record Attendance" subtitle="Mark student attendance for today's class" />
      <main className="flex-1 p-8 overflow-y-auto">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 mb-6 flex items-center gap-2 text-sm font-medium">
            ✅ Attendance saved successfully!
          </div>
        )}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Select Course</label>
              <select className="input" value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
                {courses.length === 0 && <option value="">No courses assigned</option>}
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-blue-900">{students.length} students</span>
              <div className="flex gap-1.5">
                <span className="badge-present">{counts.present || 0} Present</span>
                <span className="badge-absent">{counts.absent || 0} Absent</span>
                <span className="badge-late">{counts.late || 0} Late</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAll("present")} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium">All Present</button>
              <button onClick={() => setAll("absent")} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors font-medium">All Absent</button>
            </div>
          </div>
          <div className="space-y-2">
            {students.map((s) => {
              const status = attendance[s.id] || "absent";
              return (
                <div key={s.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{s.registrationNumber || ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "late", "absent"] as Status[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setAttendance({ ...attendance, [s.id]: st })}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                          status === st
                            ? st === "present" ? "bg-green-500 text-white" : st === "late" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                            : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-blue-300"
                        }`}
                      >{st}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            {students.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No students found for this course</p>}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 disabled:opacity-50">{saving ? "Saving..." : "Save Attendance"}</button>
          </div>
        </div>
      </main>
    </div>
  );
}

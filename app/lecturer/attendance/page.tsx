"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";
import { distanceMeters, CLASS_RADIUS_METERS } from "../../lib/geo";

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
  latitude?: number | null;
  longitude?: number | null;
}

type Status = "present" | "absent" | "late";

interface ClassLocation {
  id: string;
  courseId: string;
  latitude: number;
  longitude: number;
  label: string | null;
  createdAt: string;
}

interface SessionInfo {
  id: string;
  token: string;
  date: string;
  status: string;
  submissions: number;
}

type LocationAction = null | { type: "record-first" } | { type: "not-at-location"; distance: number };

export default function RecordAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [positionError, setPositionError] = useState("");
  const [classLocations, setClassLocations] = useState<ClassLocation[]>([]);
  const [savingLocation, setSavingLocation] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [locationAction, setLocationAction] = useState<LocationAction>(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [confirmingLocation, setConfirmingLocation] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const requestPosition = () => {
    if (!navigator.geolocation) {
      setPositionError("Geolocation is not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setPositionError("");
      },
      () => setPositionError("Unable to access your location. Enable location access (requires HTTPS)."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const loadClassLocations = async (courseId: string) => {
    try {
      const res = await api.get<ClassLocation[]>(`/api/class-locations?courseId=${courseId}`);
      setClassLocations(res.data || []);
    } catch {
      setClassLocations([]);
    }
  };

  const loadSessions = async (courseId: string) => {
    try {
      const res = await api.get<SessionInfo[]>(`/api/attendance/session?courseId=${courseId}`);
      setSessions(res.data || []);
    } catch {
      setSessions([]);
    }
  };

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
    setGeneratedLink("");
    setErrorMsg("");
    loadStudents(courseId, courses);
    loadClassLocations(courseId);
    loadSessions(courseId);
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
          const first = coursesData[0];
          setSelectedCourse(first.id);
          loadStudents(first.id, coursesData);
          loadClassLocations(first.id);
          loadSessions(first.id);
        }
      } catch {
        const cRes = await api.get<Course[]>("/api/courses");
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          const first = coursesData[0];
          setSelectedCourse(first.id);
          loadStudents(first.id, coursesData);
          loadClassLocations(first.id);
          loadSessions(first.id);
        }
      }
      setLoading(false);
    })();
    const locateTimer = setTimeout(() => requestPosition(), 0);
    return () => clearTimeout(locateTimer);
  }, []);

  const setAll = (status: Status) => {
    const all: Record<string, Status> = {};
    students.forEach((s) => (all[s.id] = status));
    setAttendance(all);
  };

  const latestLocation = classLocations[0] || null;
  const distanceFromClass = latestLocation && position
    ? distanceMeters(position.latitude, position.longitude, latestLocation.latitude, latestLocation.longitude)
    : null;

  const saveAttendance = async () => {
    if (!selectedCourse) return;
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
    setErrorMsg("");
    setTimeout(() => setSaved(false), 3000);
  };

  const saveClassLocation = async (latitude: number, longitude: number, label?: string) => {
    const res = await api.post<ClassLocation>("/api/class-locations", {
      courseId: selectedCourse,
      latitude,
      longitude,
      label: label || `Location saved ${new Date().toLocaleString()}`,
    });
    return res.data;
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setErrorMsg("");
    setSaving(true);
    try {
      if (position && !latestLocation) {
        setSaving(false);
        setLocationAction({ type: "record-first" });
        return;
      }
      if (position && latestLocation) {
        const dist = distanceMeters(position.latitude, position.longitude, latestLocation.latitude, latestLocation.longitude);
        if (dist > CLASS_RADIUS_METERS) {
          setSaving(false);
          setSelectedLocationId(latestLocation.id);
          setLocationAction({ type: "not-at-location", distance: dist });
          return;
        }
      }
      await saveAttendance();
    } catch {
      setErrorMsg("Failed to save attendance");
      setSaving(false);
    }
  };

  const handleLocationConfirm = async (saveNewLocation: boolean) => {
    setConfirmingLocation(true);
    setLocationAction(null);
    try {
      if (saveNewLocation && position) {
        await saveClassLocation(position.latitude, position.longitude);
        await loadClassLocations(selectedCourse);
      } else if (!saveNewLocation && classLocations.length > 0) {
        const chosen = classLocations.find((l) => l.id === selectedLocationId) || latestLocation;
        if (chosen && chosen.id !== latestLocation?.id) {
          await saveClassLocation(chosen.latitude, chosen.longitude, chosen.label || "Location selected from history");
          await loadClassLocations(selectedCourse);
        }
      }
      await saveAttendance();
    } catch {
      setErrorMsg("Failed to save. Could not save attendance / location.");
      setSaving(false);
    }
    setConfirmingLocation(false);
  };

  const generateLink = async () => {
    if (!selectedCourse) return;
    setGenerating(true);
    setErrorMsg("");
    try {
      const res = await api.post<{ session: SessionInfo; link: string }>("/api/attendance/session", {
        courseId: selectedCourse,
        date,
      });
      const fullLink = res.data.link.includes("http") ? res.data.link : `${window.location.origin}${res.data.link}`;
      setGeneratedLink(fullLink);
      loadSessions(selectedCourse);
    } catch {
      setErrorMsg("Failed to generate attendance link.");
    }
    setGenerating(false);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setErrorMsg("Unable to copy to clipboard.");
    }
  };

  const toggleSession = async (session: SessionInfo) => {
    try {
      await api.post(`/api/attendance/session/${session.token}`, {
        status: session.status === "active" ? "closed" : "active",
      });
      loadSessions(selectedCourse);
    } catch {
      setErrorMsg("Failed to update session status.");
    }
  };

  const handleSaveMyLocation = async () => {
    if (!position || !selectedCourse) return;
    setSavingLocation(true);
    setErrorMsg("");
    try {
      await saveClassLocation(position.latitude, position.longitude);
      await loadClassLocations(selectedCourse);
    } catch {
      setErrorMsg("Failed to save class location.");
    }
    setSavingLocation(false);
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
            âœ… Saved successfully!
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 mb-6 flex items-center gap-2 text-sm font-medium">
            âŒ {errorMsg}
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
              <input type="date" className="input" value={date} onChange={(e) => { setDate(e.target.value); setGeneratedLink(""); }} max={today} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-blue-900">Class Location</h2>
              <button onClick={requestPosition} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                Detect Location
              </button>
            </div>
            {position ? (
              <p className="text-xs text-gray-600 font-mono mb-3">
                Your location: {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-3">{positionError || "Detecting location..."}</p>
            )}
            {latestLocation ? (
              <div className="bg-blue-50 rounded-lg px-3 py-2.5 mb-3">
                <p className="text-xs font-semibold text-blue-900">Recorded class location</p>
                <p className="text-xs text-gray-600 font-mono">{latestLocation.latitude.toFixed(6)}, {latestLocation.longitude.toFixed(6)}</p>
                {distanceFromClass != null && (
                  <p className={`text-xs font-medium mt-0.5 ${distanceFromClass <= CLASS_RADIUS_METERS ? "text-green-600" : "text-red-600"}`}>
                    You are {Math.round(distanceFromClass)} m away {distanceFromClass > CLASS_RADIUS_METERS ? "(outside the recorded location)" : "(inside)"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3">No class location recorded for this course yet. Recording the class location lets students self-verify their attendance.</p>
            )}
            <button
              onClick={handleSaveMyLocation}
              disabled={!position || savingLocation}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium w-full disabled:opacity-50"
            >
              {savingLocation ? "Saving..." : "Save My Current Location as Class Location"}
            </button>
            {classLocations.length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Previously recorded ({classLocations.length - 1})</p>
                <ul className="space-y-1 max-h-24 overflow-y-auto">
                  {classLocations.slice(1).map((l) => (
                    <li key={l.id} className="text-[11px] text-gray-400 font-mono truncate">
                      {new Date(l.createdAt).toLocaleString()} — {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-bold text-blue-900">Self Attendance Link</h2>
              <button
                onClick={generateLink}
                disabled={generating || !selectedCourse}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Link"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Generate a link for {courses.find((c) => c.id === selectedCourse)?.code || ""} on {date}. Students open the link and mark themselves Present or Absent. Their submission is verified against the recorded class location — outside the location, submissions are recorded as Absent. &quot;Late&quot; can only be marked by you.
            </p>
            {generatedLink ? (
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input readOnly value={generatedLink} className="input flex-1 text-xs font-mono" />
                <button onClick={() => copyText(generatedLink)} className="text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium whitespace-nowrap">
                  Copy Link
                </button>
              </div>
            ) : sessions.length > 0 ? (
              <p className="text-xs text-gray-400 mb-1">Select &quot;Generate Link&quot; to create a fresh link (an active one is reused if it exists).</p>
            ) : null}
            {sessions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-3 py-2 text-left rounded-l-lg text-xs">Date</th>
                      <th className="px-3 py-2 text-left text-xs">Status</th>
                      <th className="px-3 py-2 text-left text-xs">Submissions</th>
                      <th className="px-3 py-2 text-right rounded-r-lg text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/40">
                        <td className="px-3 py-2.5 text-sm text-gray-700">{s.date}</td>
                        <td className="px-3 py-2.5">
                          <span className={s.status === "active" ? "badge-present" : "badge-absent"}>
                            {s.status === "active" ? "Open" : "Closed"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-gray-600">{s.submissions}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => copyText(`${window.location.origin}/student/self/${s.token}`)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium mr-1"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => toggleSession(s)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                              s.status === "active"
                                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            }`}
                          >
                            {s.status === "active" ? "Close" : "Reopen"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

      {locationAction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-blue-900 mb-2">
              {locationAction?.type === "record-first" ? "Record class location?" : "You're not at the recorded class location"}
            </h3>
            {locationAction?.type === "record-first" ? (
              <p className="text-sm text-gray-600 mb-5">
                No class location is recorded for this course yet. Save your current location as the class location so students can self-verify their attendance?
              </p>
            ) : (
              <div className="mb-5">
                <p className="text-sm text-gray-600 mb-2">
                  You are currently <span className="font-semibold text-red-600">{Math.round(locationAction.distance)} m</span> away from the recorded class location.
                </p>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Choose what should be used as the class location for this attendance:
                </div>
              </div>
            )}
            {locationAction?.type === "not-at-location" && classLocations.length > 1 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Use this recorded location</label>
                <select className="input text-sm" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)}>
                  {classLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}{" "}
                      {l.id === latestLocation?.id ? "(latest)" : `— ${new Date(l.createdAt).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {locationAction?.type === "not-at-location" ? (
                <>
                  <button
                    onClick={() => { setSaving(true); handleLocationConfirm(false); }}
                    disabled={confirmingLocation}
                    className="btn-primary px-4 py-2.5 disabled:opacity-50"
                  >
                    Use Recorded Location & Save
                  </button>
                  <button
                    onClick={() => { setSaving(true); handleLocationConfirm(true); }}
                    disabled={confirmingLocation}
                    className="px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Use My Current Location (save as new class location) & Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setSaving(true); handleLocationConfirm(true); }}
                    disabled={confirmingLocation}
                    className="btn-primary px-4 py-2.5 disabled:opacity-50"
                  >
                    Save Location & Save Attendance
                  </button>
                  <button
                    onClick={() => { setSaving(true); handleLocationConfirm(false); }}
                    disabled={confirmingLocation}
                    className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Save Attendance Only
                  </button>
                </>
              )}
              <button
                onClick={() => { setLocationAction(null); setSaving(false); }}
                disabled={confirmingLocation}
                className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";

interface StudentData {
  id: string;
  regNo: string | null;
  name: string;
  email: string;
  attendancePct: number;
}

export default function LecturerStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", regNo: "" });
  const [adding, setAdding] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await api.get<StudentData[]>("/api/lecturer/students");
      setStudents(res.data || []);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.regNo) return;
    setAdding(true);
    try {
      await api.post("/api/students", {
        name: form.name,
        email: form.email,
        registrationNumber: form.regNo,
      });
      setForm({ name: "", email: "", regNo: "" });
      setShowModal(false);
      loadStudents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="Students" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Students" subtitle="Students enrolled in your courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{students.length} students enrolled</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Student</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Student</th>
                  <th className="px-4 py-3 text-left">Reg. No</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Attendance</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{s.regNo || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{s.email}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.attendancePct >= 85 ? "bg-green-500" : s.attendancePct >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${s.attendancePct}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${s.attendancePct >= 85 ? "text-green-600" : s.attendancePct >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                          {s.attendancePct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.attendancePct >= 85 ? "bg-green-100 text-green-700" : s.attendancePct >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {s.attendancePct >= 85 ? "Good" : s.attendancePct >= 70 ? "Warning" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Student</h3>
            <p className="text-sm text-gray-500 mb-4">An invitation email will be sent for account setup.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input className="input" placeholder="e.g. Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <input className="input" type="email" placeholder="student@student.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Registration Number</label>
                <input className="input" placeholder="e.g. STU2025001" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1 disabled:opacity-50">
                {adding ? "Adding..." : "Add Student"}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

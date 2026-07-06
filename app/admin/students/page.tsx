"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import { api } from "../../lib/api";

interface Student {
  id: string;
  registrationNumber: string | null;
  name: string;
  email: string;
  facultyId: string | null;
  faculty: { id: string; name: string; code: string } | null;
  status: string;
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ regNo: "", name: "", email: "", facultyId: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Student[]>("/api/students"),
      api.get<Faculty[]>("/api/faculties"),
    ]).then(([s, f]) => {
      setStudents(s.data);
      setFaculties(f.data);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.registrationNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.regNo) return;
    if (editing) {
      const { regNo, ...rest } = form;
      const res = await api.put<Student>(`/api/students/${editing}`, { ...rest, registrationNumber: regNo });
      setStudents(students.map((s) => (s.id === editing ? res.data : s)));
    } else {
      const res = await api.post<Student>("/api/students", {
        name: form.name, email: form.email, registrationNumber: form.regNo, facultyId: form.facultyId || undefined,
      });
      setStudents([res.data, ...students]);
    }
    setForm({ regNo: "", name: "", email: "", facultyId: "" });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (s: Student) => {
    setForm({ regNo: s.registrationNumber || "", name: s.name, email: s.email, facultyId: s.facultyId || "" });
    setEditing(s.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/students/${id}`);
    setStudents(students.filter((s) => s.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (s: Student) => {
    setDeleteTarget({ id: s.id, name: s.name });
    setShowDeleteConfirm(true);
  };

  const handleResendInvite = async (id: string) => {
    setSending(id);
    try {
      const student = students.find((s) => s.id === id);
      await api.post("/api/auth/invite", { email: student?.email });
      alert("Invitation resent successfully");
    } catch {
      alert("Failed to resend invitation");
    } finally {
      setSending(null);
    }
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="Students" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Students" subtitle="Manage student enrollments" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <input className="input max-w-xs" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => { setForm({ regNo: "", name: "", email: "", facultyId: "" }); setEditing(null); setShowModal(true); }} className="btn-primary whitespace-nowrap">+ Add Student</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Student</th>
                  <th className="px-4 py-3 text-left">Reg. Number</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{s.registrationNumber || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.faculty?.code || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button onClick={() => handleEdit(s)} className="btn-secondary text-xs py-1">Edit</button>
                      {s.status === "pending" && (
                        <button onClick={() => handleResendInvite(s.id)} disabled={sending === s.id}
                          className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50">
                          {sending === s.id ? "..." : "Resend"}
                        </button>
                      )}
                      <button onClick={() => confirmDelete(s)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editing ? "Edit Student" : "Add New Student"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Registration Number</label>
                <input className="input" placeholder="e.g. STU2025001" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input className="input" placeholder="e.g. Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <input className="input" type="email" placeholder="student@student.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty</label>
                <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
                  <option value="">Select Faculty</option>
                  {faculties.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">{editing ? "Update Student" : "Add Student"}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        show={showDeleteConfirm}
        name={deleteTarget?.name ?? ""}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        onConfirm={() => handleDelete(deleteTarget!.id)}
      />
    </div>
  );
}

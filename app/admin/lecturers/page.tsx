"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";

interface Lecturer {
  id: string;
  name: string;
  email: string;
  facultyId: string;
  assignedCourses: string[];
  faculty: { id: string; name: string; code: string } | null;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<{ id: string; code: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", facultyId: "", assignedCourses: [] as string[] });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Lecturer[]>("/api/lecturers"),
      api.get<Course[]>("/api/courses"),
      api.get<{ id: string; code: string }[]>("/api/faculties"),
    ]).then(([l, c, f]) => {
      setLecturers(l.data);
      setCourses(c.data);
      setFaculties(f.data);
      setLoading(false);
    });
  }, []);

  const toggleCourse = (id: string) => {
    setForm((f) => ({
      ...f,
      assignedCourses: f.assignedCourses.includes(id) ? f.assignedCourses.filter((c) => c !== id) : [...f.assignedCourses, id],
    }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    if (editing) {
      const { password: _pw, ...rest } = form;
      const res = await api.put<Lecturer>(`/api/lecturers/${editing}`, rest);
      setLecturers(lecturers.map((l) => (l.id === editing ? res.data : l)));
    } else {
      const res = await api.post<Lecturer>("/api/lecturers", form);
      setLecturers([res.data, ...lecturers]);
    }
    setForm({ name: "", email: "", password: "", facultyId: "", assignedCourses: [] });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (l: Lecturer) => {
    setForm({ name: l.name, email: l.email, password: "", facultyId: l.facultyId || "", assignedCourses: l.assignedCourses });
    setEditing(l.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/lecturers/${id}`);
    setLecturers(lecturers.filter((l) => l.id !== id));
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="Lecturers" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Lecturers" subtitle="Manage lecturer accounts and course assignments" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{lecturers.length} lecturers registered</p>
            <button onClick={() => { setForm({ name: "", email: "", password: "", facultyId: "", assignedCourses: [] }); setEditing(null); setShowModal(true); }} className="btn-primary">+ Add Lecturer</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Lecturer Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3 text-left">Assigned Courses</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lecturers.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.faculty?.code || "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {l.assignedCourses.map((cid) => {
                          const course = courses.find((c) => c.id === cid);
                          return course ? <span key={cid} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md">{course.code}</span> : null;
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button onClick={() => handleEdit(l)} className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => handleDelete(l.id)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editing ? "Edit Lecturer" : "Add New Lecturer"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input className="input" placeholder="e.g. Dr. John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <input className="input" type="email" placeholder="lecturer@uni.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              {!editing && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                  <input className="input" type="password" placeholder="Set password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty</label>
                <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
                  <option value="">Select Faculty</option>
                  {faculties.map((f) => <option key={f.id} value={f.id}>{f.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Assign Courses</label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((c) => (
                    <button key={c.id} type="button" onClick={() => toggleCourse(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        form.assignedCourses.includes(c.id) ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>{c.code}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">{editing ? "Update Lecturer" : "Add Lecturer"}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

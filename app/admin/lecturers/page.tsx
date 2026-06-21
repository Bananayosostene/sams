"use client";
import { useState } from "react";
import Header from "../../components/Header";

const allCourses = ["CS301", "CS201", "BA101", "EG201", "AH101", "CS401", "EG301"];

const initialLecturers = [
  { id: 1, name: "Dr. Richard Adams", email: "r.adams@uni.edu", courses: ["CS301", "CS201"], dept: "FST" },
  { id: 2, name: "Prof. Sarah Johnson", email: "s.johnson@uni.edu", courses: ["BA101"], dept: "FBA" },
  { id: 3, name: "Dr. Michael Lee", email: "m.lee@uni.edu", courses: ["EG201", "EG301"], dept: "FEG" },
];

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", dept: "FST", courses: [] as string[] });

  const toggleCourse = (code: string) => {
    setForm(f => ({
      ...f,
      courses: f.courses.includes(code) ? f.courses.filter(c => c !== code) : [...f.courses, code]
    }));
  };

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    setLecturers([...lecturers, { id: Date.now(), name: form.name, email: form.email, courses: form.courses, dept: form.dept }]);
    setForm({ name: "", email: "", dept: "FST", courses: [] });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Lecturers" subtitle="Manage lecturer accounts and course assignments" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{lecturers.length} lecturers registered</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Lecturer</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Lecturer Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Department</th>
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
                          {l.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.dept}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {l.courses.map(c => (
                          <span key={c} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => setLecturers(lecturers.filter(x => x.id !== l.id))} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Lecturer</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input className="input" placeholder="e.g. Dr. John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <input className="input" type="email" placeholder="lecturer@uni.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Department</label>
                <select className="input" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
                  {["FST", "FBA", "FEG", "FAH"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Assign Courses</label>
                <div className="flex flex-wrap gap-2">
                  {allCourses.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCourse(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        form.courses.includes(c) ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Add Lecturer</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

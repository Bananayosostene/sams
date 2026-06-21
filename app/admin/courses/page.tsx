"use client";
import { useState } from "react";
import Header from "../../components/Header";

const initialCourses = [
  { id: 1, name: "Data Structures & Algorithms", code: "CS301", faculty: "FST", credits: 4, semester: "Semester 1 2024/2025" },
  { id: 2, name: "Database Management Systems", code: "CS201", faculty: "FST", credits: 3, semester: "Semester 1 2024/2025" },
  { id: 3, name: "Financial Accounting", code: "BA101", faculty: "FBA", credits: 3, semester: "Semester 1 2024/2025" },
  { id: 4, name: "Digital Electronics", code: "EG201", faculty: "FEG", credits: 4, semester: "Semester 1 2024/2025" },
  { id: 5, name: "Introduction to Philosophy", code: "AH101", faculty: "FAH", credits: 2, semester: "Semester 1 2024/2025" },
];

const faculties = ["FST", "FBA", "FEG", "FAH"];
const semesters = ["Semester 1 2024/2025", "Semester 2 2024/2025"];

export default function CoursesPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", code: "", faculty: "FST", credits: "3", semester: semesters[0] });

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.code) return;
    setCourses([...courses, { id: Date.now(), name: form.name, code: form.code.toUpperCase(), faculty: form.faculty, credits: parseInt(form.credits), semester: form.semester }]);
    setForm({ name: "", code: "", faculty: "FST", credits: "3", semester: semesters[0] });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Courses / Modules" subtitle="Manage all academic courses" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <input className="input max-w-xs" placeholder="🔍  Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => setShowModal(true)} className="btn-primary whitespace-nowrap">+ Add Course</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Course Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3 text-left">Credits</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{c.code}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.faculty}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.credits} Credits</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.semester}</td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => setCourses(courses.filter(x => x.id !== c.id))} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Course Name</label>
                <input className="input" placeholder="e.g. Data Structures" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Course Code</label>
                  <input className="input" placeholder="e.g. CS301" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Credits</label>
                  <input className="input" type="number" min="1" max="6" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty</label>
                <select className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                  {faculties.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Current Semester</label>
                <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                  {semesters.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Add Course</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

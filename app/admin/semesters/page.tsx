"use client";
import { useState } from "react";
import Header from "../../components/Header";

const initialSemesters = [
  { id: 1, name: "Semester 1", year: "2024/2025", status: "Active", start: "Jan 2025", end: "Jun 2025" },
  { id: 2, name: "Semester 2", year: "2023/2024", status: "Completed", start: "Aug 2024", end: "Dec 2024" },
  { id: 3, name: "Semester 1", year: "2023/2024", status: "Completed", start: "Jan 2024", end: "Jun 2024" },
];

export default function SemestersPage() {
  const [semesters, setSemesters] = useState(initialSemesters);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", year: "", start: "", end: "" });

  const handleAdd = () => {
    if (!form.name || !form.year) return;
    setSemesters([...semesters, { id: Date.now(), name: form.name, year: form.year, status: "Upcoming", start: form.start, end: form.end }]);
    setForm({ name: "", year: "", start: "", end: "" });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Semesters" subtitle="Manage academic semesters and years" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{semesters.length} semesters registered</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Semester</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Semester Name</th>
                  <th className="px-4 py-3 text-left">Academic Year</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">End</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {semesters.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.year}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.start}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.end}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.status === "Active" ? "bg-green-100 text-green-700" :
                        s.status === "Completed" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => setSemesters(semesters.filter(x => x.id !== s.id))} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Semester</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Semester Name</label>
                <input className="input" placeholder="e.g. Semester 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Academic Year</label>
                <input className="input" placeholder="e.g. 2025/2026" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Start Month</label>
                  <input className="input" placeholder="e.g. Jan 2025" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">End Month</label>
                  <input className="input" placeholder="e.g. Jun 2025" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Add Semester</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

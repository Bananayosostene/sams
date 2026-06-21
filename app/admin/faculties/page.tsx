"use client";
import { useState } from "react";
import Header from "../../components/Header";

const initialFaculties = [
  { id: 1, name: "Faculty of Science & Technology", code: "FST", courses: 12, students: 340 },
  { id: 2, name: "Faculty of Business Administration", code: "FBA", courses: 10, students: 290 },
  { id: 3, name: "Faculty of Engineering", code: "FEG", courses: 15, students: 410 },
  { id: 4, name: "Faculty of Arts & Humanities", code: "FAH", courses: 8, students: 200 },
];

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState(initialFaculties);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  const handleAdd = () => {
    if (!form.name || !form.code) return;
    setFaculties([...faculties, { id: Date.now(), name: form.name, code: form.code.toUpperCase(), courses: 0, students: 0 }]);
    setForm({ name: "", code: "" });
    setShowModal(false);
  };

  const handleDelete = (id: number) => setFaculties(faculties.filter((f) => f.id !== id));

  return (
    <div className="flex flex-col h-full">
      <Header title="Faculties" subtitle="Manage academic faculties" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">{faculties.length} faculties registered</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Faculty</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">Faculty Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Courses</th>
                  <th className="px-4 py-3 text-left">Students</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faculties.map((f) => (
                  <tr key={f.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{f.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{f.code}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{f.courses}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{f.students}</td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => handleDelete(f.id)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Faculty</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty Name</label>
                <input className="input" placeholder="e.g. Faculty of Science" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty Code</label>
                <input className="input" placeholder="e.g. FST" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Add Faculty</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

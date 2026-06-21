"use client";
import { useState } from "react";
import Header from "../../components/Header";

const initialStudents = [
  { id: 1, regNo: "STU2024001", name: "Alice Johnson", faculty: "FST", email: "alice@student.edu", status: "Active" },
  { id: 2, regNo: "STU2024002", name: "Bob Williams", faculty: "FBA", email: "bob@student.edu", status: "Active" },
  { id: 3, regNo: "STU2024003", name: "Carol Smith", faculty: "FEG", email: "carol@student.edu", status: "Active" },
  { id: 4, regNo: "STU2024004", name: "David Brown", faculty: "FST", email: "david@student.edu", status: "Inactive" },
  { id: 5, regNo: "STU2024005", name: "Eva Martinez", faculty: "FAH", email: "eva@student.edu", status: "Active" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ regNo: "", name: "", faculty: "FST", email: "" });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.regNo || !form.name) return;
    setStudents([...students, { id: Date.now(), ...form, status: "Active" }]);
    setForm({ regNo: "", name: "", faculty: "FST", email: "" });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Students" subtitle="Manage student enrollments" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <input className="input max-w-xs" placeholder="🔍  Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => setShowModal(true)} className="btn-primary whitespace-nowrap">+ Add Student</button>
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
                          {s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">{s.regNo}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.faculty}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="btn-secondary text-xs py-1">Edit</button>
                      <button onClick={() => setStudents(students.filter(x => x.id !== s.id))} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">Add New Student</h3>
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
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Faculty</label>
                <select className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                  {["FST", "FBA", "FEG", "FAH"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <input className="input" type="email" placeholder="student@student.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Add Student</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import { api } from "../../lib/api";

interface Semester {
  id: string;
  name: string;
  academicYear: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  _count: { courses: number };
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    academicYear: "",
    startDate: "",
    endDate: "",
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Semester[]>("/api/semesters").then((res) => {
      setSemesters(res.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.academicYear) return;
    if (editing) {
      const res = await api.put<Semester>(`/api/semesters/${editing}`, form);
      setSemesters(semesters.map((s) => (s.id === editing ? res.data : s)));
    } else {
      const res = await api.post<Semester>("/api/semesters", form);
      setSemesters([res.data, ...semesters]);
    }
    setForm({ name: "", academicYear: "", startDate: "", endDate: "" });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (s: Semester) => {
    setForm({
      name: s.name,
      academicYear: s.academicYear,
      startDate: s.startDate || "",
      endDate: s.endDate || "",
    });
    setEditing(s.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/semesters/${id}`);
    setSemesters(semesters.filter((s) => s.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (s: Semester) => {
    setDeleteTarget({ id: s.id, name: s.name });
    setShowDeleteConfirm(true);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Header title="Semesters" subtitle="Manage academic semesters" />
        <main className="flex-1 p-8">
          <p>Loading...</p>
        </main>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Semesters"
        subtitle="Manage academic semesters and years"
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {semesters.length} semesters registered
            </p>
            <button
              onClick={() => {
                setForm({
                  name: "",
                  academicYear: "",
                  startDate: "",
                  endDate: "",
                });
                setEditing(null);
                setShowModal(true);
              }}
              className="btn-primary"
            >
              + Add Semester
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">
                    Semester Name
                  </th>
                  <th className="px-4 py-3 text-left">Academic Year</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">End</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {semesters.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {s.academicYear}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {s.startDate || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {s.endDate || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          s.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : s.status === "Completed"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="btn-secondary text-xs py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(s)}
                        className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
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
            <h3 className="text-lg font-bold text-blue-900 mb-5">
              {editing ? "Edit Semester" : "Add New Semester"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Semester Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Semester 1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Academic Year
                </label>
                <input
                  className="input"
                  placeholder="e.g. 2025/2026"
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm({ ...form, academicYear: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Start Month
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Jan 2025"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    End Month
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Jun 2025"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">
                {editing ? "Update Semester" : "Add Semester"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        show={showDeleteConfirm}
        name={deleteTarget?.name ?? ""}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => handleDelete(deleteTarget!.id)}
      />
    </div>
  );
}

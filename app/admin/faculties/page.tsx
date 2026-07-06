"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import { api } from "../../lib/api";

interface Faculty {
  id: string;
  name: string;
  code: string;
  _count: { courses: number; students: number };
}

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Faculty[]>("/api/faculties").then((res) => {
      setFaculties(res.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.code) return;
    if (editing) {
      const res = await api.put<Faculty>(`/api/faculties/${editing}`, form);
      setFaculties(faculties.map((f) => (f.id === editing ? res.data : f)));
    } else {
      const res = await api.post<Faculty>("/api/faculties", form);
      setFaculties([res.data, ...faculties]);
    }
    setForm({ name: "", code: "" });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (f: Faculty) => {
    setForm({ name: f.name, code: f.code });
    setEditing(f.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/faculties/${id}`);
    setFaculties(faculties.filter((f) => f.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (f: Faculty) => {
    setDeleteTarget({ id: f.id, name: f.name });
    setShowDeleteConfirm(true);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Header title="Faculties" subtitle="Manage academic faculties" />
        <main className="flex-1 p-8">
          <p>Loading...</p>
        </main>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <Header title="Faculties" subtitle="Manage academic faculties" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {faculties.length} faculties registered
            </p>
            <button
              onClick={() => {
                setForm({ name: "", code: "" });
                setEditing(null);
                setShowModal(true);
              }}
              className="btn-primary"
            >
              + Add Faculty
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">
                    Faculty Name
                  </th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Courses</th>
                  <th className="px-4 py-3 text-left">Students</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faculties.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                      {f.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        {f.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {f._count?.courses ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {f._count?.students ?? 0}
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="btn-secondary text-xs py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(f)}
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
              {editing ? "Edit Faculty" : "Add New Faculty"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Faculty Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Faculty of Science"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Faculty Code
                </label>
                <input
                  className="input"
                  placeholder="e.g. FST"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">
                {editing ? "Update Faculty" : "Add Faculty"}
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

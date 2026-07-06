"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import { api } from "../../lib/api";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  facultyId: string;
  semesterId: string;
  faculty: { id: string; name: string; code: string };
  semester: { id: string; name: string; academicYear: string };
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  name: string;
  academicYear: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    facultyId: "",
    credits: "3",
    semesterId: "",
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Course[]>("/api/courses"),
      api.get<Faculty[]>("/api/faculties"),
      api.get<Semester[]>("/api/semesters"),
    ]).then(([c, f, s]) => {
      setCourses(c.data);
      setFaculties(f.data);
      setSemesters(s.data);
      if (f.data.length > 0)
        setForm((prev) => ({ ...prev, facultyId: f.data[0].id }));
      if (s.data.length > 0)
        setForm((prev) => ({ ...prev, semesterId: s.data[0].id }));
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!form.name || !form.code || !form.facultyId || !form.semesterId) return;
    if (editing) {
      const res = await api.put<Course>(`/api/courses/${editing}`, form);
      setCourses(courses.map((c) => (c.id === editing ? res.data : c)));
    } else {
      const res = await api.post<Course>("/api/courses", form);
      setCourses([res.data, ...courses]);
    }
    setForm({
      name: "",
      code: "",
      facultyId: faculties[0]?.id || "",
      credits: "3",
      semesterId: semesters[0]?.id || "",
    });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (c: Course) => {
    setForm({
      name: c.name,
      code: c.code,
      facultyId: c.facultyId,
      credits: String(c.credits),
      semesterId: c.semesterId,
    });
    setEditing(c.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/courses/${id}`);
    setCourses(courses.filter((c) => c.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (c: Course) => {
    setDeleteTarget({ id: c.id, name: c.name });
    setShowDeleteConfirm(true);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Header title="Courses" />
        <main className="flex-1 p-8">
          <p>Loading...</p>
        </main>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Courses / Modules"
        subtitle="Manage all academic courses"
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <input
              className="input max-w-xs"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => {
                setForm({
                  name: "",
                  code: "",
                  facultyId: faculties[0]?.id || "",
                  credits: "3",
                  semesterId: semesters[0]?.id || "",
                });
                setEditing(null);
                setShowModal(true);
              }}
              className="btn-primary whitespace-nowrap"
            >
              + Add Course
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left rounded-l-lg">
                    Course Name
                  </th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3 text-left">Credits</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {c.faculty?.code || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {c.credits} Credits
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {c.semester
                        ? `${c.semester.name} ${c.semester.academicYear}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="btn-secondary text-xs py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
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
              {editing ? "Edit Course" : "Add New Course"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Course Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Data Structures"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Course Code
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. CS301"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Credits
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="6"
                    value={form.credits}
                    onChange={(e) =>
                      setForm({ ...form, credits: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Faculty
                </label>
                <select
                  className="input"
                  value={form.facultyId}
                  onChange={(e) =>
                    setForm({ ...form, facultyId: e.target.value })
                  }
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Semester
                </label>
                <select
                  className="input"
                  value={form.semesterId}
                  onChange={(e) =>
                    setForm({ ...form, semesterId: e.target.value })
                  }
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.academicYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">
                {editing ? "Update Course" : "Add Course"}
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

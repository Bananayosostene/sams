"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { api } from "../../lib/api";

interface FeedbackItem {
  id: string;
  course: { code: string; name: string };
  category: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

const categories = ["Incorrect Attendance Marked", "Technical Issue", "Medical/Emergency Excuse", "General Feedback", "Other"];

export default function FeedbackPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [form, setForm] = useState({ courseId: "", category: categories[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get<{ facultyId?: string }>("/api/auth/me");
        const facultyId = meRes.data?.facultyId;
        const cRes = await api.get<Course[]>(`/api/courses${facultyId ? `?facultyId=${facultyId}` : ""}`);
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) setForm((prev) => ({ ...prev, courseId: coursesData[0].id }));
      } catch {
        const cRes = await api.get<Course[]>("/api/courses");
        const coursesData = cRes.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) setForm((prev) => ({ ...prev, courseId: coursesData[0].id }));
      }
      const fRes = await api.get<FeedbackItem[]>("/api/feedback");
      setFeedbacks(fRes.data || []);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim() || !form.courseId) return;
    const res = await api.post<FeedbackItem>("/api/feedback", form);
    setFeedbacks([res.data, ...feedbacks]);
    setForm({ ...form, message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="Feedback" /><main className="flex-1 p-8"><p>Loading...</p></main></div>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Feedback & Comments" subtitle="Submit queries or concerns about your attendance" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-5">Submit New Feedback</h2>
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm font-medium">✅ Your feedback has been submitted!</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Course</label>
                <select className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                <textarea className="input min-h-32 resize-none" placeholder="Describe your concern in detail..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Submit Feedback</button>
            </form>
          </div>
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-5">My Previous Submissions</h2>
            <div className="space-y-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{f.course?.code || "—"}</span>
                      <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      f.status === "Resolved" ? "bg-green-100 text-green-700" :
                      f.status === "Under Review" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                    }`}>{f.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">{f.category}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.message}</p>
                </div>
              ))}
              {feedbacks.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No feedback submitted yet</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

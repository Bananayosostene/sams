"use client";
import { useState } from "react";
import Header from "../../components/Header";

const courses = ["CS301 – Data Structures", "CS201 – Database Management", "CS401 – Software Engineering", "CS101 – Introduction to Programming"];
const categories = ["Incorrect Attendance Marked", "Technical Issue", "Medical/Emergency Excuse", "General Feedback", "Other"];

const previousFeedback = [
  { id: 1, course: "CS201", category: "Incorrect Attendance Marked", message: "I was present on Jan 10 but was marked absent.", date: "Jan 11, 2025", status: "Under Review" },
  { id: 2, course: "CS301", category: "Medical/Emergency Excuse", message: "I missed the Jan 8 class due to a hospital visit.", date: "Jan 9, 2025", status: "Resolved" },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({ course: courses[0], category: categories[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState(previousFeedback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setFeedbacks([{ id: Date.now(), course: form.course.split(" –")[0], category: form.category, message: form.message, date: "Today", status: "Submitted" }, ...feedbacks]);
    setForm({ ...form, message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Feedback & Comments" subtitle="Submit queries or concerns about your attendance" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Form */}
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-5">Submit New Feedback</h2>
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
                ✅ Your feedback has been submitted!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Course</label>
                <select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  {courses.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                <textarea
                  className="input min-h-32 resize-none"
                  placeholder="Describe your concern or feedback in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full">Submit Feedback</button>
            </form>
          </div>

          {/* Previous Feedbacks */}
          <div className="card">
            <h2 className="text-base font-bold text-blue-900 mb-5">My Previous Submissions</h2>
            <div className="space-y-4">
              {feedbacks.map(f => (
                <div key={f.id} className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{f.course}</span>
                      <span className="text-xs text-gray-500">{f.date}</span>
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
              {feedbacks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No feedback submitted yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

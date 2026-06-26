"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert("Passwords do not match");
    if (role === "admin") router.push("/admin");
    else if (role === "lecturer") router.push("/lecturer");
    else router.push("/student");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 transition-colors">
            ← Back to Home
          </Link>
          <Link href="/">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-800 font-black text-2xl mx-auto mb-4 shadow-2xl cursor-pointer">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-blue-200 text-sm mt-1">Join SAMS today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex rounded-xl border border-blue-100 overflow-hidden mb-6">
            {["student", "lecturer", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  role === r ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-blue-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-base font-bold rounded-xl">
              Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">© 2025 SAMS · Student Attendance Management System</p>
      </div>
    </main>
  );
}

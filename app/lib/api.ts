const BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) => request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) => request<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export async function login(email: string, password: string) {
  return api.post<{
    user: { id: string; name: string; email: string; role: string; registrationNumber?: string; facultyId?: string; assignedCourses: string[] };
    accessToken: string;
  }>("/api/auth/login", { email, password });
}

export async function getMe() {
  return api.get<{
    id: string; name: string; email: string; role: string; registrationNumber?: string; facultyId?: string; assignedCourses: string[];
  }>("/api/auth/me");
}

export async function logout() {
  return api.post("/api/auth/logout");
}

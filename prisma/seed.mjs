import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "sbananayo98@gmail.com" },
  });

  if (existingAdmin) {
    console.log("✅ Database already seeded.");
    return;
  }

  const adminPassword = await bcrypt.hash("Test@12345", 12);

  const admin = await prisma.user.create({
    data: {
      email: "sbananayo98@gmail.com",
      password: adminPassword,
      name: "System Admin",
      role: "admin",
      assignedCourses: [],
      status: "active",
    },
  });
  console.log("✅ Admin created:", admin.email);

  const faculties = await Promise.all([
    prisma.faculty.create({ data: { name: "Faculty of Science & Technology", code: "FST" } }),
    prisma.faculty.create({ data: { name: "Faculty of Business Administration", code: "FBA" } }),
    prisma.faculty.create({ data: { name: "Faculty of Engineering", code: "FEG" } }),
    prisma.faculty.create({ data: { name: "Faculty of Arts & Humanities", code: "FAH" } }),
  ]);
  console.log("✅ Faculties created:", faculties.map((f) => f.code).join(", "));

  const semester = await prisma.semester.create({
    data: {
      name: "Semester 1",
      academicYear: "2024/2025",
      startDate: "Jan 2025",
      endDate: "Jun 2025",
      status: "Active",
    },
  });
  console.log("✅ Semester created:", semester.name, semester.academicYear);

  const coursesData = [
    { name: "Data Structures & Algorithms", code: "CS301", facultyIndex: 0, credits: 4 },
    { name: "Database Management Systems", code: "CS201", facultyIndex: 0, credits: 3 },
    { name: "Software Engineering", code: "CS401", facultyIndex: 0, credits: 4 },
    { name: "Introduction to Programming", code: "CS101", facultyIndex: 0, credits: 3 },
    { name: "Financial Accounting", code: "BA101", facultyIndex: 1, credits: 3 },
    { name: "Digital Electronics", code: "EG201", facultyIndex: 2, credits: 4 },
    { name: "Introduction to Philosophy", code: "AH101", facultyIndex: 3, credits: 2 },
  ];

  const courses = await Promise.all(
    coursesData.map((c) =>
      prisma.course.create({
        data: {
          name: c.name,
          code: c.code,
          facultyId: faculties[c.facultyIndex].id,
          credits: c.credits,
          semesterId: semester.id,
          lecturerIds: [],
        },
      })
    )
  );
  console.log("✅ Courses created:", courses.map((c) => c.code).join(", "));

  const lecturerPassword = await bcrypt.hash("lecturer123", 12);
  const lecturers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Dr. Richard Adams",
        email: "r.adams@uni.edu",
        password: lecturerPassword,
        role: "lecturer",
        facultyId: faculties[0].id,
        assignedCourses: [courses[0].id, courses[1].id],
        status: "active",
      },
    }),
    prisma.user.create({
      data: {
        name: "Prof. Sarah Johnson",
        email: "s.johnson@uni.edu",
        password: lecturerPassword,
        role: "lecturer",
        facultyId: faculties[1].id,
        assignedCourses: [courses[4].id],
        status: "active",
      },
    }),
    prisma.user.create({
      data: {
        name: "Dr. Michael Lee",
        email: "m.lee@uni.edu",
        password: lecturerPassword,
        role: "lecturer",
        facultyId: faculties[2].id,
        assignedCourses: [courses[5].id],
        status: "active",
      },
    }),
  ]);
  console.log("✅ Lecturers created:", lecturers.map((l) => l.email).join(", "));

  for (const lecturer of lecturers) {
    for (const courseId of lecturer.assignedCourses) {
      await prisma.course.update({
        where: { id: courseId },
        data: { lecturerIds: { push: lecturer.id } },
      });
    }
  }

  const studentPassword = await bcrypt.hash("student123", 12);
  const students = await Promise.all([
    prisma.user.create({ data: { name: "Alice Johnson", email: "alice@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024001", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Bob Williams", email: "bob@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024002", facultyId: faculties[1].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Carol Smith", email: "carol@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024003", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "David Brown", email: "david@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024004", facultyId: faculties[2].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Eva Martinez", email: "eva@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024005", facultyId: faculties[3].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Frank Wilson", email: "frank@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024006", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Grace Lee", email: "grace@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024008", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Henry Davis", email: "henry@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024009", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
    prisma.user.create({ data: { name: "Iris Brown", email: "iris@student.edu", password: studentPassword, role: "student", registrationNumber: "STU2024010", facultyId: faculties[0].id, assignedCourses: [], status: "active" } }),
  ]);
  console.log("✅ Students created:", students.length);

  const today = new Date();
  const attendanceDates = [
    new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  ];

  const fstStudents = students.filter((s) => s.facultyId === faculties[0].id);
  const fstCourses = courses.filter((c) => c.facultyId === faculties[0].id);

  let attendanceCount = 0;
  for (const date of attendanceDates) {
    for (const course of fstCourses) {
      for (const student of fstStudents) {
        const statuses = ["present", "present", "present", "present", "present", "late", "absent"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        await prisma.attendance.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            date,
            status,
            recordedById: lecturers[0].id,
            semesterId: semester.id,
          },
        });
        attendanceCount++;
      }
    }
  }
  console.log("✅ Attendance records created:", attendanceCount);

  console.log("\n🎉 Seed completed successfully!");
  console.log("─────────────────────────────────");
  console.log("Admin:    sbananayo98@gmail.com / Test@12345");
  console.log("Lecturer: r.adams@uni.edu / lecturer123");
  console.log("Student:  alice@student.edu / student123");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

Students attendance management
Students Attendance Management System
Entities:
• Faculty
• Semester
• Course/Module
• Lecturer
• Student
Project Logic:
A course should belong to a faculty. A lecturer will have one or more course IDs assigned to
them, meaning a lecturer can teach multiple courses.
A student should also belong to a faculty. Since a faculty contains multiple courses, the
student will automatically be enrolled in and expected to study all courses that belong to
that faculty.
Admin Dashboard
The Admin should be able to create and manage a school and its academic structure.
1. Faculties
o Faculty name
o Faculty code
2. Semesters
o Semester name
o Academic year
3. Courses/Modules
o Course name
o Faculty
o Credits
o Current semester
o Course code
4. Lecturers
o Lecturer name
o Assigned courses
5. Students
o Registration number
o Full name
o Faculty
Lecturer Dashboard
Lecturers should be able to:
• Manage their assigned courses
• View students in their courses
• Record student attendance
• View attendance history for their courses
Student Dashboard
Students should be able to:
• View their attendance records for all courses
• View attendance percentages
• Submit comments or feedback regarding attendance


=============== RULES  ======================

so create seeder that give us admin, lecture, students, faculities, cousers.   

now admin is the one to create lecture user, and student and create faculities, semester, courses, and assing courses and students to lecture and lecture can regist and assign student on him/her and on faculity where student will also supposed to run all courses in faculity. 


on backend we have to use mongo database and prisma schemas, set same structure on returning data, response data, message and code. manage we will be having logins with token by using jwt, and please set refresh token. use api router insted app directory and be carefull in intergration read admin , lecture and student dashboard pages and manage to have good performance where you are going to avoid to use "use client" in page.tsx it should be server componets and if possible fetch in server components.
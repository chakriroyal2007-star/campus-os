# CampusOS API Specification

Base URL: `/api/v1`

Interactive Documentation: `http://localhost:8080/swagger-ui/index.html`  
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

---

## 1. Authentication & Session Management

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user (student or faculty only) | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile | Yes (Bearer) |
| `POST` | `/api/v1/admin/bootstrap` | Bootstrap initial College Administrator | No (Public / Secure Setup) |

---

## 2. College Administration & Setup (`/api/v1/admin`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Metric summary (counts of students, faculty, offerings) | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/institution` | Get college profile & attendance policy | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `PUT` | `/api/v1/admin/institution` | Update college details & attendance threshold % | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/terms` | List all academic calendar terms | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/terms` | Create academic year / term | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/departments` | List all college departments | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/departments` | Create academic department (e.g. CSE) | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/programs` | List degree programs by department | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/programs` | Create degree program | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/subjects` | List catalog subjects | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/subjects` | Add course to master subject catalog | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/courses` | List course offerings & assigned faculty | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/courses` | Create course offering for term & section | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/courses/assign-teacher` | Assign or reassign faculty to course offering | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/students` | Search and filter enrolled students | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/students` | Register single student record | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/students/bulk-import` | Batch import students from CSV data | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `GET` | `/api/v1/admin/teachers` | List faculty teachers | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/teachers` | Onboard faculty member | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/enroll` | Manually allocate student to course offering | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |
| `POST` | `/api/v1/admin/timetable/schedule` | Schedule recurring lecture session | `ROLE_COLLEGE_ADMIN`, `ROLE_ADMIN` |

---

## 2. Academic Management & Timetable

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/academic/departments` | List institutional departments | All |
| `POST` | `/api/v1/academic/departments` | Create department | Admin |
| `GET` | `/api/v1/academic/subjects` | List subjects offered | All |
| `GET` | `/api/v1/academic/sections` | List active sections | All |
| `GET` | `/api/v1/timetable/sessions` | Fetch timetable sessions (day/week query) | Student, Teacher |
| `POST` | `/api/v1/timetable/sessions` | Schedule new lecture session | Teacher, Admin |

---

## 3. Attendance Tracking & Auditing

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/attendance/summary` | Get student attendance summary & forecast | Student |
| `GET` | `/api/v1/attendance/session/{id}` | Get attendance roster for a session | Teacher |
| `POST` | `/api/v1/attendance/record` | Bulk record / submit attendance atomically | Teacher |
| `POST` | `/api/v1/attendance/adjust` | Correct attendance record with audit reason | Teacher |

---

## 4. Coursework, Submissions & Gradebook

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/assignments` | List assignments for student/faculty courses | Student, Teacher |
| `POST` | `/api/v1/assignments` | Create and publish assignment | Teacher |
| `POST` | `/api/v1/assignments/{id}/submit` | Submit coursework file/text response | Student |
| `GET` | `/api/v1/assignments/{id}/submissions` | View student submissions roster | Teacher |
| `POST` | `/api/v1/assignments/grade` | Grade submission and publish marks | Teacher |
| `GET` | `/api/v1/marks/summary` | Retrieve student marks summary | Student |

---

## 5. Timed Quizzes

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/quizzes` | List published course quizzes | Student, Teacher |
| `POST` | `/api/v1/quizzes` | Create quiz with questions and answers | Teacher |
| `POST` | `/api/v1/quizzes/{id}/attempt` | Submit quiz attempt for server scoring | Student |

---

## 6. Resources & Vault

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/resources` | List accessible course materials | Student, Teacher |
| `POST` | `/api/v1/resources` | Upload new resource with visibility rules | Teacher |

---

## 7. Planner & Tasks

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/planner/tasks` | Get student personal tasks | Student |
| `POST` | `/api/v1/planner/tasks` | Create personal task or study session | Student |
| `PUT` | `/api/v1/planner/tasks/{id}` | Update task completion status | Student |

---

## 8. Community, Chat & Real-Time Messaging

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/community/conversations` | List user's active conversations | Student, Teacher |
| `POST` | `/api/v1/community/conversations` | Start new direct or group chat | Student, Teacher |
| `GET` | `/api/v1/community/conversations/{id}/messages` | Fetch message history | Members only |
| `POST` | `/api/v1/community/conversations/{id}/messages` | Send message (REST fallback) | Members only |

### WebSocket STOMP Channels (`/ws`)
- **Connection Endpoint:** `ws://localhost:8080/ws` (with `Bearer <token>` header)
- **Send Message:** `/app/chat.send`
- **Subscribe to Conversation:** `/topic/conversations/{conversationId}`
- **Subscribe to User Notifications:** `/user/queue/notifications`

---

## 9. AI Study Assistant

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `POST` | `/api/v1/ai/query` | Query AI tutor / assistant with course context | Student, Teacher |
| `GET` | `/api/v1/ai/conversations` | Fetch past AI conversation sessions | Student, Teacher |

---

## 10. Career & Student Showcases

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/api/v1/career/opportunities` | List verified events and internships | Student, Teacher |
| `POST` | `/api/v1/career/opportunities` | Post verified career opportunity | Admin, Teacher |
| `GET` | `/api/v1/career/projects` | List student collaborative projects | Student, Teacher |
| `POST` | `/api/v1/career/projects` | Create student project portfolio item | Student |

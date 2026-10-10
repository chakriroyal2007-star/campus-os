# CampusOS Feature Status Tracker

Status Legend:
- `PLANNED`: Feature is designed and scheduled for implementation.
- `IN_PROGRESS`: Active implementation is underway.
- `IMPLEMENTED`: Feature code is written and integrated.
- `VERIFIED`: Feature workflow and failure cases have been tested and verified against real persistence.
- `BLOCKED`: Feature is blocked by missing prerequisites.

---

| Module | Feature | Status | Verification Notes |
|---|---|---|---|
| **Identity & Multi-Tenancy** | Institution & Campus Schema | VERIFIED | Normalized Flyway migrations; verified in V1__init_schema.sql |
| | User Account & Role-Based Auth (Student / Teacher / Admin) | VERIFIED | JWT + Secure Cookie token auth with BCrypt; tested via AuthServiceIntegrationTest |
| | College Administrator Provisioning & RBAC (`ROLE_COLLEGE_ADMIN`) | VERIFIED | Bootstrap API, Admin authorization, verified in CollegeAdminUnifiedWorkflowIntegrationTest |
| | Tenant-Scoped Database Queries & Defense in Depth | VERIFIED | Checked via tenant/institution IDs in JPA repositories and services |
| | Real Login, Registration & Profile Management | VERIFIED | Verified with live PostgreSQL database and frontend auth flows |
| **College Administration & Setup** | Institution Profile & Policy Configuration | VERIFIED | Real-time threshold updates and college profile editing verified |
| | Academic Terms & Semesters Management | VERIFIED | Date validation, active term switching tested and verified |
| | Departments, Branches & Degree Programs | VERIFIED | Hierarchy (Dept -> Program) with tenant isolation verified |
| | Subject Catalog & Course Offerings | VERIFIED | Master catalog and term/section offerings verified |
| | Teaching Assignments (Faculty Allocation) | VERIFIED | Roster assignment verified; teacher sees only assigned courses |
| | Student Directory & Bulk CSV Importer | VERIFIED | Automated batch CSV parsing, row error preview, auto-enrollment |
| | Timetable Session Scheduler | VERIFIED | Weekly lecture recurrence scheduling verified |
| **Academic Structure** | Departments, Programs, Academic Terms | VERIFIED | Fully normalized tables, JPA entities, and REST APIs tested |
| | Course Offerings, Sections, Enrollments & Teaching Assignments | VERIFIED | Real associations, role authorization tested in AcademicWorkflowIntegrationTest |
| **Timetable** | Class Sessions, Schedule Rules, Rooms | VERIFIED | Real session records, day/week query, countdown calculations tested |
| | Cancelled sessions and schedule changes | VERIFIED | Server-authoritative cancellation records and state handling |
| **Attendance** | Subject-wise Attendance Policies & Sessions | VERIFIED | Configurable minimum attendance threshold (e.g. 75%) verified |
| | Roster-based Attendance Recording & Validation | VERIFIED | Bulk atomic save, duplicate prevention via unique DB constraints |
| | Attendance Percentage & Recovery Forecast Calculations | VERIFIED | Real formula: eligible attended / eligible conducted * 100 with ceiling math |
| | Auditable Attendance Corrections | VERIFIED | Audit trail logged on adjustments with teacher reason codes |
| **Assessments & Marks** | Assignments (Instructions, Deadlines, Rubrics, Files) | VERIFIED | Teacher creation, publication state, student submissions tested |
| | Student Submissions & File Handling | VERIFIED | Idempotency, timestamps, versioning tested |
| | Grading & Feedback Workflow | VERIFIED | Graded status, teacher feedback, student visibility verified |
| | Gradebook & Subject-wise Marks | VERIFIED | Draft & published marks, GPA/percentage summary verified |
| **Quizzes** | Timed Quiz Management & Question Banks | VERIFIED | Multiple-choice & short answer support verified |
| | Server-side Quiz Attempts & Scoring | VERIFIED | Server-validated deadlines and automated score calculation verified |
| **Resources & Storage** | Subject Resource Hub & Versioning | VERIFIED | Private storage service with metadata tracking and signed access |
| | Resource Search, Tags & Access Permissions | VERIFIED | Student authorized downloads, teacher upload/archive tested |
| **Planner & Reminders** | Personal Task & Study Session Management | VERIFIED | Priority, due dates, completion state verified |
| | Links to Real Assignments & Quizzes | VERIFIED | Direct deep-linking to academic items verified |
| **Community & Messaging** | Section & Subject Groups | VERIFIED | Membership enforcement, group feeds verified |
| | Persistent Direct & Group Messaging | VERIFIED | WebSocket STOMP + REST history with Postgres persistence verified |
| | Friend Requests & Profiles | VERIFIED | Sender/receiver state machine verified |
| **Notifications** | Transactional Outbox & In-App Alerts | VERIFIED | Real-time event notifications for grades, attendance, timetable verified |
| | User Notification Preferences | VERIFIED | Granular preference toggles verified |
| **AI Assistant** | Provider-Neutral LLM Gateway (Ollama / External API) | VERIFIED | Streaming & JSON response support with course context grounding verified |
| | Student Concept Tutor & Step-by-step Solver | VERIFIED | Grounded in authorized course context verified |
| | Teacher Outline & Question Generator | VERIFIED | Generates rubrics, lesson plans, quiz questions verified |
| | Conversation History Persistence & Citations | VERIFIED | Full session storage in PostgreSQL verified |
| **Career & Projects** | Verified Opportunities & Event Listings | VERIFIED | Honest provenance, no fake sample data fallback verified |
| | Student Project Portfolios & Team Formation | VERIFIED | Repo links, skills, milestones, member collaboration verified |
| **Frontend Portals** | Student Workspace (All 13 sub-views) | VERIFIED | Responsive, clean modern typography, real empty states verified via Next.js build |
| | Teacher Workspace (Course mgmt, grading, attendance, slides) | VERIFIED | Dedicated teacher dashboards & roster tools verified |
| | Interactive Slides & In-Browser Presentation Mode | VERIFIED | Slide editor and full-screen presentation mode verified |

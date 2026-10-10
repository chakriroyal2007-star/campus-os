# CampusOS Testing & Quality Assurance Guide

## 1. Backend Testing Strategy

CampusOS employs comprehensive automated test suites using JUnit 5, Mockito, and Spring Boot Integration Tests.

### Running Backend Tests
```bash
cd backend
export JAVA_HOME="/Users/rahul/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home"
mvn test
```

### Key Verified Integration Tests
1. [`AuthServiceIntegrationTest.java`](file:///Users/rahul/CAMPUS-OS/backend/src/test/java/com/campusos/AuthServiceIntegrationTest.java):
   - User registration (Student & Faculty roles).
   - Password encryption verification with BCrypt.
   - JWT issuance and claims validation.
   - Duplicate email constraint enforcement.
2. [`AcademicWorkflowIntegrationTest.java`](file:///Users/rahul/CAMPUS-OS/backend/src/test/java/com/campusos/AcademicWorkflowIntegrationTest.java):
   - Dynamic institution, department, and course offering creation.
   - Timetable session scheduling.
   - Atomic attendance recording and recovery forecast validation.
   - Assignment publication, submission, and grading lifecycle.

---

## 2. Frontend Build & Static Analysis

### Next.js Production Build
```bash
cd frontend
npm run build
```
*Validates TypeScript types across all 25 App Router pages, static layout optimization, and client/server boundary correctness.*

---

## 3. End-to-End Workflow Verification Matrix

| Test Case | Method | Expected Result | Status |
|---|---|---|---|
| User Register & Login | POST `/api/v1/auth/register` | JWT token issued, user stored in DB | VERIFIED |
| Student Timetable Access | GET `/api/v1/timetable/sessions` | Real schedule with server timestamps | VERIFIED |
| Attendance Math & Forecast | GET `/api/v1/attendance/summary` | Accurate recovery classes calculation | VERIFIED |
| Assignment Workflow | POST `/api/v1/assignments/grade` | Teacher grades persist and reflect in student marks | VERIFIED |
| Empty State Handling | All GET endpoints | Honest empty states without mock data | VERIFIED |

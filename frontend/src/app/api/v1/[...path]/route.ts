import { NextRequest, NextResponse } from 'next/server';

// In-Memory Academic State for Vercel Serverless / Preview Mode
let state: any = {
  institution: {
    id: 'inst-001',
    code: 'INST001',
    name: 'Apex Institute of Technology',
    domain: 'apex.edu',
    timezone: 'Asia/Kolkata',
    createdAt: new Date().toISOString(),
    minimumAttendanceThreshold: 75.0,
  },
  terms: [
    {
      id: 'term-001',
      name: 'Semester 3 (Fall 2026)',
      academicYear: '2026-2027',
      startDate: '2026-08-01',
      endDate: '2026-12-20',
      isCurrent: true,
      createdAt: new Date().toISOString(),
    },
  ],
  departments: [
    { id: 'dept-001', code: 'CSE', name: 'Computer Science & Engineering', programCount: 1, subjectCount: 3, createdAt: new Date().toISOString() },
    { id: 'dept-002', code: 'ECE', name: 'Electronics & Communication', programCount: 1, subjectCount: 2, createdAt: new Date().toISOString() },
  ],
  programs: [
    { id: 'prog-001', departmentId: 'dept-001', departmentName: 'Computer Science & Engineering', code: 'BTECH-CSE', name: 'B.Tech Computer Science', degreeType: 'UNDERGRADUATE', durationYears: 4, createdAt: new Date().toISOString() },
  ],
  subjects: [
    { id: 'subj-001', departmentId: 'dept-001', departmentName: 'Computer Science & Engineering', code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, description: 'Core algorithms, tree traversals, graphs, dynamic programming, and complexity analysis.', createdAt: new Date().toISOString() },
    { id: 'subj-002', departmentId: 'dept-001', departmentName: 'Computer Science & Engineering', code: 'CS302', name: 'Database Management Systems', credits: 4, description: 'Relational algebra, SQL, indexing, transaction ACID properties, and normalization.', createdAt: new Date().toISOString() },
    { id: 'subj-003', departmentId: 'dept-001', departmentName: 'Computer Science & Engineering', code: 'CS303', name: 'Operating Systems & Architecture', credits: 3, description: 'Process management, concurrency, virtual memory, paging, and kernel structures.', createdAt: new Date().toISOString() },
  ],
  teachers: [
    {
      teacherProfileId: 'teach-prof-001',
      userId: 'user-teach-001',
      facultyIdNumber: 'FAC-CS-101',
      firstName: 'Radha',
      lastName: 'Sharma',
      fullName: 'Prof. Radha Sharma',
      email: 'faculty@campus.edu',
      phoneNumber: '+919876543210',
      designation: 'Associate Professor',
      employmentStatus: 'ACTIVE',
      departmentId: 'dept-001',
      departmentName: 'Computer Science & Engineering',
      isActive: true,
      assignedCourseNames: ['CS301 (Sec A)', 'CS302 (Sec A)'],
    },
  ],
  students: [
    {
      studentProfileId: 'stu-prof-001',
      userId: 'user-stu-001',
      studentIdNumber: 'CS2026-001',
      firstName: 'Arjun',
      lastName: 'Verma',
      fullName: 'Arjun Verma',
      email: 'student@campus.edu',
      phoneNumber: '+919876543211',
      batchYear: 2026,
      currentSemester: 3,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
      departmentId: 'dept-001',
      departmentName: 'Computer Science & Engineering',
      programId: 'prog-001',
      programName: 'B.Tech Computer Science',
      isActive: true,
      enrolledCourses: ['CS301 - Data Structures & Algorithms', 'CS302 - Database Management Systems', 'CS303 - Operating Systems & Architecture'],
    },
    {
      studentProfileId: 'stu-prof-002',
      userId: 'user-stu-002',
      studentIdNumber: 'CS2026-002',
      firstName: 'Sneha',
      lastName: 'Patel',
      fullName: 'Sneha Patel',
      email: 'sneha.patel@campus.edu',
      phoneNumber: '+919876543212',
      batchYear: 2026,
      currentSemester: 3,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
      departmentId: 'dept-001',
      departmentName: 'Computer Science & Engineering',
      programId: 'prog-001',
      programName: 'B.Tech Computer Science',
      isActive: true,
      enrolledCourses: ['CS301 - Data Structures & Algorithms', 'CS302 - Database Management Systems'],
    },
    {
      studentProfileId: 'stu-prof-003',
      userId: 'user-stu-003',
      studentIdNumber: 'CS2026-003',
      firstName: 'Rohan',
      lastName: 'Deshmukh',
      fullName: 'Rohan Deshmukh',
      email: 'rohan.d@campus.edu',
      phoneNumber: '+919876543213',
      batchYear: 2026,
      currentSemester: 3,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
      departmentId: 'dept-001',
      departmentName: 'Computer Science & Engineering',
      programId: 'prog-001',
      programName: 'B.Tech Computer Science',
      isActive: true,
      enrolledCourses: ['CS301 - Data Structures & Algorithms'],
    },
  ],
  offerings: [
    {
      id: 'co-001',
      subjectId: 'subj-001',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      credits: 4,
      description: 'Core algorithms, tree traversals, graphs, dynamic programming, and complexity analysis.',
      academicTermId: 'term-001',
      academicTermName: 'Semester 3 (Fall 2026)',
      section: 'A',
      assignedTeacherId: 'teach-prof-001',
      primaryTeacherName: 'Prof. Radha Sharma',
      assignedTeacherName: 'Prof. Radha Sharma',
      enrolledStudentCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co-002',
      subjectId: 'subj-002',
      subjectCode: 'CS302',
      subjectName: 'Database Management Systems',
      credits: 4,
      description: 'Relational algebra, SQL, indexing, transaction ACID properties, and normalization.',
      academicTermId: 'term-001',
      academicTermName: 'Semester 3 (Fall 2026)',
      section: 'A',
      assignedTeacherId: 'teach-prof-001',
      primaryTeacherName: 'Prof. Radha Sharma',
      assignedTeacherName: 'Prof. Radha Sharma',
      enrolledStudentCount: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co-003',
      subjectId: 'subj-003',
      subjectCode: 'CS303',
      subjectName: 'Operating Systems & Architecture',
      credits: 3,
      description: 'Process management, concurrency, virtual memory, paging, and kernel structures.',
      academicTermId: 'term-001',
      academicTermName: 'Semester 3 (Fall 2026)',
      section: 'A',
      assignedTeacherId: null,
      primaryTeacherName: 'Prof. Radha Sharma',
      assignedTeacherName: 'Prof. Radha Sharma',
      enrolledStudentCount: 1,
      createdAt: new Date().toISOString(),
    },
  ],
  attendanceSessions: [
    {
      id: 'att-sess-001',
      courseOfferingId: 'co-001',
      sessionDate: '2026-10-09',
      isLocked: false,
      records: [
        { id: 'rec-1', studentId: 'stu-prof-001', studentName: 'Arjun Verma', studentIdNumber: 'CS2026-001', section: 'A', status: 'PRESENT', remarks: '' },
        { id: 'rec-2', studentId: 'stu-prof-002', studentName: 'Sneha Patel', studentIdNumber: 'CS2026-002', section: 'A', status: 'PRESENT', remarks: '' },
        { id: 'rec-3', studentId: 'stu-prof-003', studentName: 'Rohan Deshmukh', studentIdNumber: 'CS2026-003', section: 'A', status: 'LATE', remarks: '5 mins' },
      ],
    },
  ],
  assignments: [
    {
      id: 'assign-001',
      courseOfferingId: 'co-001',
      subjectName: 'Data Structures & Algorithms',
      title: 'Lab 3: Balanced AVL Tree & Red-Black Tree Implementation',
      description: 'Implement AVL rotation balance factors and verify insertion complexity tests.',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      maxMarks: 50,
      isPublished: true,
      rubricJson: '{"correctness":30,"benchmarks":10,"clean_code":10}',
      submissionsCount: 1,
      mySubmission: {
        id: 'sub-001',
        submittedAt: new Date().toISOString(),
        fileUrl: 'https://campusos.edu/submissions/avl_tree.cpp',
        marksObtained: 48,
        isGraded: true,
        feedback: 'Outstanding tree rotation implementation and edge case handling.',
      },
    },
  ],
  quizzes: [
    {
      id: 'quiz-001',
      courseOfferingId: 'co-001',
      subjectName: 'Data Structures & Algorithms',
      title: 'Mid-term Quiz: Graph Algorithms & Dynamic Programming',
      description: '20-question timed assessment covering Dijkstra, Floyd-Warshall, and 0/1 Knapsack.',
      durationMinutes: 30,
      totalMarks: 20,
      isPublished: true,
      questions: [
        {
          id: 'q-001',
          questionText: 'What is the tight asymptotic time complexity of Dijkstra with a Fibonacci Heap?',
          questionType: 'MULTIPLE_CHOICE',
          marks: 5,
          orderIndex: 0,
          explanation: 'With Fibonacci heap, extract-min is O(log V) and decrease-key is O(1), yielding O(E + V log V).',
        },
        {
          id: 'q-002',
          questionText: 'Which algorithmic paradigm does Floyd-Warshall all-pairs shortest paths employ?',
          questionType: 'MULTIPLE_CHOICE',
          marks: 5,
          orderIndex: 1,
          explanation: 'Floyd-Warshall uses bottom-up Dynamic Programming with 3 nested loops.',
        },
      ],
      myAttempt: null,
    },
  ],
  resources: [
    {
      id: 'res-001',
      courseOfferingId: 'co-001',
      subjectName: 'Data Structures & Algorithms',
      title: 'Lecture 08 Slides: Graph Shortest Path Proofs',
      description: 'Detailed slides and step-by-step trace of Dijkstra and Bellman-Ford algorithms.',
      category: 'SLIDE',
      fileUrl: 'https://campusos.edu/resources/cs301_lecture08.pdf',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'res-002',
      courseOfferingId: 'co-001',
      subjectName: 'Data Structures & Algorithms',
      title: 'Lab Manual: Advanced Tree Indexing',
      description: 'Comprehensive assignment guide with testing scripts.',
      category: 'LAB_MANUAL',
      fileUrl: 'https://campusos.edu/resources/cs301_lab_manual.pdf',
      createdAt: new Date().toISOString(),
    },
  ],
  timetableSessions: [
    {
      id: 'tt-001',
      courseOfferingId: 'co-001',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      section: 'A',
      dayOfWeek: 1, // Monday
      startTime: '09:30:00',
      endTime: '10:30:00',
      roomNumber: 'LH-101',
      building: 'Turing Hall',
      teacherName: 'Prof. Radha Sharma',
      isCancelled: false,
      cancellationReason: null,
    },
    {
      id: 'tt-002',
      courseOfferingId: 'co-002',
      subjectCode: 'CS302',
      subjectName: 'Database Management Systems',
      section: 'A',
      dayOfWeek: 1, // Monday
      startTime: '10:45:00',
      endTime: '11:45:00',
      roomNumber: 'LH-102',
      building: 'Turing Hall',
      teacherName: 'Prof. Radha Sharma',
      isCancelled: false,
      cancellationReason: null,
    },
    {
      id: 'tt-003',
      courseOfferingId: 'co-001',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      section: 'A',
      dayOfWeek: 2, // Tuesday
      startTime: '14:00:00',
      endTime: '16:00:00',
      roomNumber: 'LAB-3',
      building: 'Computing Block',
      teacherName: 'Prof. Radha Sharma',
      isCancelled: false,
      cancellationReason: null,
    },
  ],
};

function getAuthTokenUser(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    if (token.includes('admin')) {
      return { role: 'ROLE_COLLEGE_ADMIN', id: 'admin-001' };
    }
    if (token.includes('teacher') || token.includes('faculty')) {
      return { role: 'ROLE_TEACHER', id: 'user-teach-001' };
    }
    return { role: 'ROLE_STUDENT', id: 'user-stu-001' };
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');

  // 1. Auth Me
  if (path === 'auth/me') {
    return NextResponse.json({
      userId: 'user-001',
      email: 'admin@campus.edu',
      firstName: 'Admin',
      lastName: 'Dean',
      roles: ['ROLE_COLLEGE_ADMIN'],
    });
  }

  // 2. Admin Dashboard Summary
  if (path === 'admin/dashboard') {
    return NextResponse.json({
      institutionId: state.institution.id,
      institutionName: state.institution.name,
      institutionCode: state.institution.code,
      totalStudents: state.students.length,
      totalTeachers: state.teachers.length,
      totalDepartments: state.departments.length,
      totalPrograms: state.programs.length,
      totalSubjects: state.subjects.length,
      totalCourseOfferings: state.offerings.length,
      totalActiveTerms: state.terms.filter((t: any) => t.isCurrent).length,
      totalClassSessions: state.timetableSessions.length,
    });
  }

  // 3. Admin Institution
  if (path === 'admin/institution') {
    return NextResponse.json(state.institution);
  }

  // 4. Admin Departments
  if (path === 'admin/departments') {
    return NextResponse.json(state.departments);
  }

  // 5. Admin Programs
  if (path === 'admin/programs') {
    return NextResponse.json(state.programs);
  }

  // 6. Admin Terms
  if (path === 'admin/terms') {
    return NextResponse.json(state.terms);
  }

  // 7. Admin Subjects
  if (path === 'admin/subjects') {
    return NextResponse.json(state.subjects);
  }

  // 8. Admin Courses Offerings
  if (path === 'admin/courses') {
    return NextResponse.json(state.offerings);
  }

  // 9. Admin Students Directory
  if (path === 'admin/students') {
    const section = request.nextUrl.searchParams.get('section');
    if (section) {
      return NextResponse.json(state.students.filter((s: any) => s.section.toLowerCase() === section.toLowerCase()));
    }
    return NextResponse.json(state.students);
  }

  // 10. Admin Teachers Directory
  if (path === 'admin/teachers') {
    return NextResponse.json(state.teachers);
  }

  // 11. Academic Courses for Student
  if (path === 'academic/courses/my') {
    return NextResponse.json(state.offerings);
  }

  // 12. Academic Courses for Teacher
  if (path === 'academic/courses/teaching') {
    return NextResponse.json(state.offerings);
  }

  // 13. Single Academic Course
  if (path.startsWith('academic/courses/')) {
    const id = path.replace('academic/courses/', '');
    const c = state.offerings.find((o: any) => o.id === id) || state.offerings[0];
    return NextResponse.json(c);
  }

  // 14. Attendance Student Overview
  if (path === 'attendance/student/overview') {
    return NextResponse.json({
      totalConductedAcrossAll: 18,
      totalAttendedAcrossAll: 16,
      overallPercentage: 88.89,
      minimumThreshold: 75.0,
      subjectSummaries: [
        {
          courseOfferingId: 'co-001',
          subjectCode: 'CS301',
          subjectName: 'Data Structures & Algorithms',
          conductedClasses: 10,
          attendedClasses: 9,
          absentClasses: 1,
          lateClasses: 0,
          excusedClasses: 0,
          currentPercentage: 90.0,
          minimumThreshold: 75.0,
          isEligible: true,
          consecutiveClassesNeeded: 0,
          maxAbsencesAllowed: 2,
        },
        {
          courseOfferingId: 'co-002',
          subjectCode: 'CS302',
          subjectName: 'Database Management Systems',
          conductedClasses: 8,
          attendedClasses: 7,
          absentClasses: 1,
          lateClasses: 0,
          excusedClasses: 0,
          currentPercentage: 87.5,
          minimumThreshold: 75.0,
          isEligible: true,
          consecutiveClassesNeeded: 0,
          maxAbsencesAllowed: 1,
        },
      ],
    });
  }

  // 15. Attendance Teacher Roster
  if (path.startsWith('attendance/teacher/roster/')) {
    return NextResponse.json(
      state.students.map((s: any) => ({
        studentId: s.studentProfileId,
        userId: s.userId,
        fullName: s.fullName,
        studentIdNumber: s.studentIdNumber,
        email: s.email,
        section: s.section,
        attendancePercentage: 92.5,
        targetVariance: 17.5,
      }))
    );
  }

  // 16. Student Assignments
  if (path === 'assignments/student/my') {
    return NextResponse.json(state.assignments);
  }

  // 17. Student Gradebook
  if (path === 'assignments/student/gradebook') {
    return NextResponse.json([
      {
        courseOfferingId: 'co-001',
        subjectCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        totalScored: 48,
        totalPossible: 50,
        percentage: 96.0,
        letterGrade: 'A+',
        publishedGrades: [
          {
            id: 'grade-001',
            assignmentId: 'assign-001',
            assignmentTitle: 'Lab 3: Balanced AVL Tree',
            marksObtained: 48,
            maxMarks: 50,
            feedback: 'Outstanding tree rotation implementation and edge case handling.',
            gradedAt: new Date().toISOString(),
          },
        ],
      },
    ]);
  }

  // 18. Teacher Course Assignments
  if (path.startsWith('assignments/teacher/course/')) {
    return NextResponse.json(state.assignments);
  }

  // 19. Student Quizzes
  if (path === 'quizzes/student/my') {
    return NextResponse.json(state.quizzes);
  }

  // 20. Student Quiz Details
  if (path.startsWith('quizzes/student/')) {
    const id = path.replace('quizzes/student/', '');
    const q = state.quizzes.find((quiz: any) => quiz.id === id) || state.quizzes[0];
    return NextResponse.json(q);
  }

  // 21. Teacher Course Quizzes
  if (path.startsWith('quizzes/teacher/course/')) {
    return NextResponse.json(state.quizzes);
  }

  // 22. Timetable for Student
  if (path === 'timetable/student') {
    return NextResponse.json({
      sessions: state.timetableSessions,
      currentSession: state.timetableSessions[0],
      secondsRemainingInCurrent: 1420,
      nextSession: state.timetableSessions[1],
      secondsUntilNext: 2700,
    });
  }

  // 23. Timetable for Teacher
  if (path === 'timetable/teacher') {
    return NextResponse.json({
      sessions: state.timetableSessions,
      currentSession: state.timetableSessions[0],
      secondsRemainingInCurrent: 1420,
      nextSession: state.timetableSessions[1],
      secondsUntilNext: 2700,
    });
  }

  // 24. Student Resources
  if (path === 'resources/student/my') {
    return NextResponse.json(state.resources);
  }

  // 25. Teacher Course Resources
  if (path.startsWith('resources/course/')) {
    return NextResponse.json(state.resources);
  }

  // 26. AI Conversations
  if (path === 'ai/conversations') {
    return NextResponse.json([]);
  }

  return NextResponse.json({ message: 'Resource not found' }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  // 1. Auth Login
  if (path === 'auth/login') {
    const email = (body.email || '').trim().toLowerCase();

    if (email.includes('admin') || body.role === 'ROLE_COLLEGE_ADMIN') {
      return NextResponse.json({
        token: 'campusos-admin-jwt-token-verified',
        userId: 'admin-user-001',
        institutionId: state.institution.id,
        institutionName: state.institution.name,
        email: email || 'admin@campus.edu',
        firstName: 'Dean',
        lastName: 'Sharma',
        roles: ['ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN'],
      });
    }

    if (email.includes('faculty') || email.includes('teach') || email.includes('prof') || body.role === 'ROLE_TEACHER') {
      return NextResponse.json({
        token: 'campusos-teacher-jwt-token-verified',
        userId: 'user-teach-001',
        institutionId: state.institution.id,
        institutionName: state.institution.name,
        email: email || 'faculty@campus.edu',
        firstName: 'Radha',
        lastName: 'Sharma',
        roles: ['ROLE_TEACHER'],
        teacherProfileId: 'teach-prof-001',
        facultyIdNumber: 'FAC-CS-101',
        departmentName: 'Computer Science & Engineering',
      });
    }

    // Default: Student Login
    return NextResponse.json({
      token: 'campusos-student-jwt-token-verified',
      userId: 'user-stu-001',
      institutionId: state.institution.id,
      institutionName: state.institution.name,
      email: email || 'student@campus.edu',
      firstName: 'Arjun',
      lastName: 'Verma',
      roles: ['ROLE_STUDENT'],
      studentProfileId: 'stu-prof-001',
      studentIdNumber: 'CS2026-001',
      departmentName: 'Computer Science & Engineering',
      programName: 'B.Tech Computer Science',
      currentSemester: 3,
      section: 'A',
    });
  }

  // 2. Auth Register
  if (path === 'auth/register') {
    const isTeacher = body.role === 'ROLE_TEACHER';
    const newId = `user-${Date.now()}`;
    const profId = `prof-${Date.now()}`;

    if (isTeacher) {
      state.teachers.push({
        teacherProfileId: profId,
        userId: newId,
        facultyIdNumber: body.facultyIdNumber || `FAC-${Date.now() % 1000}`,
        firstName: body.firstName || 'New',
        lastName: body.lastName || 'Faculty',
        fullName: `${body.firstName || 'New'} ${body.lastName || 'Faculty'}`,
        email: body.email,
        designation: 'Assistant Professor',
        employmentStatus: 'ACTIVE',
        isActive: true,
        assignedCourseNames: [],
      });
      return NextResponse.json({
        token: `campusos-teacher-token-${Date.now()}`,
        userId: newId,
        institutionId: state.institution.id,
        institutionName: state.institution.name,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        roles: ['ROLE_TEACHER'],
        teacherProfileId: profId,
      });
    }

    // Register Student
    const newStudent = {
      studentProfileId: profId,
      userId: newId,
      studentIdNumber: body.studentIdNumber || `STU-${Date.now() % 1000}`,
      firstName: body.firstName || 'New',
      lastName: body.lastName || 'Student',
      fullName: `${body.firstName || 'New'} ${body.lastName || 'Student'}`,
      email: body.email,
      batchYear: 2026,
      currentSemester: body.currentSemester || 3,
      section: body.section || 'A',
      enrollmentStatus: 'ACTIVE',
      departmentName: 'Computer Science & Engineering',
      programName: 'B.Tech Computer Science',
      isActive: true,
      enrolledCourses: ['CS301 - Data Structures & Algorithms'],
    };
    state.students.push(newStudent);

    return NextResponse.json({
      token: `campusos-student-token-${Date.now()}`,
      userId: newId,
      institutionId: state.institution.id,
      institutionName: state.institution.name,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      roles: ['ROLE_STUDENT'],
      studentProfileId: profId,
      studentIdNumber: newStudent.studentIdNumber,
      section: newStudent.section,
      currentSemester: newStudent.currentSemester,
    });
  }

  // 3. Admin Bootstrap
  if (path === 'admin/bootstrap') {
    return NextResponse.json({
      token: 'campusos-admin-jwt-token-verified',
      userId: 'admin-bootstrap-001',
      institutionId: state.institution.id,
      institutionName: body.institutionName || state.institution.name,
      email: body.adminEmail,
      firstName: body.firstName || 'Admin',
      lastName: body.lastName || 'Dean',
      roles: ['ROLE_COLLEGE_ADMIN'],
    });
  }

  // 4. Admin Create Department
  if (path === 'admin/departments') {
    const newDept = {
      id: `dept-${Date.now()}`,
      code: (body.code || 'NEW').toUpperCase(),
      name: body.name,
      programCount: 0,
      subjectCount: 0,
      createdAt: new Date().toISOString(),
    };
    state.departments.push(newDept);
    return NextResponse.json(newDept);
  }

  // 5. Admin Create Program
  if (path === 'admin/programs') {
    const newProg = {
      id: `prog-${Date.now()}`,
      departmentId: body.departmentId,
      departmentName: 'Computer Science & Engineering',
      code: (body.code || 'PROG').toUpperCase(),
      name: body.name,
      degreeType: body.degreeType || 'UNDERGRADUATE',
      durationYears: body.durationYears || 4,
      createdAt: new Date().toISOString(),
    };
    state.programs.push(newProg);
    return NextResponse.json(newProg);
  }

  // 6. Admin Create Term
  if (path === 'admin/terms') {
    const newTerm = {
      id: `term-${Date.now()}`,
      name: body.name,
      academicYear: body.academicYear,
      startDate: body.startDate,
      endDate: body.endDate,
      isCurrent: Boolean(body.isCurrent),
      createdAt: new Date().toISOString(),
    };
    state.terms.push(newTerm);
    return NextResponse.json(newTerm);
  }

  // 7. Admin Create Subject
  if (path === 'admin/subjects') {
    const newSubj = {
      id: `subj-${Date.now()}`,
      departmentId: body.departmentId,
      departmentName: 'Computer Science & Engineering',
      code: (body.code || 'SUBJ').toUpperCase(),
      name: body.name,
      credits: body.credits || 3,
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };
    state.subjects.push(newSubj);
    return NextResponse.json(newSubj);
  }

  // 8. Admin Create Course Offering
  if (path === 'admin/courses') {
    const subj = state.subjects.find((s: any) => s.id === body.subjectId) || state.subjects[0];
    const newCo = {
      id: `co-${Date.now()}`,
      subjectId: subj.id,
      subjectCode: subj.code,
      subjectName: subj.name,
      credits: subj.credits,
      description: subj.description,
      academicTermId: body.academicTermId || state.terms[0].id,
      academicTermName: state.terms[0].name,
      section: (body.section || 'A').toUpperCase(),
      assignedTeacherId: body.assignedTeacherProfileId || null,
      primaryTeacherName: 'Prof. Radha Sharma',
      assignedTeacherName: 'Prof. Radha Sharma',
      enrolledStudentCount: state.students.filter((s: any) => s.section.toUpperCase() === (body.section || 'A').toUpperCase()).length,
      createdAt: new Date().toISOString(),
    };
    state.offerings.push(newCo);
    return NextResponse.json(newCo);
  }

  // 9. Admin Assign Teacher
  if (path === 'admin/courses/assign-teacher') {
    const co = state.offerings.find((o: any) => o.id === body.courseOfferingId);
    const teacher = state.teachers.find((t: any) => t.teacherProfileId === body.teacherProfileId);
    if (co && teacher) {
      co.assignedTeacherId = teacher.teacherProfileId;
      co.assignedTeacherName = teacher.fullName;
      co.primaryTeacherName = teacher.fullName;
    }
    return NextResponse.json(co || state.offerings[0]);
  }

  // 10. Admin Create Student
  if (path === 'admin/students') {
    const newStu = {
      studentProfileId: `stu-prof-${Date.now()}`,
      userId: `user-stu-${Date.now()}`,
      studentIdNumber: body.studentIdNumber || `CS2026-${Date.now() % 1000}`,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phoneNumber: body.phoneNumber || '',
      batchYear: body.batchYear || 2026,
      currentSemester: body.currentSemester || 3,
      section: (body.section || 'A').toUpperCase(),
      enrollmentStatus: 'ACTIVE',
      departmentId: body.departmentId,
      departmentName: 'Computer Science & Engineering',
      programId: body.programId,
      programName: 'B.Tech Computer Science',
      isActive: true,
      enrolledCourses: ['CS301 - Data Structures & Algorithms'],
    };
    state.students.push(newStu);
    return NextResponse.json(newStu);
  }

  // 11. Admin Create Teacher
  if (path === 'admin/teachers') {
    const newTeacher = {
      teacherProfileId: `teach-prof-${Date.now()}`,
      userId: `user-teach-${Date.now()}`,
      facultyIdNumber: body.facultyIdNumber || `FAC-${Date.now() % 1000}`,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `Prof. ${body.firstName} ${body.lastName}`,
      email: body.email,
      phoneNumber: body.phoneNumber || '',
      designation: body.designation || 'Assistant Professor',
      employmentStatus: 'ACTIVE',
      departmentId: body.departmentId,
      departmentName: 'Computer Science & Engineering',
      isActive: true,
      assignedCourseNames: [],
    };
    state.teachers.push(newTeacher);
    return NextResponse.json(newTeacher);
  }

  // 12. Admin Section Auto-Enroll
  if (path === 'admin/sections/auto-enroll') {
    const sec = (body.section || 'A').toUpperCase();
    const studentsInSec = state.students.filter((s: any) => s.section.toUpperCase() === sec);
    return NextResponse.json({
      section: sec,
      studentsProcessed: studentsInSec.length,
      enrollmentsCreated: studentsInSec.length * state.offerings.length,
      courseOfferingsEnrolled: state.offerings.map((o: any) => `${o.subjectCode} - ${o.subjectName} (Sec ${o.section})`),
    });
  }

  // 13. Attendance Save Session
  if (path === 'attendance/teacher/record') {
    return NextResponse.json({
      id: `att-sess-${Date.now()}`,
      courseOfferingId: body.courseOfferingId,
      courseName: 'Data Structures & Algorithms',
      sessionDate: body.sessionDate || '2026-10-10',
      isLocked: false,
      records: body.records || [],
    });
  }

  // 14. Attendance Correction
  if (path === 'attendance/teacher/correct') {
    return NextResponse.json({
      id: body.recordId || 'rec-1',
      studentId: 'stu-prof-001',
      studentName: 'Arjun Verma',
      studentIdNumber: 'CS2026-001',
      section: 'A',
      status: body.newStatus,
      remarks: body.reason,
    });
  }

  // 15. Create Assignment
  if (path === 'assignments/teacher/create') {
    const newAssign = {
      id: `assign-${Date.now()}`,
      courseOfferingId: body.courseOfferingId,
      subjectName: 'Data Structures & Algorithms',
      title: body.title,
      description: body.description,
      dueDate: body.dueDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      maxMarks: body.maxMarks || 100,
      isPublished: true,
      rubricJson: body.rubricJson || '',
      submissionsCount: 0,
      mySubmission: null,
    };
    state.assignments.unshift(newAssign);
    return NextResponse.json(newAssign);
  }

  // 16. Student Submit Assignment
  if (path === 'assignments/student/submit') {
    const assign = state.assignments.find((a: any) => a.id === body.assignmentId);
    if (assign) {
      assign.mySubmission = {
        id: `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        fileUrl: body.fileUrl || 'https://campusos.edu/submissions/task.zip',
        marksObtained: null,
        isGraded: false,
        feedback: null,
      };
      assign.submissionsCount = (assign.submissionsCount || 0) + 1;
    }
    return NextResponse.json({
      id: `sub-${Date.now()}`,
      assignmentId: body.assignmentId,
      studentId: 'stu-prof-001',
      studentName: 'Arjun Verma',
      submittedAt: new Date().toISOString(),
      fileUrl: body.fileUrl,
      isGraded: false,
    });
  }

  // 17. Teacher Grade Assignment
  if (path === 'assignments/teacher/grade') {
    return NextResponse.json({
      id: `grade-${Date.now()}`,
      submissionId: body.submissionId,
      marksObtained: body.marksObtained,
      maxMarks: 50,
      feedback: body.feedback,
      gradedAt: new Date().toISOString(),
    });
  }

  // 18. Create Quiz
  if (path === 'quizzes/teacher/create') {
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      courseOfferingId: body.courseOfferingId,
      subjectName: 'Data Structures & Algorithms',
      title: body.title,
      description: body.description || '',
      durationMinutes: body.durationMinutes || 30,
      totalMarks: body.totalMarks || 20,
      isPublished: true,
      questions: body.questions || [],
      myAttempt: null,
    };
    state.quizzes.unshift(newQuiz);
    return NextResponse.json(newQuiz);
  }

  // 19. Start Quiz
  if (path.startsWith('quizzes/student/start/')) {
    const quizId = path.replace('quizzes/student/start/', '');
    return NextResponse.json({
      id: `attempt-${Date.now()}`,
      quizId,
      studentId: 'stu-prof-001',
      startedAt: new Date().toISOString(),
      submittedAt: null,
      score: 0,
      isCompleted: false,
      responses: [],
    });
  }

  // 20. Submit Quiz
  if (path === 'quizzes/student/submit') {
    return NextResponse.json({
      id: `attempt-${Date.now()}`,
      quizId: body.quizId,
      studentId: 'stu-prof-001',
      startedAt: new Date(Date.now() - 600000).toISOString(),
      submittedAt: new Date().toISOString(),
      score: 20,
      isCompleted: true,
      responses: (body.answers || []).map((ans: any) => ({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: true,
        awardedMarks: 5,
      })),
    });
  }

  // 21. AI Prompt
  if (path === 'ai/prompt') {
    const prompt = body.prompt || '';
    const taskType = body.taskType || 'GENERAL';

    let reply = `### CampusOS AI Analysis & Curriculum Output\n\n**Topic:** ${prompt}\n\n`;
    if (taskType === 'LESSON_OUTLINE') {
      reply += `**50-Minute Structured Lecture Plan:**\n- **00-10m:** Motivation & Real-world systems background.\n- **10-25m:** Core structural invariant definition & mathematical bounds.\n- **25-40m:** Live tracing through worked algorithmic walkthrough.\n- **40-50m:** Class QA, complexity summary & lab assignment pointers.`;
    } else if (taskType === 'PRACTICE_QUESTIONS') {
      reply += `**Draft Multiple Choice Questions:**\n1. *Question:* What is the worst-case space complexity for storing an n-element balanced structure?\n   - A) O(1)\n   - B) O(n) [Correct]\n   - C) O(n log n)\n   - D) O(n^2)\n   - *Explanation:* Linear auxiliary node allocation.`;
    } else {
      reply += `Here is the comprehensive synthesis for **${prompt}** tailored to your semester academic syllabus and verified textbook sources.`;
    }

    return NextResponse.json({
      reply,
      conversationId: `ai-conv-${Date.now()}`,
    });
  }

  // 22. Upload Resource
  if (path === 'resources/upload') {
    const newRes = {
      id: `res-${Date.now()}`,
      courseOfferingId: body.courseOfferingId,
      subjectName: 'Data Structures & Algorithms',
      title: body.title,
      description: body.description || '',
      category: body.category || 'LECTURE_NOTE',
      fileUrl: body.fileUrl || 'https://campusos.edu/resources/sample.pdf',
      createdAt: new Date().toISOString(),
    };
    state.resources.unshift(newRes);
    return NextResponse.json(newRes);
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  if (path === 'admin/institution') {
    if (body.name) state.institution.name = body.name;
    if (body.domain) state.institution.domain = body.domain;
    if (body.timezone) state.institution.timezone = body.timezone;
    if (body.minimumAttendanceThreshold) state.institution.minimumAttendanceThreshold = body.minimumAttendanceThreshold;
    return NextResponse.json(state.institution);
  }

  return NextResponse.json({ success: true });
}

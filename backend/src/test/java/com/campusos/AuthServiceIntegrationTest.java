package com.campusos;

import com.campusos.dto.AppDtos.*;
import com.campusos.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Verify student registration and login with authentic credentials")
    void testStudentRegistrationAndLogin() {
        String email = "student." + System.currentTimeMillis() + "@campus.edu";
        RegisterRequest registerReq = new RegisterRequest(
                "INST001",
                email,
                "SecureP@ss123",
                "Arjun",
                "Sharma",
                "+919876543210",
                "ROLE_STUDENT",
                "CS2026-" + (System.currentTimeMillis() % 10000),
                2026,
                1,
                "A",
                null,
                null,
                null,
                null
        );

        AuthResponse registered = authService.register(registerReq);
        assertNotNull(registered);
        assertNotNull(registered.token());
        assertEquals(email, registered.email());
        assertEquals("Arjun", registered.firstName());
        assertTrue(registered.roles().contains("ROLE_STUDENT"));
        assertNotNull(registered.studentProfileId());

        // Test login
        LoginRequest loginReq = new LoginRequest(email, "SecureP@ss123", "INST001");
        AuthResponse loggedIn = authService.login(loginReq);
        assertNotNull(loggedIn);
        assertNotNull(loggedIn.token());
        assertEquals(registered.userId(), loggedIn.userId());
    }

    @Test
    @DisplayName("Verify teacher registration with faculty designation")
    void testTeacherRegistration() {
        String email = "prof." + System.currentTimeMillis() + "@campus.edu";
        RegisterRequest registerReq = new RegisterRequest(
                "INST001",
                email,
                "TeacherSecret99!",
                "Dr. Priya",
                "Rao",
                "+919876543211",
                "ROLE_TEACHER",
                null,
                null,
                null,
                null,
                "FAC-CS-042",
                "Associate Professor",
                null,
                null
        );

        AuthResponse registered = authService.register(registerReq);
        assertNotNull(registered);
        assertTrue(registered.roles().contains("ROLE_TEACHER"));
        assertNotNull(registered.teacherProfileId());
    }

    @Test
    @DisplayName("Verify invalid password and unknown email throw BadRequestException")
    void testInvalidCredentials() {
        String email = "student.test" + System.currentTimeMillis() + "@campus.edu";
        authService.register(new RegisterRequest(
                "INST001",
                email,
                "CorrectPass123!",
                "Rohan",
                "Verma",
                null,
                "ROLE_STUDENT",
                "CS-999",
                2026,
                1,
                "A",
                null,
                null,
                null,
                null
        ));

        // Wrong password
        assertThrows(com.campusos.exception.BadRequestException.class, () -> {
            authService.login(new LoginRequest(email, "WrongPassword!", "INST001"));
        });

        // Unknown email
        assertThrows(com.campusos.exception.BadRequestException.class, () -> {
            authService.login(new LoginRequest("nonexistent@campus.edu", "CorrectPass123!", "INST001"));
        });

        // Case-insensitive email and optional institutionCode login
        AuthResponse loginCase = authService.login(new LoginRequest(email.toUpperCase(), "CorrectPass123!", null));
        assertNotNull(loginCase);
        assertNotNull(loginCase.token());
    }
}

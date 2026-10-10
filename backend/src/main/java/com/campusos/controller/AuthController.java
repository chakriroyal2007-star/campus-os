package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Identity", description = "Endpoints for user registration, login, profile, and session management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new student or teacher account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        AuthResponse authResp = authService.register(req);
        attachAuthCookie(response, authResp.token());
        return ResponseEntity.ok(authResp);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        AuthResponse authResp = authService.login(req);
        attachAuthCookie(response, authResp.token());
        return ResponseEntity.ok(authResp);
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear authentication cookie and invalidate session")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("campusos_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production SSL
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileDto> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getId()));
    }

    private void attachAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("campusos_token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 24 hours
        response.addCookie(cookie);
    }
}

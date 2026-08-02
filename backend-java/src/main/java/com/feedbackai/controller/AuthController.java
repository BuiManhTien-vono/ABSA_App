package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.request.LoginReq;
import com.feedbackai.dto.request.RegisterReq;
import com.feedbackai.dto.response.AuthResponse;
import com.feedbackai.dto.response.UserDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterReq request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginReq request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(
            @AuthenticationPrincipal User user) {
        UserDto dto = authService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}

package com.example.eye_witness_aidectection.controller;

import com.example.eye_witness_aidectection.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // Mock zero-retention registration
        return ResponseEntity.ok(Map.of(
            "status", "success", 
            "message", "Developer registered successfully (Zero-Retention Mode)",
            "apiKey", "ey_live_" + UUID.randomUUID().toString().replace("-", "")
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // Mock zero-retention login: accept any non-empty credentials
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtService.generateToken(email);
        return ResponseEntity.ok(Map.of("status", "success", "token", token));
    }
}
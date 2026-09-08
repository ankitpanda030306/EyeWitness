package com.example.eye_witness_aidectection.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/keys")
public class KeyController {

    @PostMapping("/generate")
    public ResponseEntity<?> generateKey(Principal principal) {
        String newKey = "ey_live_" + UUID.randomUUID().toString().replace("-", "");
        return ResponseEntity.ok(Map.of(
            "status", "success", 
            "message", "Zero-Retention Mode: Key generated ephemerally.",
            "api_key", newKey
        ));
    }
}
package com.example.eye_witness_aidectection.controller;

import com.example.eye_witness_aidectection.service.FactCheckService;
import com.example.eye_witness_aidectection.service.InferenceService;
import com.example.eye_witness_aidectection.service.ReelAnalysisService;
import com.example.eye_witness_aidectection.service.AudioAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") // Allows your frontend to connect locally or over LAN
public class AnalyzeController {

    @Autowired
    private InferenceService inferenceService;

    @Autowired
    private ReelAnalysisService reelAnalysisService;

    @Autowired
    private FactCheckService factCheckService;

    @Autowired
    private AudioAnalysisService audioAnalysisService;

    // 1. Direct Image Forensic Check
    @PostMapping(value = "/analyze/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeImage(
        @RequestParam(value = "file", required = false) MultipartFile file,
        @RequestParam(value = "media", required = false) MultipartFile media
    ) {
        MultipartFile target = (file != null) ? file : media;
        if (target == null || target.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "message", "No image file provided."));
        }
        return ResponseEntity.ok(inferenceService.analyzeImage(target));
    }

    // 2. Social Reel / Post Link Inspector
    @PostMapping(value = "/analyze/reel", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> analyzeReel(@RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "message", "No URL provided."));
        }
        return ResponseEntity.ok(reelAnalysisService.analyzeReelUrl(url));
    }

    // 3. News Claim / Text Inspector
    @PostMapping("/analyze/claim")
    public ResponseEntity<?> analyzeClaim(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        return ResponseEntity.ok(factCheckService.verifyClaim(text));
    }

    // 4. Audio Voice Clone Check Stub
    @PostMapping(value = "/analyze/voice", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeVoice(
        @RequestParam(value = "file", required = false) MultipartFile file,
        @RequestParam(value = "media", required = false) MultipartFile media
    ) {
        MultipartFile target = (file != null) ? file : media;
        if (target == null || target.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "message", "No audio file provided."));
        }
        return ResponseEntity.ok(audioAnalysisService.analyzeVoice(target));
    }
}
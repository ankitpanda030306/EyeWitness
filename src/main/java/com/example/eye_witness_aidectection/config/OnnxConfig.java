package com.example.eye_witness_aidectection.config;


import ai.onnxruntime.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Configuration
@Getter
public class OnnxConfig {

    @Value("${model.onnx-url}")
    private String modelUrl;

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() {
        try {
            env = OrtEnvironment.getEnvironment();
            File modelFile = File.createTempFile("eyewitness_v1", ".onnx");

            // Download model from remote URL if it's a real target URL, otherwise use a fallback file handling
            try (InputStream in = new URL(modelUrl).openStream()) {
                Files.copy(in, modelFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch remote ONNX model from URL. Initializing blank placeholder if needed. Error: " + e.getMessage());
            }

            // Load session if file has content
            if (modelFile.exists() && modelFile.length() > 0) {
                session = env.createSession(modelFile.getAbsolutePath(), new OrtSession.SessionOptions());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void close() {
        try {
            if (session != null) session.close();
            if (env != null) env.close();
        } catch (Exception ignored) {}
    }
}
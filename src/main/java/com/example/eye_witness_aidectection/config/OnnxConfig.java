package com.example.eye_witness_aidectection.config;

import ai.onnxruntime.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Configuration
public class OnnxConfig {

    @Value("${model.cache.dir:/tmp/models}")
    private String cacheDir;

    @Value("${model.v2.url:}")
    private String v2Url;

    @Value("${model.v2.filename:model.onnx}")
    private String v2Filename;

    @Bean
    public OrtEnvironment ortEnvironment() {
        return OrtEnvironment.getEnvironment();
    }

    @Bean
    public OrtSession ortSession(OrtEnvironment env) {
        try {
            File dir = new File(cacheDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File modelFile = new File(dir, v2Filename);

            // If model is not cached and URL is provided, download it
            if (!modelFile.exists() || modelFile.length() == 0) {
                if (v2Url != null && !v2Url.isBlank()) {
                    System.out.println("[EyeWitness AI] Downloading model from: " + v2Url);
                    downloadModel(v2Url, v2Filename, modelFile);
                } else {
                    // Fallback to classpath if no download URL configured
                    var resource = new org.springframework.core.io.ClassPathResource("models/" + v2Filename);
                    if (resource.exists()) {
                        byte[] modelBytes = resource.getInputStream().readAllBytes();
                        return env.createSession(modelBytes, new OrtSession.SessionOptions());
                    }
                    throw new IllegalStateException("Model file not found at " + modelFile.getAbsolutePath() + " and no valid download URL provided.");
                }
            }

            System.out.println("[EyeWitness AI] Loading ONNX model from: " + modelFile.getAbsolutePath());
            OrtSession.SessionOptions options = new OrtSession.SessionOptions();
            return env.createSession(modelFile.getAbsolutePath(), options);

        } catch (Exception e) {
            System.err.println("[EyeWitness AI] CRITICAL: Failed to initialize OrtSession: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("OrtSession bean creation failed", e);
        }
    }

    private void downloadModel(String url, String filename, File targetFile) throws Exception {
    System.out.println("[EyeWitness AI] Downloading " + filename + " from Hugging Face...");
    
    // Ensure parent directories exist before writing
    if (targetFile.getParentFile() != null) {
        Files.createDirectories(targetFile.getParentFile().toPath());
    }

    HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .build();

    HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
    if (response.statusCode() == 200) {
        try (InputStream in = response.body()) {
            Files.copy(in, targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[EyeWitness AI] Model " + filename + " successfully downloaded and cached.");
        }
    } else {
        throw new RuntimeException("Failed to download model " + filename + ". HTTP Status: " + response.statusCode());
    }
}
}

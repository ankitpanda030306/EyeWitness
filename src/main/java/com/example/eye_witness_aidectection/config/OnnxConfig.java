package com.example.eye_witness_aidectection.config;

import ai.onnxruntime.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Configuration
@Getter
public class OnnxConfig {
    @Value("${model.cache.dir}")
    private String cacheDir;

    @Value("${model.v2.url}")
    private String v2Url;

    @Value("${model.v2.filename}")
    private String v2Filename;

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() {
        System.out.println("[EyeWitness AI] Checking local models...");
        try {
            Path dirPath = Paths.get(cacheDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            File modelV2File = new File(cacheDir, v2Filename);
            if (!modelV2File.exists() || modelV2File.length() == 0) {
                downloadModel(v2Url, v2Filename, modelV2File);
            } else {
                System.out.println("[EyeWitness AI] Model " + v2Filename + " successfully verified/cached.");
            }

            env = OrtEnvironment.getEnvironment();
            OrtSession.SessionOptions sessionOptions = new OrtSession.SessionOptions();
            sessionOptions.setMemoryPatternOptimization(true);
            sessionOptions.setExecutionMode(OrtSession.SessionOptions.ExecutionMode.SEQUENTIAL);
            sessionOptions.setIntraOpNumThreads(1);
            sessionOptions.setInterOpNumThreads(1);

            // Initialize OrtSession using the cached file paths
            if (modelV2File.exists() && modelV2File.length() > 0) {
                session = env.createSession(modelV2File.getAbsolutePath(), sessionOptions);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void downloadModel(String url, String filename, File targetFile) throws Exception {
        System.out.println("[EyeWitness AI] Downloading " + filename + " from Hugging Face...");
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
                System.out.println("[EyeWitness AI] Model " + filename + " successfully verified/cached.");
            }
        } else {
            System.err.println("Failed to download model " + filename + ". HTTP Status: " + response.statusCode());
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
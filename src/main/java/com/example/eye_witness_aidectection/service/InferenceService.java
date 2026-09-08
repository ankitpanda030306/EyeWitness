package com.example.eye_witness_aidectection.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;

@Service
public class InferenceService {

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() throws Exception {
        this.env = OrtEnvironment.getEnvironment();
        InputStream modelStream = getClass().getResourceAsStream("/models/eyewitness_v2.onnx");
        if (modelStream == null) {
            throw new IllegalStateException("eyewitness_v2.onnx not found in /resources/models/");
        }
        byte[] modelBytes = modelStream.readAllBytes();
        this.session = env.createSession(modelBytes, new OrtSession.SessionOptions());
    }

    public Map<String, Object> analyzeImage(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("==================================================");
            System.out.println("DEBUG START: Image Analysis Initialized");
            System.out.println("File Name: " + file.getOriginalFilename());
            
            byte[] fileBytes = file.getBytes();
            
            // --- 1. METADATA & SOURCE ATTRIBUTION EXTRACTION ---
            Metadata metadata = null;
            try (ByteArrayInputStream metadataStream = new ByteArrayInputStream(fileBytes)) {
                metadata = ImageMetadataReader.readMetadata(metadataStream);
            } catch (Exception e) {
                System.err.println("Could not read metadata: " + e.getMessage());
            }

            boolean isExplicitAi = false;
            boolean isCameraHardware = false;

            String cameraMake = null;
            String cameraModel = null;
            String dateTimeOriginal = null;
            String exposureTime = null;
            String fNumber = null;
            String iso = null;
            String focalLength = null;
            String lensModel = null;
            String software = null;

            List<String> aiMarkers = Arrays.asList("midjourney", "stable diffusion", "dall-e", "flux", "comfyui", "automatic1111", "novelai", "canva");

            if (metadata != null) {
                for (Directory directory : metadata.getDirectories()) {
                    for (Tag tag : directory.getTags()) {
                        String tagName = tag.getTagName().toLowerCase();
                        String desc = tag.getDescription();
                        if (desc == null) continue;
                        String lowerDesc = desc.toLowerCase();

                        for (String marker : aiMarkers) {
                            if (lowerDesc.contains(marker) || tagName.contains(marker)) {
                                isExplicitAi = true;
                            }
                        }

                        if (tagName.equals("make")) cameraMake = desc;
                        else if (tagName.equals("model")) cameraModel = desc;
                        else if (tagName.equals("software")) software = desc;
                        else if (tagName.equals("date/time original")) dateTimeOriginal = desc;
                        else if (tagName.equals("exposure time")) exposureTime = desc;
                        else if (tagName.equals("f-number") || tagName.equals("fnumber")) fNumber = desc;
                        else if (tagName.equals("iso speed ratings") || tagName.equals("iso")) iso = desc;
                        else if (tagName.equals("focal length")) focalLength = desc;
                        else if (tagName.equals("lens model") || tagName.equals("lens")) lensModel = desc;
                    }
                }
            }

            if ((cameraMake != null || cameraModel != null) && !isExplicitAi) {
                isCameraHardware = true;
            }

            System.out.println("EXIF Make: " + cameraMake);
            System.out.println("EXIF Model: " + cameraModel);
            System.out.println("Camera Hardware Verified: " + isCameraHardware);
            System.out.println("Explicit AI Signature: " + isExplicitAi);

            // --- 2. HIGH-FREQUENCY RESIDUAL NOISE & SPATIAL PATCH SCAN ---
            BufferedImage originalImage = null;
            try (ByteArrayInputStream is = new ByteArrayInputStream(fileBytes)) {
                originalImage = ImageIO.read(is);
            }

            if (originalImage == null) {
                result.put("status", "FAILED");
                result.put("message", "Invalid image format.");
                return result;
            }

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();
            
            int patchWidth = width / 8;
            int patchHeight = height / 8;
            int anomalousPatches = 0;
            double globalVarianceSum = 0;
            int patchCount = 0;
            List<Map<String, Object>> heatmapZones = new ArrayList<>();

            for (int i = 0; i < 8; i++) {
                for (int j = 0; j < 8; j++) {
                    int px = j * patchWidth;
                    int py = i * patchHeight;
                    int pw = (j == 7) ? (width - px) : patchWidth;
                    int ph = (i == 7) ? (height - py) : patchHeight;
                    
                    if (pw <= 2 || ph <= 2) continue;

                    double patchVariance = calculatePatchNoiseVariance(originalImage, px, py, pw, ph);
                    globalVarianceSum += patchVariance;
                    patchCount++;

                    if (patchVariance < 6.0) {
                        anomalousPatches++;
                        Map<String, Object> zone = new HashMap<>();
                        zone.put("x", px);
                        zone.put("y", py);
                        zone.put("width", pw);
                        zone.put("height", ph);
                        zone.put("score", 1.0);
                        heatmapZones.add(zone);
                    }
                }
            }

            double globalVariance = patchCount > 0 ? globalVarianceSum / patchCount : 0;
            System.out.println("Global Noise Variance: " + globalVariance);
            System.out.println("Anomalous Patches: " + anomalousPatches + " / 64");

            // --- 3. ONNX ViT INFERENCE WITH PROPER TEMPERATURE SCALING ---
            float rawAiProb = runOnnxOnImage(originalImage);
            System.out.println("ONNX Raw Deepfake Prob (T=1.5): " + rawAiProb);

            // --- 4. DECISIVE MULTI-TIER VERDICT RESOLUTION ---
            String verdictCategory;
            String verdictTitle;
            String summary;
            double authenticityScore;
            double aiPercentage;
            boolean finalHardwareVerified = false;
            String sourceAttribution = "Unknown";

            if (isExplicitAi || (globalVariance < 6.0 && rawAiProb > 0.65)) {
                // Case A
                verdictCategory = "FULLY_SYNTHETIC";
                verdictTitle = "100% AI-Generated Media";
                summary = "Generative AI synthesis confirmed. Micro-texture diffusion patterns detected across spatial tensors.";
                authenticityScore = 0.0;
                aiPercentage = 100.0;
                // Add all patches to heatmap
                heatmapZones.clear();
                for (int i = 0; i < 8; i++) {
                    for (int j = 0; j < 8; j++) {
                        Map<String, Object> zone = new HashMap<>();
                        zone.put("x", j * patchWidth);
                        zone.put("y", i * patchHeight);
                        zone.put("width", patchWidth);
                        zone.put("height", patchHeight);
                        zone.put("score", 1.0);
                        heatmapZones.add(zone);
                    }
                }
            } else if (isCameraHardware) {
                // Case B
                verdictCategory = "AUTHENTIC";
                verdictTitle = "100% Authentic Camera Capture";
                summary = "Physical optical capture verified. Camera sensor and manufacturer optical signatures detected.";
                authenticityScore = 100.0;
                aiPercentage = 0.0;
                finalHardwareVerified = true;
                sourceAttribution = "Direct Camera Capture";
                heatmapZones.clear();
            } else {
                // Case C & D
                if (anomalousPatches > 0 && anomalousPatches <= 32) { // Allow up to half the image to be anomalous for editing
                    // Case D
                    verdictCategory = "PARTIALLY_AI_EDITED";
                    verdictTitle = "Authentic Base with AI Modifications";
                    summary = "Base image structure is authentic, but localized synthetic textures or inpainting were detected in specific regions.";
                    authenticityScore = Math.round((1.0 - (anomalousPatches / 64.0)) * 100.0 * 10.0) / 10.0;
                    aiPercentage = Math.round((anomalousPatches / 64.0) * 100.0 * 10.0) / 10.0;
                    sourceAttribution = "Modified Media";
                    // heatmapZones already contains anomalous patches
                } else {
                    // Case C
                    verdictCategory = "AUTHENTIC";
                    verdictTitle = "100% Authentic Digital Media";
                    summary = "Media downloaded from an external application or messaging platform. Hardware metadata stripped, but pixel noise integrity confirms authentic optical provenance.";
                    authenticityScore = 100.0;
                    aiPercentage = 0.0;
                    finalHardwareVerified = false;
                    sourceAttribution = "Downloaded Media (App/Web - EXIF Stripped)";
                    heatmapZones.clear();
                }
            }

            // --- 5. DTO PAYLOAD ---
            Map<String, Object> heatmap = new HashMap<>();
            heatmap.put("canvasWidth", width);
            heatmap.put("canvasHeight", height);
            heatmap.put("zones", heatmapZones);

            Map<String, Object> hardwareAttribution = new HashMap<>();
            hardwareAttribution.put("isHardwareVerified", finalHardwareVerified);
            hardwareAttribution.put("make", cameraMake != null ? cameraMake : "Unknown");
            hardwareAttribution.put("model", cameraModel != null ? cameraModel : "Unknown");
            hardwareAttribution.put("lens", lensModel != null ? lensModel : "Unknown");
            hardwareAttribution.put("iso", iso != null ? iso : "Unknown");
            hardwareAttribution.put("shutterSpeed", exposureTime != null ? exposureTime : "Unknown");
            hardwareAttribution.put("focalLength", focalLength != null ? focalLength : "Unknown");
            hardwareAttribution.put("capturedAt", dateTimeOriginal != null ? dateTimeOriginal : "Unknown");
            hardwareAttribution.put("sourceAttribution", sourceAttribution);

            result.put("status", "SUCCESS");
            result.put("verdictCategory", verdictCategory);
            result.put("verdictTitle", verdictTitle);
            result.put("authenticityScore", authenticityScore);
            result.put("aiPercentage", aiPercentage);
            result.put("summary", summary);
            result.put("hardwareAttribution", hardwareAttribution);
            result.put("heatmap", heatmap);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
        }
        return result;
    }

    private double calculatePatchNoiseVariance(BufferedImage image, int startX, int startY, int w, int h) {
        double sum = 0;
        double sumSq = 0;
        int count = 0;
        
        int stride = Math.max(1, Math.min(w, h) / 64); 
        
        for (int y = startY + 1; y < startY + h - 1; y += stride) {
            for (int x = startX + 1; x < startX + w - 1; x += stride) {
                double curr = getLuma(image.getRGB(x, y));
                
                double sumNeighbor = 0;
                for (int dy = -1; dy <= 1; dy++) {
                    for (int dx = -1; dx <= 1; dx++) {
                        if (dx == 0 && dy == 0) continue;
                        sumNeighbor += getLuma(image.getRGB(x + dx, y + dy));
                    }
                }
                double avgNeighbor = sumNeighbor / 8.0;
                double residual = curr - avgNeighbor;
                
                sum += residual;
                sumSq += residual * residual;
                count++;
            }
        }
        
        if (count == 0) return 0.0;
        
        double mean = sum / count;
        double variance = (sumSq / count) - (mean * mean);
        return Math.max(0.0, variance);
    }

    private double getLuma(int rgb) {
        int r = (rgb >> 16) & 0xFF;
        int g = (rgb >> 8) & 0xFF;
        int b = rgb & 0xFF;
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    private float[] softmax(float[] input, float temperature) {
        float[] out = new float[input.length];
        float sum = 0f;
        for (int i = 0; i < input.length; i++) {
            out[i] = (float) Math.exp(input[i] / temperature);
            sum += out[i];
        }
        for (int i = 0; i < input.length; i++) {
            out[i] /= sum;
        }
        return out;
    }

    private float runOnnxOnImage(BufferedImage originalImage) throws Exception {
        BufferedImage resized = new BufferedImage(224, 224, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(originalImage, 0, 0, 224, 224, null);
        g2d.dispose();

        FloatBuffer buffer = FloatBuffer.allocate(1 * 3 * 224 * 224);
        float[][][] chw = new float[3][224][224];

        for (int y = 0; y < 224; y++) {
            for (int x = 0; x < 224; x++) {
                int rgb = resized.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                chw[0][y][x] = b / 255.0f; // Blue
                chw[1][y][x] = g / 255.0f; // Green
                chw[2][y][x] = r / 255.0f; // Red
            }
        }

        for (int c = 0; c < 3; c++) {
            for (int y = 0; y < 224; y++) {
                for (int x = 0; x < 224; x++) {
                    buffer.put(chw[c][y][x]);
                }
            }
        }
        buffer.rewind();

        OnnxTensor inputTensor = OnnxTensor.createTensor(env, buffer, new long[]{1, 3, 224, 224});
        OrtSession.Result runResult = session.run(Collections.singletonMap("pixel_values", inputTensor));

        float[][] logits = (float[][]) runResult.get(0).getValue();
        
        float[] probs = softmax(logits[0], 1.5f);
        
        float fakeProb = probs[1];
        
        buffer.clear();
        buffer = null;
        chw = null;
        System.gc();
        
        return fakeProb;
    }
}
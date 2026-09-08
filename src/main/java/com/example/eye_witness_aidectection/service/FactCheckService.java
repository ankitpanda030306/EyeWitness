package com.example.eye_witness_aidectection.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class FactCheckService {

    @Value("${factcheck.api.key:}")
    private String apiKey;

    public Map<String, Object> verifyClaim(String claimText) {
        Map<String, Object> result = new HashMap<>();
        if (claimText == null || claimText.trim().isEmpty()) {
            result.put("claimStatus", "NO_TEXT_FOUND");
            return result;
        }

        try {
            String trimmed = claimText.trim().substring(0, Math.min(claimText.length(), 150));
            String query = URLEncoder.encode(trimmed, StandardCharsets.UTF_8);
            String urlStr = "https://factchecktools.googleapis.com/v1alpha1/claims:search?query=" + query;
            if (!apiKey.isEmpty()) {
                urlStr += "&key=" + apiKey;
            }

            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                reader.close();

                JSONObject response = new JSONObject(sb.toString());
                if (response.has("claims")) {
                    JSONArray claims = response.getJSONArray("claims");
                    if (claims.length() > 0) {
                        JSONObject firstClaim = claims.getJSONObject(0);
                        JSONArray claimReviews = firstClaim.optJSONArray("claimReview");
                        String rating = "UNVERIFIED";
                        if (claimReviews != null && claimReviews.length() > 0) {
                            JSONObject firstReview = claimReviews.getJSONObject(0);
                            rating = firstReview.optString("textualRating", "MISLEADING");
                            result.put("url", firstReview.optString("url", ""));
                            result.put("publisher", firstReview.getJSONObject("publisher").optString("name", "FactCheck"));
                        } else {
                            result.put("publisher", "Independent Fact Checker");
                            result.put("url", "");
                        }
                        result.put("claimStatus", "DEBUNKED_IN_DATABASE");
                        result.put("factRating", rating);
                        return result;
                    }
                }
            }
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        result.put("claimStatus", "NO_PRIOR_MISINFORMATION_FOUND");
        result.put("factRating", "PLAUSIBLE_OR_UNCHECKED");
        return result;
    }
}
import { ImageAnalysisResponse, ReelAnalysisResponse, VoiceAnalysisResponse, ClaimAnalysisResponse } from "./api-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const HEALTH_ENDPOINT = `${API_BASE}/api/health`;

export async function verifyImage(file: File): Promise<ImageAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const targetUrl = `${API_BASE}/api/v1/analyze/image`;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      body: formData, // No explicit Content-Type header for multipart/form-data
    });
    if (!res.ok) throw new Error(`Image inspection failed with HTTP ${res.status}`);
    const data = await res.json();
    if (data.status === 'ERROR' || data.status === 'FAILED') {
      throw new Error(data.message || 'Image analysis failed.');
    }
    return data;
  } catch (error: any) {
    console.error(`[Network Error] Target URL: ${targetUrl} | Message: ${error.message}`);
    throw error;
  }
}

export async function verifyReel(url: string): Promise<ReelAnalysisResponse> {
  const targetUrl = `${API_BASE}/api/v1/analyze/reel`;
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(`Reel inspection failed with HTTP ${res.status}`);
    return res.json();
  } catch (error: any) {
    console.error(`[Network Error] Target URL: ${targetUrl} | Message: ${error.message}`);
    throw error;
  }
}

export async function verifyClaim(text: string): Promise<ClaimAnalysisResponse> {
  const targetUrl = `${API_BASE}/api/v1/analyze/claim`;
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Claim inspection failed with HTTP ${res.status}`);
    return res.json();
  } catch (error: any) {
    console.error(`[Network Error] Target URL: ${targetUrl} | Message: ${error.message}`);
    throw error;
  }
}

export async function verifyVoice(file: File): Promise<VoiceAnalysisResponse> {
  const formData = new FormData();
  // Scrub original file name by calling it blob.bin
  formData.append("media", file, "blob.bin");
  const targetUrl = `${API_BASE}/api/v1/analyze/voice`;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      body: formData, // No explicit Content-Type header for multipart/form-data
    });
    if (!res.ok) throw new Error(`Voice inspection failed with HTTP ${res.status}`);
    return res.json();
  } catch (error: any) {
    console.error(`[Network Error] Target URL: ${targetUrl} | Message: ${error.message}`);
    throw error;
  }
}

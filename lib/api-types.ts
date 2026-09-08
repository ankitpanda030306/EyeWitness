export interface ImageAnalysisResponse {
  status: "SUCCESS" | "FAILED" | "ERROR";
  verdictCategory?: "FULLY_SYNTHETIC" | "PARTIALLY_AI_EDITED" | "AUTHENTIC";
  verdictTitle?: string;
  summary?: string;
  authenticityScore?: number;
  aiPercentage?: number;
  heatmap?: {
    canvasWidth: number;
    canvasHeight: number;
    zones: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      confidence: number;
      label: string;
    }>;
  };
  hardwareAttribution?: {
    isHardwareVerified: boolean;
    make: string;
    model: string;
    lens: string;
    iso: string;
    shutterSpeed: string;
    focalLength: string;
    capturedAt: string;
  };
  message?: string;
}

export interface FactCheckDetails {
  claimStatus: "DEBUNKED_IN_DATABASE" | "NO_PRIOR_MISINFORMATION_FOUND" | "NO_TEXT_FOUND";
  factRating?: string;
  publisher?: string;
  url?: string;
  error?: string;
}

export interface ClaimAnalysisResponse extends FactCheckDetails {
  // Can be extended later if we add top-level status to FactCheckService
}

export interface ReelAnalysisResponse {
  status: "SUCCESS" | "FAILED" | "ERROR";
  platformMetadata?: {
    title: string;
    author: string;
    durationSec: number;
  };
  newsFactCheck?: FactCheckDetails;
  visualForensicsVerdict?: string;
  voiceForensicsVerdict?: string;
  overallVerdict?: string;
  message?: string;
}

export interface VoiceAnalysisResponse {
  status: "SUCCESS" | "FAILED" | "ERROR";
  voiceType: "HUMAN_AUTHENTIC" | "SYNTHETIC_CLONE";
  cloningProbability: number;
  message?: string;
}

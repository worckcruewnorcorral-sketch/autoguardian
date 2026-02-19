export interface Vehicle {
  year: number;
  make: string;
  model: string;
  mileage: number;
}

export interface LikelyCause {
  cause: string;
  confidence: number;
  explanation: string;
  severity: "urgent" | "soon" | "monitor";
  category: string;
}

export interface DiagnosisResult {
  summary: string;
  likelyCauses: LikelyCause[];
  safeToDrive: {
    verdict: boolean;
    explanation: string;
  };
  estimatedCost: {
    low: number;
    high: number;
    currency: string;
    note: string;
  };
  urgency: {
    level: "urgent" | "soon" | "monitor";
    timeframe: string;
    explanation: string;
  };
  questionsForMechanic: string[];
  diyPossible: {
    feasible: boolean;
    difficulty: "easy" | "moderate" | "advanced";
    steps: string[];
    tools: string[];
    warnings: string[];
  };
  additionalNotes: string;
}

export interface AnalyzeRequest {
  vehicle: Vehicle;
  description: string;
}

export interface AnalyzeResponse {
  success: boolean;
  diagnosis?: DiagnosisResult;
  error?: string;
  remainingConsultations?: number;
}

export interface SavedVehicle extends Vehicle {
  id: string;
  nickname?: string;
}

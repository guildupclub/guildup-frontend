export interface DiagnosticLead {
  name: string;
  phone: string;
  email?: string;
  responses: { [questionId: string]: { value: number; text: string } }; // e.g., {"1": {value: 2, text: "More than half the days"}, ...}
  score: number;
  level: string; // "Minimal", "Mild", etc.
  timestamp: Date;
  userId?: string; // if logged in
}

export interface DiagnosticLeadSubmission {
  name: string;
  phone: string;
  email?: string;
  responses: { [questionId: string]: { value: number; text: string } };
  score: number;
  level: string;
  userId?: string;
}

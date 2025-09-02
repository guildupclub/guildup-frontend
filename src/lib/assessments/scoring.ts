import { PHQ9 } from "./phq9";

export type Phq9Answers = Record<number, 0 | 1 | 2 | 3>;

export function computePhq9Score(answers: Phq9Answers): {
  total: number;
  level: string;
  labels: string[];
} {
  const total = PHQ9.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);

  const level = (() => {
    if (total <= 4) return "Minimal mood disturbance";
    if (total <= 9) return "Mild symptoms";
    if (total <= 14) return "Moderate symptoms";
    if (total <= 19) return "Moderately severe symptoms";
    return "Severe symptoms";
  })();

  const labels: string[] = [level];
  if (answers[9] && answers[9] > 0) {
    labels.push("suicidality_risk");
  }

  return { total, level, labels };
}



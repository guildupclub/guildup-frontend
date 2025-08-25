export type Phq9Question = { id: number; text: string };

export const PHQ9 = {
  assessment_name: "Optimal 9-Question Mood Assessment",
  timeframe: "Last 2 weeks",
  response_scale: {
    0: "Not at all",
    1: "Several days",
    2: "More than half the days",
    3: "Nearly every day",
  } as Record<number, string>,
  questions: [
    { id: 1, text: "Little interest or pleasure in doing things" },
    { id: 2, text: "Feeling down, depressed, or hopeless" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: 4, text: "Feeling tired or having little energy" },
    { id: 5, text: "Poor appetite or overeating" },
    { id: 6, text: "Feeling bad about yourself—or that you are a failure or have let yourself or your family down" },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual" },
    { id: 9, text: "Thoughts that you would be better off dead or of hurting yourself" },
  ] as Phq9Question[],
  scoring: {
    range: "0-27",
    interpretation: [
      { score_range: "0-4", level: "Minimal mood disturbance" },
      { score_range: "5-9", level: "Mild symptoms" },
      { score_range: "10-14", level: "Moderate symptoms" },
      { score_range: "15-19", level: "Moderately severe symptoms" },
      { score_range: "20-27", level: "Severe symptoms" },
    ],
    clinical_cutoff: { threshold: 10, note: "Score ≥10 indicates clinically significant mood disturbance" },
  },
};



"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PHQ9 } from "@/lib/assessments/phq9";
import { computePhq9Score } from "@/lib/assessments/scoring";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "@/components/Loader";

type AnswerMap = Record<string, string>;

export default function DiagnosticPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const questions = useMemo(() => PHQ9.questions.map((q) => ({ id: String(q.id), text: q.text })), []);
  const isLoading = false;
  const isError = false;
  const error: any = null;

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isSubmitting) return;
    const timeoutId = setTimeout(() => {
      // Safety: hide loader if routing gets stuck (e.g., network/proxy interference)
      setIsSubmitting(false);
    }, 8000);
    return () => clearTimeout(timeoutId);
  }, [isSubmitting]);

  useEffect(() => {
    // Start with all answers unselected on first load
  }, []);

  const canSubmit = useMemo(() => {
    if (!questions || questions.length === 0) return false;
    return questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== "");
  }, [questions, answers]);

  const handleChange = (q: { id: string }, value: string | number) => {
    setAnswers((prev) => {
      const next = String(value);
      const current = prev[q.id];
      if (current === next) return prev;
      return { ...prev, [q.id]: next };
    });
  };

  const handleSelectAndAdvance = (q: { id: string }, value: string) => {
    handleChange(q, value);
    // Auto-advance or auto-submit on last
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i)), 160);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        handleSubmit();
      }, 200);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const numericAnswers = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [Number(k), Number(v) as 0 | 1 | 2 | 3])
      );
      const score = computePhq9Score(numericAnswers as any);
      const result = { summary: `PHQ-9 total: ${score.total} (${score.level})`, labels: score.labels, total: score.total, level: score.level };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ai_diagnostic_result", JSON.stringify(result));
      }
      router.push("/recommendations");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">Quick • 60 sec</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">Well‑being Check‑in</h1>
          <p className="text-sm text-gray-600 mt-1">Answer a few quick questions to personalize expert recommendations.</p>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600">Question {currentIndex + 1} of {questions.length}</div>
            <div className="text-xs text-gray-600">{Math.round((currentIndex / questions.length) * 100)}%</div>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.round(((currentIndex) / (questions.length)) * 100)}%` }}
            />
          </div>
        </div>

      {isLoading && <div className="py-10 text-center">Loading questions...</div>}
      {isError && (
        <div className="py-6">
          <div className="text-red-600 text-sm mb-3">{(error as Error)?.message || "Failed to load questions."}</div>
        </div>
      )}

      {!isLoading && !isError && (
        <form className="mt-2 flex-1 flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {isSubmitting && (
            <Loader />
          )}
          <div className="relative flex-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {(() => {
                const q = questions[currentIndex];
                const label = q.text || "Question";
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="p-6 sm:p-7 rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <label id={`question-${q.id}`} className="block text-lg sm:text-xl font-semibold mb-5 text-gray-900">{label}</label>
                    <RadioGroup
                      key={`rg-${q.id}`}
                      name={`q-${q.id}`}
                      aria-labelledby={`question-${q.id}`}
                      value={answers[q.id] ?? ""}
                      onValueChange={(val) => handleSelectAndAdvance(q, val)}
                      className="grid gap-3"
                    >
                      <Label className={`cursor-pointer text-left flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${answers[q.id] === "0" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                        <RadioGroupItem value="0" id={`q${q.id}-0`} />
                        <span className="text-sm sm:text-base text-gray-800 flex-1">{PHQ9.response_scale[0]}</span>
                      </Label>
                      <Label className={`cursor-pointer text-left flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${answers[q.id] === "1" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                        <RadioGroupItem value="1" id={`q${q.id}-1`} />
                        <span className="text-sm sm:text-base text-gray-800 flex-1">{PHQ9.response_scale[1]}</span>
                      </Label>
                      <Label className={`cursor-pointer text-left flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${answers[q.id] === "2" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                        <RadioGroupItem value="2" id={`q${q.id}-2`} />
                        <span className="text-sm sm:text-base text-gray-800 flex-1">{PHQ9.response_scale[2]}</span>
                      </Label>
                      <Label className={`cursor-pointer text-left flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${answers[q.id] === "3" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                        <RadioGroupItem value="3" id={`q${q.id}-3`} />
                        <span className="text-sm sm:text-base text-gray-800 flex-1">{PHQ9.response_scale[3]}</span>
                      </Label>
                    </RadioGroup>
                    <div className="mt-3 text-xs text-gray-500">Tap an option to continue. You can always go back.</div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : 0))} disabled={currentIndex === 0 || isSubmitting}>
              Back
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button
                type="button"
                onClick={() => { if ((answers[questions[currentIndex].id] ?? "") !== "") { setIsSubmitting(true); handleSubmit(); } }}
                disabled={isSubmitting || (answers[questions[currentIndex].id] ?? "") === ""}
              >
                {isSubmitting ? "Preparing results…" : "See Results"}
              </Button>
            ) : (
              <div />
            )}
          </div>
        </form>
      )}
      {/* Privacy note */}
      <div className="mt-6 text-center text-xs text-gray-500">Your responses are private and only used to tailor your recommendations.</div>
      </div>
    </div>
  );
}



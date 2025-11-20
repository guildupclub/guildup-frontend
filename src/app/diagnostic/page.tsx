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
import { ChevronLeft } from "lucide-react";
import { primary } from "@/app/colours";

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
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = ["Evaluating answers", "Please wait", "Nearly there"];

  useEffect(() => {
    if (!isSubmitting) {
      setLoadingMessageIndex(0);
      return;
    }
    
    // Show messages sequentially every 1 second
    const messageTimeouts: NodeJS.Timeout[] = [];
    
    loadingMessages.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setLoadingMessageIndex(index);
        // After the last message, wait a bit then navigate
        if (index === loadingMessages.length - 1) {
          setTimeout(() => {
            const numericAnswers = Object.fromEntries(
              Object.entries(answers).map(([k, v]) => [Number(k), Number(v) as 0 | 1 | 2 | 3])
            );
            const score = computePhq9Score(numericAnswers as any);
            const result = { summary: `PHQ-9 total: ${score.total} (${score.level})`, labels: score.labels, total: score.total, level: score.level };
            if (typeof window !== "undefined") {
              sessionStorage.setItem("ai_diagnostic_result", JSON.stringify(result));
            }
            router.push("/recommendations");
          }, 1000); // Wait 1 second after last message before navigating
        }
      }, index * 1000); // Changed to 1 second intervals
      messageTimeouts.push(timeout);
    });

    // Safety: hide loader if routing gets stuck (e.g., network/proxy interference)
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setLoadingMessageIndex(0);
    }, 10000);
    
    return () => {
      messageTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(timeoutId);
    };
  }, [isSubmitting, answers, router]);

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
    // Auto-advance on non-last questions
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i)), 160);
    }
    // Don't auto-submit on last question - user needs to click button
  };

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    // Start loading sequence - navigation will happen in useEffect after messages
    setIsSubmitting(true);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col h-full min-h-0">
          {/* Minimal Header */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex items-center justify-between mb-6">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : 0))} 
                disabled={currentIndex === 0 || isSubmitting}
                className="h-8 w-8 rounded-full hover:bg-gray-100 transition-all duration-200"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
              {currentIndex === questions.length - 1 && !isSubmitting && (
                <Button
                  type="button"
                  onClick={() => { 
                    if ((answers[questions[currentIndex].id] ?? "") !== "") { 
                      handleSubmit(); 
                    } 
                  }}
                  disabled={(answers[questions[currentIndex].id] ?? "") === ""}
                  className="px-4 h-8 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all duration-200 rounded-full"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  See Results
                </Button>
              )}
              {currentIndex < questions.length - 1 && <div className="w-8" />}
            </div>
            
            {/* Minimal Progress */}
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {currentIndex + 1} / {questions.length}
              </div>
            </div>
            <div className="h-px bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {isLoading && <div className="py-10 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading questions...</div>}
          {isError && (
            <div className="py-6">
              <div className="text-red-600 text-sm mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{(error as Error)?.message || "Failed to load questions."}</div>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {isSubmitting ? (
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="text-center">
                    {/* Blur Ball with Flicker */}
                    <div className="relative mb-8 flex items-center justify-center">
                      <motion.div
                        className="w-16 h-16 rounded-full blur-xl"
                        style={{ backgroundColor: primary }}
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute w-8 h-8 rounded-full"
                        style={{ backgroundColor: primary }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    
                    {/* Smooth Text Transition */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="text-lg sm:text-xl font-medium text-gray-900"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {loadingMessages[loadingMessageIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <form className="flex-1 flex flex-col min-h-0" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {/* Question card - Minimal */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      {(() => {
                        const q = questions[currentIndex];
                        const label = q.text || "Question";
                        return (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="flex-1 flex flex-col min-h-0"
                          >
                            <label id={`question-${q.id}`} className="block text-lg sm:text-xl font-medium mb-6 text-gray-900 flex-shrink-0 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {label}
                            </label>
                            <div className="flex-1 min-h-0 flex flex-col justify-center">
                              <RadioGroup
                                key={`rg-${q.id}`}
                                name={`q-${q.id}`}
                                aria-labelledby={`question-${q.id}`}
                                value={answers[q.id] ?? ""}
                                onValueChange={(val) => handleSelectAndAdvance(q, val)}
                                className="grid gap-3"
                              >
                                {[0, 1, 2, 3].map((val) => (
                                  <motion.div
                                    key={val}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: val * 0.05, duration: 0.3 }}
                                  >
                                    <Label className={`cursor-pointer text-left flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 flex-shrink-0 ${
                                      answers[q.id] === String(val) 
                                        ? "border-black bg-gray-50" 
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                    }`}>
                                      <RadioGroupItem value={String(val)} id={`q${q.id}-${val}`} className="flex-shrink-0" />
                                      <span className="text-sm sm:text-base text-gray-800 flex-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                        {PHQ9.response_scale[val]}
                                      </span>
                                    </Label>
                                  </motion.div>
                                ))}
                              </RadioGroup>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



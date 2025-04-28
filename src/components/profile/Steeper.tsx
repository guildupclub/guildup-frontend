import React from "react";
import Link from "next/link";

interface StepperProps {
  steps: {
    label: string;
    completed: boolean;
    active?: boolean;
    href?: string;
  }[];
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="w-full py-2 px-6 bg-white border-b rounded-xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative w-full">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Circle & Label */}
              <div className="relative flex flex-col items-center z-10 w-1/4 sm:w-auto">
                {step.href ? (
                  <Link href={step.href} className="cursor-pointer">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-500 text-white"
                          : step.active
                          ? "border-2 border-blue-500 bg-white text-blue-500"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        step.completed
                          ? "text-accent-muted font-medium"
                          : step.active
                          ? "text-muted font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </Link>
                ) : (
                  <>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-500 text-white"
                          : step.active
                          ? "border-2 border-blue-500 bg-white text-blue-500"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        step.completed
                          ? "text-accent-muted font-medium"
                          : step.active
                          ? "text-muted font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="w-full flex items-center">
                  <div
                    className={`flex-grow h-0.5 ${
                      steps[index + 1].completed || step.completed
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

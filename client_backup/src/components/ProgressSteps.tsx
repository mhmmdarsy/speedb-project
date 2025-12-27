import { Check } from "lucide-react";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({
  steps,
  currentStep,
}: ProgressStepsProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className="flex items-center flex-1"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                    ${isCompleted ? "bg-success text-white" : ""}
                    ${isCurrent ? "bg-primary text-white scale-110" : ""}
                    ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-600" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p
                  className={`mt-2 text-center text-sm ${isCurrent ? "text-primary" : "text-gray-600"}`}
                >
                  {step}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all duration-200
                    ${isCompleted ? "bg-success" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
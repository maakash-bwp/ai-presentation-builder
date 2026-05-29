import clsx from "clsx";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => {
        const active = currentStep === index;
        const completed = currentStep > index;
        return (
          <li
            key={step}
            className={clsx(
              "rounded-xl border px-4 py-3 text-sm font-medium transition",
              completed && "border-brand-200 bg-brand-50 text-brand-700",
              active && "border-brand-500 bg-white text-brand-700 shadow-glass",
              !active && !completed && "border-slatePro-200 bg-white text-slatePro-500"
            )}
          >
            {index + 1}. {step}
          </li>
        );
      })}
    </ol>
  );
}

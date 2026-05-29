import { useMemo } from "react";

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);

export default function OtpInputGroup({ value, onChange, disabled = false }) {
  const digits = useMemo(() => {
    const normalized = onlyDigits(value || "");
    return Array.from({ length: 6 }, (_, index) => normalized[index] || "");
  }, [value]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(event) => {
            const nextValue = [...digits];
            nextValue[index] = event.target.value.replace(/\D/g, "");
            onChange(nextValue.join(""));
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              const nextValue = [...digits];
              nextValue[index - 1] = "";
              onChange(nextValue.join(""));
            }
          }}
          className="h-14 w-12 rounded-2xl border border-slatePro-300 bg-white text-center text-lg font-semibold text-slatePro-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      ))}
    </div>
  );
}

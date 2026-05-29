const getStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const levels = [
    { label: "Too weak", color: "bg-red-400", width: "20%" },
    { label: "Weak", color: "bg-orange-400", width: "35%" },
    { label: "Fair", color: "bg-amber-400", width: "55%" },
    { label: "Strong", color: "bg-cyan-400", width: "78%" },
    { label: "Excellent", color: "bg-emerald-400", width: "100%" }
  ];

  return levels[Math.min(score, levels.length - 1)];
};

export default function PasswordStrengthBar({ password }) {
  if (!password) {
    return null;
  }

  const strength = getStrength(password);

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slatePro-100">
        <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
      </div>
      <p className="text-xs font-medium text-slatePro-500">Password strength: {strength.label}</p>
    </div>
  );
}

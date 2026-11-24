interface ProgressBarProps {
  label?: string;
  value: number;
  color?: "green" | "amber" | "red";
  code?: string;
  instructor?: string;
}

export function ProgressBar({
  label,
  value,
  color,
  code,
  instructor,
}: ProgressBarProps) {
  const activeColor =
    color || (value >= 75 ? "green" : value >= 55 ? "amber" : "red");

  const colorStyles = {
    green: {
      fill: "bg-[#34D399]",
      text: "text-[#047857]",
      dot: "bg-[#047857]",
    },
    amber: {
      fill: "bg-[#FACC15]",
      text: "text-[#713F12]",
      dot: "bg-[#EAB308]",
    },
    red: {
      fill: "bg-[#B91C1C]",
      text: "text-[#B91C1C]",
      dot: "bg-[#B91C1C]",
    },
  };

  const current = colorStyles[activeColor];

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${current.dot}`} />
          <span className="text-[#0B2E22]">{label}</span>
          {code && <span className="text-[10px] text-[#4B6B5E]">({code})</span>}
        </div>
        <div className="flex items-center gap-2">
          {instructor && (
            <span className="text-[10px] text-[#4B6B5E] hidden sm:inline">
              {instructor}
            </span>
          )}
          <span className={`font-bold ${current.text}`}>{value}%</span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-[#CDEBDD] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${current.fill}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

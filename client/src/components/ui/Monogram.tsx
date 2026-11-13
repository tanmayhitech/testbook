import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils.js";

interface MonogramProps {
  name?: string;
  icon?: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
  status?: "online" | "idle" | "busy" | null;
}

export const getMonogramLetters = (name?: string): string => {
  if (!name) return "TB";
  // Split on hyphens, underscores, or spaces
  const parts = name.split(/[-_\s.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  // Single word: take first two characters
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return (clean[0] || "T").toUpperCase();
};

export const Monogram: React.FC<MonogramProps> = ({
  name,
  icon: Icon,
  size = "md",
  className,
  glow = false,
  status,
}) => {
  const letters = getMonogramLetters(name);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px] rounded-md",
    sm: "w-7 h-7 text-[11px] rounded-lg",
    md: "w-9 h-9 text-xs rounded-xl",
    lg: "w-11 h-11 text-sm rounded-2xl",
    xl: "w-14 h-14 text-base rounded-2xl",
  }[size];

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0 group/monogram">
      <div
        className={cn(
          "bg-sage-400/10 border border-sage-400/25 text-sage-300 font-mono font-bold flex items-center justify-center select-none transition-all duration-300 shadow-sm shadow-sage-500/10 group-hover:border-sage-400/60 group-hover:scale-105",
          sizeClasses,
          glow && "shadow-[0_0_12px_rgba(var(--accent-glow),0.2)]",
          className
        )}
      >
        {Icon ? <Icon size={iconSizes} className="transition-transform group-hover:rotate-3" /> : letters}
      </div>

      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#07090e]",
            status === "online" && "bg-sage-400 animate-pulse",
            status === "idle" && "bg-amber-400",
            status === "busy" && "bg-rose-500"
          )}
        />
      )}
    </div>
  );
};

import React from "react";
import { GitBranch, GitCommit, GitPullRequest, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface MovingTickerProps {
  className?: string;
}

export const MovingTicker: React.FC<MovingTickerProps> = ({ className = "" }) => {
  const tickerItems = [
    { icon: Zap, text: "VCS REPOSITORY SYNC ACTIVE", highlight: "ONLINE" },
    { icon: GitBranch, text: "ISOLATED BRANCH TREE ENGINE", highlight: "GRAPH" },
    { icon: GitCommit, text: "IMMUTABLE SHA HASH CHAIN", highlight: "SECURE" },
    { icon: GitPullRequest, text: "PEER REVIEW & 3-WAY SMART MERGE", highlight: "READY" },
    { icon: ShieldCheck, text: "ROLE-BASED ACCESS CONTROL (RBAC)", highlight: "ENFORCED" },
    { icon: Sparkles, text: "COLOR MODE & MONOGRAM ENGINE", highlight: "v1.0" },
  ];

  return (
    <div
      className={`w-full overflow-hidden py-2 border-y border-white/[0.06] bg-[#05070c]/70 select-none font-mono text-[11px] backdrop-blur-md relative ${className}`}
    >
      {/* Edge gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-matte-950 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-matte-950 to-transparent pointer-events-none z-10" />

      {/* Marquee Loop */}
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap cursor-default">
        {/* Sequence 1 */}
        {tickerItems.map((item, idx) => (
          <div key={`ticker-1-${idx}`} className="flex items-center gap-2.5 text-matte-400 group">
            <item.icon size={12} className="text-sage-400 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="tracking-wider text-matte-300 font-medium group-hover:text-matte-100 transition-colors">
              {item.text}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 text-[9px] font-semibold">
              {item.highlight}
            </span>
            <span className="text-matte-700 select-none">&bull;</span>
          </div>
        ))}

        {/* Sequence 2 (Identical for seamless infinite scroll) */}
        {tickerItems.map((item, idx) => (
          <div key={`ticker-2-${idx}`} className="flex items-center gap-2.5 text-matte-400 group">
            <item.icon size={12} className="text-sage-400 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="tracking-wider text-matte-300 font-medium group-hover:text-matte-100 transition-colors">
              {item.text}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 text-[9px] font-semibold">
              {item.highlight}
            </span>
            <span className="text-matte-700 select-none">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
};

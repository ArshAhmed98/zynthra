import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 32 : size === "sm" ? 20 : 26;
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <motion.svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        aria-hidden
      >
        <defs>
          <linearGradient id="lg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="55%" stopColor="#7B2FFF" />
            <stop offset="100%" stopColor="#FF3D6B" />
          </linearGradient>
        </defs>
        <polygon
          points="16,2 29,9 29,23 16,30 3,23 3,9"
          fill="none"
          stroke="url(#lg-grad)"
          strokeWidth="2"
        />
        <circle cx="16" cy="16" r="3" fill="url(#lg-grad)" />
      </motion.svg>
      <span className={`font-display font-extrabold ${text} tracking-tight text-gradient`}>
        Zynthra
      </span>
    </Link>
  );
}

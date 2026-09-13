import React from "react";

interface SarthiLogoProps {
  className?: string;
  size?: number | string;
  variant?: "icon" | "full";
  textClassName?: string;
}

export function SarthiLogo({
  className = "",
  size = 36,
  variant = "icon",
  textClassName = "",
}: SarthiLogoProps) {
  const icon = (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sarthi Morpankhi Logo"
    >
      <defs>
        {/* Morpankhi Blue (Peacock Feather Blue) Gradient */}
        <linearGradient id="morpankhi-s-grad" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="35%" stopColor="#0077b6" />
          <stop offset="70%" stopColor="#023e8a" />
          <stop offset="100%" stopColor="#0096c7" />
        </linearGradient>

        {/* Morpankhi Teal & Iridescent Shimmer */}
        <linearGradient id="morpankhi-teal" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00a896" />
          <stop offset="50%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#90e0ef" />
        </linearGradient>

        {/* Ambient Morpankhi Glow */}
        <filter id="morpankhi-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0077b6" floodOpacity="0.4" />
        </filter>

        {/* Morpankhi Background Tile */}
        <radialGradient id="morpankhi-tile" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.16" />
          <stop offset="70%" stopColor="#023e8a" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#03045e" stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* Rounded Morpankhi Container Tile */}
      <rect
        width="100"
        height="100"
        rx="24"
        fill="url(#morpankhi-tile)"
        stroke="#00b4d8"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />

      {/* The Morpankhi "S" Glyph with Peacock Feather Plume Geometry */}
      <g filter="url(#morpankhi-glow)">
        {/* Main Bold "S" Contour in Peacock Morpankhi Blue */}
        <path
          d="M 72 26 C 52 16, 28 21, 26 38 C 24 53, 50 51, 62 57 C 76 64, 76 81, 60 87 C 42 93, 26 87, 24 77"
          stroke="url(#morpankhi-s-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Iridescent Feather Shimmer Line */}
        <path
          d="M 68 26 C 50 18, 32 23, 30 36 C 28 48, 50 46, 62 53 C 72 60, 72 75, 60 82 C 46 87, 32 83, 28 77"
          stroke="url(#morpankhi-teal)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        />

        {/* Morpankhi Peacock Eye (Chandrika) at the heart of S */}
        <circle cx="50" cy="50" r="6.5" fill="#00b4d8" />
        <circle cx="50" cy="50" r="4" fill="#03045e" />
        <circle cx="51.5" cy="48.5" r="1.5" fill="#ffffff" />

        {/* Crown Quill Plume Accent */}
        <circle cx="72" cy="26" r="3" fill="#90e0ef" />
        <circle cx="24" cy="77" r="2.5" fill="#00a896" />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return icon;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display text-xl font-bold tracking-tight text-slate-900 ${textClassName}`}>
            Sarthi
          </span>
          <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
            AI
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
          Project Charioteer & Architect
        </span>
      </div>
    </div>
  );
}

export default SarthiLogo;

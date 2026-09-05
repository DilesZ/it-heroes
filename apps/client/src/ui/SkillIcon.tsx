export default function SkillIcon({ icon, color, size = 26 }: { icon: string; color: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "slash":
      return (
        <svg {...common}>
          <path d="M4 20 L20 4" />
          <path d="M7 20 L5 18 M12 20 L10 18 M17 20 L15 18" opacity={0.55} />
          <path d="M14 5 L19 5 L19 10" />
        </svg>
      );
    case "slam":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" opacity={0.55} />
          <path d="M12 2.5 L12 6 M12 18 L12 21.5 M2.5 12 L6 12 M18 12 L21.5 12" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2.5 L20 6 V11 C20 16 16.5 19.5 12 21.5 C7.5 19.5 4 16 4 11 V6 Z" />
          <path d="M12 7.5 V14" opacity={0.7} />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2.5 L5.5 13.5 H11 L10 21.5 L18.5 10.5 H13 Z" fill={color} fillOpacity={0.25} />
        </svg>
      );
    case "nova":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" fill={color} fillOpacity={0.3} />
          <path d="M12 2.5 V7 M12 17 V21.5 M2.5 12 H7 M17 12 H21.5 M5.3 5.3 L8.5 8.5 M15.5 15.5 L18.7 18.7 M18.7 5.3 L15.5 8.5 M8.5 15.5 L5.3 18.7" />
        </svg>
      );
    case "turret":
      return (
        <svg {...common}>
          <path d="M7 21.5 V14 H17 V21.5" />
          <path d="M4 21.5 H20" />
          <path d="M12 14 V7" />
          <circle cx="12" cy="5.5" r="2.5" fill={color} fillOpacity={0.3} />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M4 20 L17 7" />
          <path d="M17 7 H12.5 M17 7 V11.5" />
          <path d="M4 20 L6.5 17.5 M4 20 L2.5 21.5" opacity={0.6} />
          <circle cx="19" cy="5" r="1.6" fill={color} />
        </svg>
      );
    case "trap":
      return (
        <svg {...common}>
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <path d="M9 5 V2.8 M15 5 V2.8 M9 21.2 V19 M15 21.2 V19 M5 9 H2.8 M5 15 H2.8 M21.2 9 H19 M21.2 15 H19" />
          <circle cx="12" cy="12" r="2" fill={color} fillOpacity={0.35} />
        </svg>
      );
    case "burst":
      return (
        <svg {...common}>
          <path d="M12 4 V9 M12 15 V20 M4 12 H9 M15 12 H20" />
          <circle cx="12" cy="12" r="2.2" fill={color} fillOpacity={0.35} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" fill={color} />
        </svg>
      );
  }
}

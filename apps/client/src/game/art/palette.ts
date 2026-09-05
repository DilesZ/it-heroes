export const INK = "#232838";

export const BRIGHT = {
  sky: "#8ec9f5",
  horizon: "#d8ecff",
  hubGround: "#b7c3de",
  hubRing: "#7f96c4",
  hubPath: "#8fa3cf",
  cablesGround: "#6fc984",
  cablesPatch: "#4da862",
  cablesPath: "#a5e3b3",
  cloudGround: "#b3a1ec",
  cloudPatch: "#9782dd",
  cloudPath: "#d3c6f7",
  corridorWall: "#e8eefc",
  corridorTrim: "#22d3ee",
  white: "#f6f9ff",
  skin: "#f2c194",
  dark: "#2b3350",
} as const;

export const BRIGHT_FOG: Record<"servers" | "cables" | "cloud", string> = {
  servers: "#a9c6e8",
  cables: "#a9e2b9",
  cloud: "#c9b8f2",
};

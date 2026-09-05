export const INK = "#232838";

export const BRIGHT = {
  sky: "#6fb3ec",
  horizon: "#cfe6fd",
  hubGround: "#8fa2cf",
  hubRing: "#5f76b8",
  hubPath: "#7488c2",
  cablesGround: "#54b76e",
  cablesPatch: "#3d9457",
  cablesPath: "#8fdcA3",
  cloudGround: "#9c86e0",
  cloudPatch: "#7e67cc",
  cloudPath: "#c2b2f2",
  corridorWall: "#e8eefc",
  corridorTrim: "#22d3ee",
  white: "#f6f9ff",
  skin: "#f2c194",
  dark: "#2b3350",
} as const;

export const BRIGHT_FOG: Record<"servers" | "cables" | "cloud", string> = {
  servers: "#8fb4dd",
  cables: "#8fd0a4",
  cloud: "#b3a0e6",
};

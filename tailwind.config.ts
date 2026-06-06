import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: "#ff007f",
          purple: "#9d4edd",
          cyan: "#00f0ff",
          green: "#39ff14",
          yellow: "#ffe700",
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "neon-glow": "neonGlow 1.5s ease-in-out infinite alternate",
        "rainbow-glow": "rainbowGlow 4s linear infinite",
      },
      keyframes: {
        neonGlow: {
          "0%": { boxShadow: "0 0 5px #ff007f, 0 0 10px #ff007f" },
          "100%": { boxShadow: "0 0 15px #ff007f, 0 0 25px #ff007f" },
        },
        rainbowGlow: {
          "0%, 100%": { borderColor: "#ff007f" },
          "20%": { borderColor: "#00f0ff" },
          "40%": { borderColor: "#39ff14" },
          "60%": { borderColor: "#ffe700" },
          "80%": { borderColor: "#9d4edd" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

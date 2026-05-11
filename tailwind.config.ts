import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        court: "#2563eb",
      },
    },
  },
  plugins: [],
};

export default config;

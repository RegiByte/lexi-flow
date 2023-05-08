import { mauve, violet } from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";

const scrollbarPlugin = plugin(function ({ addUtilities }) {
  addUtilities({
    ".scrollbar-hidden": {
      "-ms-overflow-style": "none" /* IE and Edge */,
      scrollbarWidth: "none" /* Firefox */,
      "&::-webkit-scrollbar": {
        display: "none",
        width: "0px",
      },
    },
  });
});

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      xxs: "0.625rem",
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      '2xl': "1.5rem",
      '3xl': "1.875rem",
      '4xl': "2.25rem",
      '5xl': "3rem",
      '6xl': "3.75rem",
      '7xl': "4.5rem",
      '8xl': "6rem",
      '9xl': "8rem",
    },

    extend: {
      translate: {
        away: "-10000px",
      },
      data: {
        highlighted: "highlighted",
        selected: "selected",
        disabled: "disabled",
      },
      fontSize: {
        xss: "0.625rem",
      },
      colors: {
        'medium-green': '#b5e5a4',
        ...mauve,
        ...violet,
      },
    },
  },
  plugins: [scrollbarPlugin],
};

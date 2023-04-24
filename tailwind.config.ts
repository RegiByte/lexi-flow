import { mauve, violet } from "@radix-ui/colors";

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      data: {
        highlighted: "highlighted",
        disabled: "disabled",
      },
      colors: {
        ...mauve,
        ...violet,
      },
    },
  },
  plugins: [],
};

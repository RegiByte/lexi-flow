import { EditorTheme } from "../../core/components/Editor/theme";

export const mediumEditorTheme: EditorTheme = {
  prefix: "mde",
  page: "flex flex-col items-center",
  container:{
    editor: "max-w-[740px] w-full bg-white rounded-md shadow-lg text-black/75",
    scroller: "",
    view: "pl-2 relative",
    input: "min-h-[200px] outline-none resize-none relative",
  },
  placeholder: {
    container: "flex pl-1 flex-col text-neutral-400"
  },
  heading: {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-bold",
    h3: "text-xl font-bold",
    h4: "text-lg font-bold",
    h5: "text-base font-bold",
    h6: "text-sm font-bold",
  },
  paragraph: "text-lg tracking-tight leading-7",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "bg-[rgb(240,242,245)] py-1 px-0.5",
  },
  list: {
    ol: "list-decimal list-inside pl-4",
    ul: "list-disc list-inside pl-4",
    listitem: "text-neutral-500 marker:text-neutral-500",
  },
  link: "text-blue-500 hover:underline",
  quote: "border-l-[3px] pl-5 border-black/[84]",
  floatingToolbar: {
    container: "absolute top-0 left-0 flex items-center opacity-0 pointer-events-none translate-x-away translate-y-away"
  }
};

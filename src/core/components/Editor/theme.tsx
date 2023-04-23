import {EditorThemeClasses} from "lexical";

export interface EditorTheme extends EditorThemeClasses {
	prefix?: string;
	placeholder?: {
		container?: string;
		text?: string;
		tip?: string;
	}
	container?: {
		editor?: string;
		shell?: string;
		view?: string;
		input?: string
	},
	toolbar?: {
		container?: string;
	}
}

export const editorTheme: EditorTheme = {
	container: {
		editor: 'flex flex-col w-full h-full overflow-hidden border border-black p-2',
		shell: 'flex flex-col flex-1 overflow-hidden border border-sky-300 p-2',
		view: 'max-h-full flex-1 overflow-auto max-h-[200px] flex flex-col border border-amber-300 pl-4 pr-2 py-2',
		input: "resize-none outline-none caret-black px-2 py-1 border border-green-300"
	},
	placeholder: {
		container: 'overflow-hidden text-md select-none pointer-events-none',
		text: 'text-neutral-500 inline-block',
		tip: 'text-neutral-400 text-xs',
	},
	toolbar: {
		container: 'bg-slate-100 flex gap-3 py-2 px-2 border border-rose-300'
	},
	heading: {
		h1: "text-3xl font-bold",
		h2: "text-2xl font-bold",
		h3: "text-xl font-bold",
		h4: "text-lg font-bold",
		h5: "text-base font-bold",
		h6: "text-sm font-bold",
	},
	text: {
		bold: "font-bold",
		italic: "italic",
		underline: "underline",
		strikethrough: "line-through",
		underlineStrikethrough: "underline line-through",
		code: "bg-[rgb(240,242,245)] py-1 px-0.5"
	},
	list: {
		ol: "list-decimal list-inside pl-4",
		ul: "list-disc list-inside pl-4",
		listitem: "text-red-300 marker:text-blue-500",
	}
}

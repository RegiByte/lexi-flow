import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorTheme } from "../Editor/theme";

export type PlaceholderFn = (isEditable: boolean) => null | JSX.Element;
export const Placeholder: PlaceholderFn = (isEditable) => {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;

  return (
    <div className={theme.placeholder?.container}>
      <span className={theme.placeholder?.text}>{isEditable ? "Start typing..." : "Do not type here dude."}</span>
    </div>
  );
};

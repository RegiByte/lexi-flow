import React, { useEffect, useMemo } from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { EditorTheme, editorTheme } from "./theme";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { Placeholder } from "../Placeholder/placeholder";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { editorNodes } from "./nodes";
import classNames from "classnames";
import { $setBlocksType } from "@lexical/selection";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import CodeHighlightPlugin from "../../plugins/CodeHightlight/codeHighlight";
import ToolbarPlugin from "../../plugins/Toolbar/toolbar";
import { $createParagraphNode, $createTextNode, $getRoot, LexicalEditor } from "lexical";
import { $createRootNode } from "lexical/nodes/LexicalRootNode";
import { createEmptyEditorState } from "lexical/LexicalEditorState";
import { SharedHistoryContext } from "../../context/SharedHistory";
import { prefixClassNames } from "../../helpers/strings";
import EditorView from "./EditorView";

interface EditorProps {
  initialConfig?: Partial<InitialConfigType> & { theme: EditorTheme };
}

export const Editor: React.FC<EditorProps> = ({ initialConfig = {} }) => {
  let theme: EditorTheme = initialConfig.theme ?? editorTheme;
  const { prefix: editorClassPrefix = "lxf" } = theme;
  const editorConfig = useMemo(() => {
    return {
      ...initialConfig,
      editorState: initialConfig.editorState || null,
      namespace: initialConfig.namespace ?? "editor",
      nodes: initialConfig.nodes ?? editorNodes,
      onError: (error: Error) => {
        throw error;
      },
      editable: initialConfig.editable ?? true,
      theme: {
        prefix: editorClassPrefix,
        ...theme,
      },
    };
  }, [editorClassPrefix, initialConfig, theme]);

  const editorClasses = classNames(prefixClassNames("editor-container", editorClassPrefix), theme?.container?.editor);
  const shellClasses = classNames(prefixClassNames("editor-shell", editorClassPrefix), theme?.container?.shell);
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <SharedHistoryContext>
        <div className={editorClasses}>
          <div className={shellClasses}>
            <EditorView classPrefix={editorClassPrefix} />
          </div>
        </div>
      </SharedHistoryContext>
    </LexicalComposer>
  );
};

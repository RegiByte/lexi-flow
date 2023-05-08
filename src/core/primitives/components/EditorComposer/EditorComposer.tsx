import React from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { EditorTheme } from "../../../components/Editor/theme";
import { EditorShell } from "../EditorShell/EditorShell";
import { EditorView, EditorViewProps } from "../EditorView/EditorView";
import useInitialEditorConfig from "../../hooks/useInitialEditorConfig";
import { SharedHistoryContext } from "../../../context/SharedHistory";

interface EditorComposerProps extends EditorViewProps {
  initialConfig?: Partial<InitialConfigType> & { theme?: EditorTheme };
  onError?: (error: Error) => never;
}

export const EditorComposer: React.FC<EditorComposerProps> = ({ initialConfig = {}, onError, ...viewProps }) => {
  const editorConfig = useInitialEditorConfig({
    initialConfig,
    onError,
  });

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <SharedHistoryContext>
        <EditorShell>
          <EditorView {...viewProps} />
        </EditorShell>
      </SharedHistoryContext>
    </LexicalComposer>
  );
};

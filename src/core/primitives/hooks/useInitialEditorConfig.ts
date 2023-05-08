import { editorTheme, EditorTheme } from "../../components/Editor/theme";
import { InitialConfigType } from "@lexical/react/LexicalComposer";
import { editorNodes } from "../../components/Editor/nodes";
import { useMemo } from "react";

const defaultOnError = (error: Error) => {
  throw error;
};

interface UseInitialConfigProps {
  initialConfig?: Partial<InitialConfigType> & { theme?: EditorTheme };
  onError?: (error: Error) => never;
}

export default function useInitialEditorConfig({
  initialConfig = {},
  onError = defaultOnError,
}: UseInitialConfigProps): InitialConfigType {
  const theme: EditorTheme = initialConfig.theme ?? editorTheme;
  const { prefix: editorClassPrefix = "lxf" } = theme;

  return useMemo(() => {
    return {
      ...initialConfig,
      editorState: initialConfig.editorState || null,
      namespace: initialConfig.namespace ?? "editor",
      nodes: initialConfig.nodes ?? editorNodes,
      onError: onError,
      editable: initialConfig.editable ?? true,
      theme: {
        prefix: editorClassPrefix,
        ...theme,
      },
    };
  }, [editorClassPrefix, initialConfig, theme]);
}

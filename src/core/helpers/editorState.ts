import { createEditor, EditorState, LexicalEditor } from "lexical";

export const createEmptyEditorState = (editor?: LexicalEditor): EditorState => {
  return createEditor(editor?._config).getEditorState().clone();
};

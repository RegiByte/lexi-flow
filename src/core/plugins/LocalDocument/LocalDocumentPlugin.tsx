import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { createEditor, EditorState } from "lexical";
import { createEmptyEditorState } from "../../helpers/editorState";

interface PluginProps {
  documentId: string;
  prefix: string;
}

const getStorageKey = (documentId: string, prefix: string) => `${prefix}/${documentId}`;

export const LocalDocumentPlugin: React.FC<PluginProps> = (props) => {
  const { documentId, prefix } = props;
  const [editor] = useLexicalComposerContext();
  const storageKey = useMemo(() => getStorageKey(documentId, prefix), [documentId, prefix]);

  const setStorageState = useCallback(
    (newState: EditorState) => {
      localStorage.setItem(storageKey, JSON.stringify(newState));
    },
    [storageKey],
  );

  const fetchStorageState = useCallback(() => {
    const storageState = localStorage.getItem(storageKey);
    if (!storageState) {
      return createEmptyEditorState(editor);
    }

    try {
      return editor.parseEditorState(storageState);
    } catch (e) {
      throw new Error("[LocalDocumentPlugin] Failed to parse storage state.");
    }
  }, [storageKey, editor.parseEditorState]);

  useEffect(() => {
    const newState = fetchStorageState();
    if (editor.getEditorState().isEmpty() && !newState.isEmpty()) {
      setStorageState(newState);
      editor.setEditorState(newState);
    }
  }, [documentId, prefix]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState, dirtyLeaves, dirtyElements }) => {
        if (dirtyLeaves.size > 0 || dirtyElements.size > 0) {
          setStorageState(editorState);
        }
      }),
    );
  }, [editor]);

  return null;
};

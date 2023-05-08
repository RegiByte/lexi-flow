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

/** LocalDocumentPlugin ---------
 * The LocalDocumentPlugin is a plugin that saves the editor state to localStorage.
 * It is used to persist the editor state across page refreshes.
 * Useful for testing, probably should not be used in a production situation unless you know what you're doing.
 * @param documentId - the documentId to use for the localStorage key
 * @param prefix - the prefix to use for the localStorage key
 * @example
 * <LexicalComposer initialConfig={initialConfig}>
 *   <EditorShell>
 *    <EditorView
 *      richText={true}
 *      plugins={
 *        <>
 *          <LocalDocumentPlugin documentId="my-document" prefix="my-app"/>
 *        </>
 *      }
 *    />
 *   </EditorShell>
 * </LexicalComposer>
 */
export const LocalDocumentPlugin: React.FC<PluginProps> = ({ documentId, prefix }) => {
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
      // We need to wait for the editor to be ready before we can set the editor state
      setTimeout(() => {
        setStorageState(newState);
        editor.setEditorState(newState);
      }, 100)
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

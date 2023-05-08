import { atom, useAtom, useAtomValue } from "jotai";
import { $getSelection, $isParagraphNode, $isRangeSelection, $isTextNode, LexicalEditor } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { getSelectedNode } from "../../helpers/nodes";
import { $isCodeHighlightNode } from "@lexical/code";
import { $isHeadingNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { $isLinkNode } from "@lexical/link";

export type TextFormattingState = "bold" | "italic" | "underline" | "superscript" | "subscript" | "strikethrough" | "code";

// Simple utility type to create a string union of the keys of the activeTextFormattingStatesAtom.
type IsTextFormattingState<T> = T extends TextFormattingState ? `is${Capitalize<T>}` : never;
// Create a union of the keys of the activeTextFormattingStatesAtom.
export type TextFormattingStateKeys = IsTextFormattingState<TextFormattingState>;
// Create a record type from the keys of the activeTextFormattingStatesAtom.
export type ActiveTextFormattingStates = Record<TextFormattingStateKeys, boolean> & {isLink: boolean, isText: boolean}
// Create a list of the keys of the activeTextFormattingStatesAtom.
export type ActiveTextFormattingStatesList = TextFormattingState[];

export const isTextAtom = atom(false);
export const isBoldAtom = atom(false);
export const isItalicAtom = atom(false);
export const isUnderlineAtom = atom(false);
export const isStrikethroughAtom = atom(false);
export const isCodeAtom = atom(false);
export const isSuperscriptAtom = atom(false);
export const isSubscriptAtom = atom(false);
export const isLinkAtom = atom(false);

export const activeTextFormattingStatesAtom = atom<ActiveTextFormattingStates>((get) => {
  return {
    isText: get(isTextAtom),
    isBold: get(isBoldAtom),
    isItalic: get(isItalicAtom),
    isUnderline: get(isUnderlineAtom),
    isStrikethrough: get(isStrikethroughAtom),
    isCode: get(isCodeAtom),
    isSuperscript: get(isSuperscriptAtom),
    isSubscript: get(isSubscriptAtom),
    isLink: get(isLinkAtom),
  };
});

/** activeTextFormattingStatesListAtom -------
 * This atom is used to get a list of active text formatting states.
 * It is used to render the toolbar buttons.
 */
export const activeTextFormattingStatesListAtom = atom<ActiveTextFormattingStatesList>((get) => {
  const activeTextFormattingStates = get(activeTextFormattingStatesAtom);
  return Object.keys(activeTextFormattingStates)
    .filter((key) => {
      return activeTextFormattingStates[key as keyof typeof activeTextFormattingStates];
    })
    .map((key) => key.slice(2).toLowerCase() as TextFormattingState);
});

export default function useTextFormattingStates(
  editor: LexicalEditor,
): [ActiveTextFormattingStates, ActiveTextFormattingStatesList] {
  const [isText, setIsText] = useAtom(isTextAtom);
  const [isLink, setIsLink] = useAtom(isLinkAtom);
  const [isBold, setIsBold] = useAtom(isBoldAtom);
  const [isItalic, setIsItalic] = useAtom(isItalicAtom);
  const [isUnderline, setIsUnderline] = useAtom(isUnderlineAtom);
  const [isStrikethrough, setIsStrikethrough] = useAtom(isStrikethroughAtom);
  const [isCode, setIsCode] = useAtom(isCodeAtom);
  const [isSuperscript, setIsSuperscript] = useAtom(isSuperscriptAtom);
  const [isSubscript, setIsSubscript] = useAtom(isSubscriptAtom);

  const updateTextFormattingStates = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        setIsText(false);
        return;
      }

      const node = getSelectedNode(selection);

      if (node === null) {
        setIsText(false);
        return;
      }

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsSubscript(selection.hasFormat("subscript"));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== "") {
        setIsText($isTextNode(node) || $isParagraphNode(node) || $isHeadingNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [
    editor,
    setIsBold,
    setIsCode,
    setIsItalic,
    setIsStrikethrough,
    setIsSubscript,
    setIsSuperscript,
    setIsText,
    setIsUnderline,
    setIsLink
  ]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateTextFormattingStates);

    return () => {
      document.removeEventListener("selectionchange", updateTextFormattingStates);
    };
  }, [updateTextFormattingStates]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateTextFormattingStates();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, setIsText, updateTextFormattingStates]);

  const activeStates = useAtomValue(activeTextFormattingStatesAtom);
  const activeStatesList = useAtomValue(activeTextFormattingStatesListAtom);

  return [activeStates, activeStatesList];
}
